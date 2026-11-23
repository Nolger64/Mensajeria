import { randomUUID } from 'node:crypto';
import express from 'express';
import { authorizeRoles } from './auth.mjs';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
const MAX_BOOKING_DAYS = 90;
const CONSULTATION = {
  id: 'primera-cita',
  name: 'Consulta general',
  description: 'Consulta con un especialista sin elegir un tratamiento. La sede te indicará el precio.',
  durationMinutes: 30,
  price: null,
};
const validDate = /^\d{4}-\d{2}-\d{2}$/;
const validTime = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const nearFuture = (start) => start > Date.now() && start <= Date.now() + MAX_BOOKING_DAYS * DAY;
const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;
const text = (value) => typeof value === 'string' ? value.trim() : '';

function visibleSession({ sectionMinutes, ...session }) {
  return session;
}

function visibleSlot({ windowIds, ...slot }) {
  return slot;
}

function localTime(date, time) {
  if (typeof date !== 'string' || typeof time !== 'string' || !validDate.test(date) || !validTime.test(time)) return NaN;
  const midnight = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== date) return NaN;
  return Date.parse(`${date}T${time}:00-05:00`);
}

export function mountSpa(app, { state, getBranches, getUsers, authenticateToken }) {
  const router = express.Router();
  const clients = authorizeRoles('cliente');
  const admins = authorizeRoles('administrador');
  const treatmentTeam = authorizeRoles('administrador', 'especialista');
  let agenda = state.read('agenda', { services: [], sessions: [], windows: [], appointments: [] });

  if (!agenda.sessions) {
    // Los bloques anteriores siguen disponibles y conservan sus identificadores.
    const sessions = [];
    const latestByDay = new Map();
    const windows = [...agenda.windows].sort((a, b) => a.startsAt - b.startsAt).map((window) => {
      const key = `${window.branchId}:${window.date}`;
      let session = latestByDay.get(key);
      if (!session || window.startsAt > session.endsAt) {
        session = {
          id: randomUUID(), name: 'Sesión', branchId: window.branchId,
          date: window.date, startsAt: window.startsAt, endsAt: window.endsAt,
        };
        sessions.push(session);
        latestByDay.set(key, session);
      } else {
        session.endsAt = Math.max(session.endsAt, window.endsAt);
      }
      return { ...window, sessionId: session.id };
    });
    save({ sessions, windows });
  }

  function save(changes) {
    const next = { ...agenda, ...changes };
    state.write('agenda', next);
    agenda = next;
  }

  function isScheduled(appointment) {
    return appointment.status === 'confirmada' && appointment.endsAt > Date.now();
  }

  function hasFutureAppointments(field, id) {
    return agenda.appointments.some((appointment) => appointment[field] === id && isScheduled(appointment));
  }

  function resolveService(input) {
    const name = text(input.name);
    const description = text(input.description);
    const { durationMinutes, price, active = true } = input;
    if (!name || name.length > 100 || description.length > 1000 ||
        !Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 240 ||
        durationMinutes % 15 !== 0 || !Number.isSafeInteger(price) || price < 0 || price > 100000000 ||
        typeof active !== 'boolean') return null;
    return { name, description, durationMinutes, price, active };
  }

  function findSpecialist(id) {
    return getUsers().find((user) => user.id === id && user.role === 'especialista');
  }

  function findBookableService(id) {
    if (id == null || id === CONSULTATION.id) return CONSULTATION;
    return agenda.services.find((service) => service.id === id && service.active);
  }

  function findActiveBranch(id) {
    return getBranches().find((branch) => branch.id === id && branch.active !== false);
  }

  function resolveOffering(ids, minutes) {
    if (!Array.isArray(ids)) return null;
    const active = agenda.services.filter((service) => service.active);
    const selected = ids.length === 0 && active.length === 0 ? [CONSULTATION.id] : [...new Set(ids)];
    if (!selected.length) return null;
    const consultations = selected.includes(CONSULTATION.id);
    const serviceIds = selected.filter((id) => id !== CONSULTATION.id);
    if ((consultations && CONSULTATION.durationMinutes > minutes) ||
        serviceIds.some((id) => !active.some((service) => service.id === id && service.durationMinutes <= minutes))) {
      return null;
    }
    return { serviceIds, consultations };
  }

  function specialistHasOverlap(id, startsAt, endsAt) {
    return agenda.windows.some((window) => window.specialistId === id &&
      overlaps(startsAt, endsAt, window.startsAt, window.endsAt));
  }

  function hasWindowBookings(windowId) {
    return agenda.appointments.some((appointment) => isScheduled(appointment) &&
      (appointment.windowIds ?? [appointment.windowId]).includes(windowId));
  }

  function getAvailability(branchId, serviceId, date, clientId, excludedId) {
    const service = findBookableService(serviceId);
    if (!service || !findActiveBranch(branchId) || !Number.isFinite(localTime(date, '00:00'))) return null;

    const duration = service.durationMinutes * MINUTE;
    const slots = [];
    const bookings = agenda.appointments.filter((appointment) =>
      appointment.id !== excludedId && appointment.status !== 'cancelada'
    );
    const sessions = agenda.sessions.filter((session) => session.branchId === branchId && session.date === date);

    for (const session of sessions) {
      const roster = new Map();
      for (const window of agenda.windows) {
        const offersService = service === CONSULTATION ? window.consultations !== false : window.serviceIds.includes(service.id);
        if (window.sessionId !== session.id || !offersService) continue;
        const windows = roster.get(window.specialistId) ?? [];
        windows.push(window);
        roster.set(window.specialistId, windows);
      }

      for (const [specialistId, windows] of roster) {
        const specialist = findSpecialist(specialistId);
        if (!specialist) continue;
        const relevantBookings = bookings.filter((appointment) =>
          appointment.specialistId === specialistId || appointment.clientId === clientId
        );
        const ranges = [];
        for (const window of windows.sort((a, b) => a.startsAt - b.startsAt)) {
          const last = ranges.at(-1);
          if (last && window.startsAt <= last.endsAt) {
            last.endsAt = Math.max(last.endsAt, window.endsAt);
            last.windows.push(window);
          } else {
            ranges.push({ startsAt: window.startsAt, endsAt: window.endsAt, windows: [window] });
          }
        }
        for (const range of ranges) {
          for (let startsAt = range.startsAt; startsAt + duration <= range.endsAt; startsAt += duration) {
            const endsAt = startsAt + duration;
            if (!nearFuture(startsAt) || relevantBookings.some((appointment) =>
              overlaps(startsAt, endsAt, appointment.startsAt, appointment.endsAt)
            )) continue;

            const covered = range.windows.filter((window) => overlaps(startsAt, endsAt, window.startsAt, window.endsAt));
            slots.push({
              windowId: covered[0].id,
              windowIds: covered.map((window) => window.id),
              sessionId: session.id,
              startsAt,
              endsAt,
              specialistName: specialist.name,
            });
          }
        }
      }
    }
    return slots.sort((first, second) => first.startsAt - second.startsAt);
  }

  function visibleAppointment(appointment, user) {
    const { clientId, specialistId, windowIds, customerName: bookedName, ...details } = appointment;
    const window = agenda.windows.find((entry) => entry.id === appointment.windowId);
    const session = agenda.sessions.find((entry) => entry.id === (appointment.sessionId || window?.sessionId));
    const visible = {
      ...details,
      serviceName: appointment.serviceId === null ? CONSULTATION.name : appointment.serviceName,
      specialistName: findSpecialist(specialistId)?.name || appointment.specialistName,
      sessionName: appointment.sessionName || session?.name,
    };
    if (user.role === 'cliente') return visible;
    const customerName = getUsers().find((entry) => entry.id === clientId)?.name || bookedName;
    return { ...visible, customerName, specialistId };
  }

  function selectSlot(input, clientId, excludedId) {
    const { branchId, serviceId, date, windowId, startsAt } = input;
    return getAvailability(branchId, serviceId, date, clientId, excludedId)
      ?.find((slot) => slot.windowId === windowId && slot.startsAt === startsAt);
  }

  function appointmentFor(input, client, slot) {
    const branch = getBranches().find((entry) => entry.id === input.branchId);
    const service = findBookableService(input.serviceId);
    const window = agenda.windows.find((entry) => entry.id === input.windowId);
    const session = agenda.sessions.find((entry) => entry.id === window.sessionId);
    return {
      windowId: window.id,
      windowIds: slot.windowIds,
      sessionId: session.id,
      sessionName: session.name,
      branchId: branch.id,
      branchName: branch.name,
      branchAddress: branch.address,
      serviceId: service === CONSULTATION ? null : service.id,
      serviceName: service.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
      specialistId: window.specialistId,
      specialistName: slot.specialistName,
      clientId: client.id,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      status: 'confirmada',
    };
  }

  router.use(authenticateToken, authorizeRoles('cliente', 'administrador', 'especialista'));

  router.get('/options', authorizeRoles('cliente', 'administrador'), (req, res) => {
    const admin = req.user.role === 'administrador';
    const data = {
      branches: getBranches().filter((branch) => admin || branch.active !== false)
        .map(({ id, name, address, active }) => ({ id, name, address, active: active !== false })),
      services: agenda.services.filter((service) => admin || service.active),
      firstVisit: CONSULTATION,
    };
    if (admin) {
      data.specialists = getUsers().filter((user) => user.role === 'especialista')
        .map(({ id, name }) => ({ id, name }));
      data.sessions = agenda.sessions.filter((session) => session.endsAt > Date.now())
        .sort((a, b) => a.startsAt - b.startsAt).map(visibleSession);
      data.windows = agenda.windows.filter((window) => window.endsAt > Date.now() && findSpecialist(window.specialistId))
        .sort((a, b) => a.startsAt - b.startsAt);
    }
    res.json({ data });
  });

  router.post('/services', admins, (req, res) => {
    const service = resolveService(req.body);
    if (!service) return res.status(400).json({ message: 'Revisa el nombre, precio y duración del tratamiento.' });
    const created = { id: randomUUID(), ...service };
    save({ services: [...agenda.services, created] });
    res.status(201).json({ data: created });
  });

  router.patch('/services/:id', admins, (req, res) => {
    const current = agenda.services.find((service) => service.id === req.params.id);
    if (!current) return res.sendStatus(404);
    const service = resolveService({ ...current, ...req.body });
    if (!service) return res.status(400).json({ message: 'Revisa el nombre, precio y duración del tratamiento.' });
    const updated = { id: current.id, ...service };
    save({ services: agenda.services.map((entry) => entry.id === current.id ? updated : entry) });
    res.json({ data: updated });
  });

  router.post('/sessions', admins, (req, res) => {
    const { branchId, date, startDate = date, endDate = startDate, start, end, assignments } = req.body ?? {};
    const name = text(req.body?.name);
    const firstDay = localTime(startDate, '00:00');
    const lastDay = localTime(endDate, '00:00');
    const firstStart = localTime(startDate, start);
    const firstEnd = localTime(startDate, end);
    const lastStart = localTime(endDate, start);
    if (!findActiveBranch(branchId) || !name || name.length > 80 || !(lastDay >= firstDay) ||
        !(firstEnd > firstStart) || firstEnd <= Date.now() || !(lastStart <= Date.now() + MAX_BOOKING_DAYS * DAY)) {
      return res.status(400).json({ message: 'Revisa la sede, las fechas y las horas del horario. Puedes publicarlo dentro de los próximos 90 días.' });
    }
    if (!Array.isArray(assignments) || !assignments.length) {
      return res.status(400).json({ message: 'Elige al menos un especialista para publicar el horario.' });
    }

    const assigned = new Set();
    const roster = [];
    for (const assignment of assignments) {
      const specialist = findSpecialist(assignment?.specialistId);
      const offering = resolveOffering(assignment?.serviceIds ?? [], (firstEnd - firstStart) / MINUTE);
      if (!specialist || assigned.has(specialist.id) || !offering) {
        return res.status(400).json({ message: 'Elige un tratamiento que quepa en el horario o selecciona Consulta general.' });
      }
      assigned.add(specialist.id);
      roster.push({ specialist, offering });
    }

    const sessions = [];
    const windows = [];
    for (let day = firstDay; day <= lastDay; day += DAY) {
      const dayLabel = new Date(day).toISOString().slice(0, 10);
      const offset = day - firstDay;
      const startsAt = firstStart + offset;
      const endsAt = firstEnd + offset;
      if (agenda.sessions.some((session) => session.branchId === branchId &&
          overlaps(startsAt, endsAt, session.startsAt, session.endsAt))) {
        return res.status(409).json({ message: `La sede ya tiene un horario que coincide el ${dayLabel}.` });
      }

      const session = { id: randomUUID(), name, branchId, date: dayLabel, startsAt, endsAt };
      for (const { specialist, offering } of roster) {
        if (specialistHasOverlap(specialist.id, startsAt, endsAt)) {
          return res.status(409).json({ message: `${specialist.name} ya tiene disponibilidad publicada el ${dayLabel} en ese intervalo.` });
        }
        windows.push({
          id: randomUUID(), sessionId: session.id, branchId, date: dayLabel, startsAt, endsAt,
          specialistId: specialist.id, ...offering,
        });
      }
      sessions.push(session);
    }

    save({ sessions: [...agenda.sessions, ...sessions], windows: [...agenda.windows, ...windows] });
    res.status(201).json({ data: { ...sessions[0], daysPublished: sessions.length } });
  });

  router.delete('/sessions/:id', admins, (req, res) => {
    const session = agenda.sessions.find((entry) => entry.id === req.params.id);
    if (!session) return res.sendStatus(404);
    const windows = agenda.windows.filter((window) => window.sessionId === session.id);
    if (windows.some((window) => hasWindowBookings(window.id))) {
      return res.status(409).json({ message: 'Cancela o reprograma las citas de la sesión antes de retirarla.' });
    }
    save({
      sessions: agenda.sessions.filter((entry) => entry.id !== session.id),
      windows: agenda.windows.filter((window) => window.sessionId !== session.id),
    });
    res.status(204).end();
  });

  router.post('/windows', admins, (req, res) => {
    const { sessionId, specialistId, serviceIds = [], start, end } = req.body;
    let session = agenda.sessions.find((entry) => entry.id === sessionId);
    if (sessionId && !session) return res.sendStatus(404);

    const branchId = session?.branchId ?? req.body.branchId;
    const date = session?.date ?? req.body.date;
    const startsAt = localTime(date, start);
    const endsAt = localTime(date, end);
    const minutes = session ? (session.endsAt - session.startsAt) / MINUTE : (endsAt - startsAt) / MINUTE;
    const offering = resolveOffering(serviceIds, minutes);
    if (!findActiveBranch(branchId) || !findSpecialist(specialistId) || !nearFuture(startsAt) ||
        !(endsAt > startsAt) || !offering) {
      return res.status(400).json({ message: 'Revisa las horas y elige un tratamiento o Consulta general para el especialista.' });
    }
    if (specialistHasOverlap(specialistId, startsAt, endsAt)) {
      return res.status(409).json({ message: 'El especialista ya tiene disponibilidad publicada durante ese horario.' });
    }
    const sessions = agenda.sessions;
    if (!session) {
      // Compatibilidad con los clientes que publicaban bloques sin una sesión explícita.
      session = sessions.find((entry) => entry.branchId === branchId &&
        entry.startsAt <= startsAt && entry.endsAt >= endsAt);
      if (!session && sessions.some((entry) => entry.branchId === branchId &&
        overlaps(startsAt, endsAt, entry.startsAt, entry.endsAt))) {
        return res.status(409).json({ message: 'El bloque se cruza con una sesión. Selecciona la sesión y ajusta las horas.' });
      }
    }
    if (session && (startsAt < session.startsAt || endsAt > session.endsAt)) {
      return res.status(400).json({ message: 'La disponibilidad del especialista debe quedar dentro de la sesión.' });
    }
    const createdSession = session || {
      id: randomUUID(), name: 'Sesión', branchId, date, startsAt, endsAt,
    };
    const window = { id: randomUUID(), sessionId: createdSession.id, branchId, specialistId, ...offering, date, startsAt, endsAt };
    save({ sessions: session ? sessions : [...sessions, createdSession], windows: [...agenda.windows, window] });
    res.status(201).json({ data: window });
  });

  router.delete('/windows/:id', admins, (req, res) => {
    if (!agenda.windows.some((window) => window.id === req.params.id)) return res.sendStatus(404);
    if (hasWindowBookings(req.params.id)) {
      return res.status(409).json({ message: 'Cancela o reprograma las reservas de este horario antes de retirarlo.' });
    }
    save({ windows: agenda.windows.filter((window) => window.id !== req.params.id) });
    res.status(204).end();
  });

  router.get('/dates', clients, (req, res) => {
    const { branchId, serviceId } = req.query;
    if (!findActiveBranch(branchId) || !findBookableService(serviceId)) {
      return res.status(400).json({ message: 'Selecciona una sede y un tipo de cita disponible.' });
    }
    const dates = new Set(agenda.sessions.filter((session) => session.branchId === branchId &&
      session.endsAt > Date.now()).map((session) => session.date));
    res.json({ data: [...dates].sort() });
  });

  function availableSlots(req) {
    const { branchId, serviceId, date, rebookingId } = req.query;
    const ownAppointment = agenda.appointments.find((entry) => entry.id === rebookingId && entry.clientId === req.user.id);
    return getAvailability(branchId, serviceId, date, req.user.id, ownAppointment?.id);
  }

  router.get('/availability', clients, (req, res) => {
    const slots = availableSlots(req);
    if (!slots) return res.status(400).json({ message: 'Selecciona una sede, un tipo de cita y una fecha válida.' });
    res.json({ data: slots.map(visibleSlot) });
  });

  router.get('/schedule', clients, (req, res) => {
    const slots = availableSlots(req);
    if (!slots) return res.status(400).json({ message: 'Selecciona una sede, un tipo de cita y una fecha válida.' });
    const { branchId, date } = req.query;
    const sessions = agenda.sessions.filter((session) => session.branchId === branchId && session.date === date)
      .sort((a, b) => a.startsAt - b.startsAt)
      .map((session) => ({ ...visibleSession(session), slots: slots.filter((slot) => slot.sessionId === session.id).map(visibleSlot) }));
    res.json({ data: sessions });
  });

  router.get('/appointments', (req, res) => {
    const visible = agenda.appointments.filter((entry) => (
      req.user.role === 'administrador' ||
      (req.user.role === 'especialista' ? entry.specialistId === req.user.id : entry.clientId === req.user.id)
    ));
    const upcomingFirst = (a, b) => {
      const aUpcoming = isScheduled(a);
      const bUpcoming = isScheduled(b);
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      return aUpcoming ? a.startsAt - b.startsAt : b.startsAt - a.startsAt;
    };
    res.json({ data: visible.sort(upcomingFirst).map((entry) => visibleAppointment(entry, req.user)) });
  });

  router.post('/appointments', clients, (req, res) => {
    const slot = selectSlot(req.body, req.user.id);
    if (!slot) return res.status(409).json({ message: 'El horario ya no está disponible. Consulta los horarios nuevamente.' });
    const appointment = {
      id: randomUUID(),
      ...appointmentFor(req.body, req.user, slot),
      customerName: req.user.name,
    };
    save({ appointments: [...agenda.appointments, appointment] });
    res.status(201).json({ data: visibleAppointment(appointment, req.user) });
  });

  router.patch('/appointments/:id/reschedule', clients, (req, res) => {
    const current = agenda.appointments.find((entry) => entry.id === req.params.id && entry.clientId === req.user.id);
    if (!current) return res.sendStatus(404);
    if (current.status !== 'confirmada' || current.startsAt <= Date.now()) {
      return res.status(409).json({ message: 'Esta cita ya no se puede reprogramar.' });
    }
    const slot = selectSlot(req.body, req.user.id, current.id);
    if (!slot) return res.status(409).json({ message: 'El horario nuevo ya no está disponible. Conservamos tu cita actual.' });
    const updated = { ...current, ...appointmentFor(req.body, req.user, slot) };
    save({ appointments: agenda.appointments.map((entry) => entry.id === current.id ? updated : entry) });
    res.json({ data: visibleAppointment(updated, req.user) });
  });

  router.patch('/appointments/:id/cancel', authorizeRoles('cliente', 'administrador'), (req, res) => {
    const current = agenda.appointments.find((entry) => entry.id === req.params.id &&
      (req.user.role === 'administrador' || entry.clientId === req.user.id));
    if (!current) return res.sendStatus(404);
    if (current.status !== 'confirmada' || current.startsAt <= Date.now()) {
      return res.status(409).json({ message: 'Solo puedes cancelar una cita que todavía no ha comenzado.' });
    }
    const updated = { ...current, status: 'cancelada' };
    save({ appointments: agenda.appointments.map((entry) => entry.id === current.id ? updated : entry) });
    res.json({ data: visibleAppointment(updated, req.user) });
  });

  router.patch('/appointments/:id/outcome', treatmentTeam, (req, res) => {
    const current = agenda.appointments.find((entry) => entry.id === req.params.id &&
      (req.user.role === 'administrador' || entry.specialistId === req.user.id));
    if (!current) return res.sendStatus(404);
    const { status } = req.body;
    if (!['atendida', 'no_asistio'].includes(status)) return res.status(400).json({ message: 'Indica el resultado de la cita.' });
    if (current.status !== 'confirmada' || current.startsAt > Date.now()) {
      return res.status(409).json({ message: 'Puedes registrar el resultado una vez iniciada la cita.' });
    }
    const updated = { ...current, status };
    save({ appointments: agenda.appointments.map((entry) => entry.id === current.id ? updated : entry) });
    res.json({ data: visibleAppointment(updated, req.user) });
  });

  app.use('/api/spa', router);
  return { hasFutureAppointments };
}

