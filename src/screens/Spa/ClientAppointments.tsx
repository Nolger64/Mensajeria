import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { formatOrderAmount } from '../../services/orderDisplay';
import { spaApi, spaDayLabel, spaTime, type Appointment, type AppointmentSlot, type ScheduledSession } from '../../services/spaApi';
import { useOperationStyles } from '../../theme/operationStyles';
import { Action, AppointmentCard, Choice, Feedback, rowStyle, SpaPage } from './shared';
import { useAgenda } from './useAgenda';

export function ClientAppointments({ token }: { token: string }) {
  const styles = useOperationStyles();
  const agenda = useAgenda(token, true);
  const [branchId, setBranchId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [datesResult, setDatesResult] = useState<{ key: string; data: string[]; error?: string }>();
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot>();
  const [slotsResult, setSlotsResult] = useState<{ key: string; data: ScheduledSession[]; error?: string }>();
  const [rebooking, setRebooking] = useState<Appointment>();
  const [cancelId, setCancelId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const rebookingId = rebooking?.id;
  const datesKey = branchId && serviceId ? `${branchId}-${serviceId}-${rebookingId}-${revision}` : '';
  const slotsKey = datesKey && date ? `${datesKey}-${date}` : '';

  useEffect(() => {
    if (!datesKey) return;
    let current = true;
    spaApi(token).dates({ branchId, serviceId, rebookingId })
      .then((data) => { if (current) setDatesResult({ key: datesKey, data }); })
      .catch((failure) => {
        if (current) setDatesResult({ key: datesKey, data: [], error: failure.message });
      });
    return () => { current = false; };
  }, [branchId, serviceId, rebookingId, token, datesKey]);

  useEffect(() => {
    if (!slotsKey) return;
    let current = true;
    spaApi(token).schedule({ branchId, serviceId, date, rebookingId })
      .then((data) => { if (current) setSlotsResult({ key: slotsKey, data }); })
      .catch((failure) => {
        if (current) setSlotsResult({ key: slotsKey, data: [], error: failure.message });
      });
    return () => { current = false; };
  }, [branchId, serviceId, date, rebookingId, token, slotsKey]);

  const currentDates = datesResult?.key === datesKey ? datesResult : undefined;
  const currentSlots = slotsResult?.key === slotsKey ? slotsResult : undefined;
  const dates = currentDates?.data ?? [];
  const sessions = currentSlots?.data ?? [];
  const checking = Boolean((datesKey && !currentDates) || (slotsKey && !currentSlots));
  const availabilityError = currentDates?.error || currentSlots?.error;

  function resetDate() {
    setDate('');
    setSelectedSlot(undefined);
    setError('');
  }

  async function reserve() {
    if (!selectedSlot || saving) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await spaApi(token).reserve({
        branchId, serviceId, date, windowId: selectedSlot.windowId, startsAt: selectedSlot.startsAt,
      }, rebookingId);
      resetDate();
      setRebooking(undefined);
      setNotice(rebooking ? 'Cita reprogramada.' : 'Cita confirmada. Consulta los detalles en Mis citas.');
      await agenda.reload();
    } catch (failure) {
      setError((failure as Error).message);
      setSelectedSlot(undefined);
    } finally {
      setRevision((value) => value + 1);
      setSaving(false);
    }
  }

  async function cancel(id: string) {
    if (saving) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await spaApi(token).cancel(id);
      setCancelId('');
      if (rebookingId === id) {
        setRebooking(undefined);
        resetDate();
      }
      setNotice('Cita cancelada.');
      setRevision((value) => value + 1);
      await agenda.reload();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const { branches = [], services = [], firstVisit } = agenda.options ?? {};
  const options = firstVisit ? [firstVisit, ...services] : services;
  const service = options.find((entry) => entry.id === serviceId);
  return (
    <SpaPage>
      <Text style={styles.title}>Mis citas</Text>
      <Feedback error={agenda.error || error} notice={notice} loading={agenda.loading} />
      {!agenda.loading && !agenda.appointments.length && <Text style={styles.text}>Todavía no tienes citas.</Text>}
      {agenda.appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment}>
          {appointment.status === 'confirmada' && appointment.startsAt > agenda.now && (
            <View style={rowStyle}>
              {cancelId === appointment.id ? (
                <>
                  <Action label="Confirmar cancelación" onPress={() => cancel(appointment.id)} disabled={saving} />
                  <Action label="Conservar cita" onPress={() => setCancelId('')} secondary />
                </>
              ) : (
                <>
                  <Action label="Reprogramar" onPress={() => {
                    resetDate();
                    setBranchId(appointment.branchId);
                    setServiceId(appointment.serviceId ?? firstVisit?.id ?? '');
                    setRebooking(appointment);
                    setRevision((value) => value + 1);
                  }} disabled={saving} secondary />
                  <Action label="Cancelar cita" onPress={() => setCancelId(appointment.id)} disabled={saving} secondary />
                </>
              )}
            </View>
          )}
        </AppointmentCard>
      ))}

      <Text style={styles.title}>{rebooking ? 'Reprogramar cita' : 'Reservar cita'}</Text>
      {rebooking && <Action label="Conservar horario actual" onPress={() => {
        setRebooking(undefined);
        resetDate();
      }} disabled={saving} secondary />}
      <View style={styles.card}>
        <Text style={styles.heading}>Sede</Text>
        <View style={rowStyle}>
          {branches.map((branch) => <Choice key={branch.id} selected={branch.id === branchId} disabled={saving}
            onPress={() => { setBranchId(branch.id); resetDate(); }}>{branch.name}</Choice>)}
        </View>
        <Text style={styles.heading}>Tipo de cita</Text>
        <View style={rowStyle}>
          {options.map((entry) => <Choice key={entry.id} selected={entry.id === serviceId} disabled={saving}
            onPress={() => { setServiceId(entry.id); resetDate(); }}>
            {entry.name} · {entry.durationMinutes} min
          </Choice>)}
        </View>
        {!!service?.description && <Text style={styles.text}>{service.description}</Text>}
        {service?.price != null && <Text style={styles.text}>{formatOrderAmount(service.price)}</Text>}
        {!agenda.loading && !branches.length && (
          <Text style={styles.text}>Todavía no hay sedes disponibles para reservar.</Text>
        )}
      </View>
      {!!branchId && !!serviceId && (
        <View style={styles.card}>
          <Text style={styles.heading}>Fecha y hora de Bogotá</Text>
          <Feedback loading={checking} error={availabilityError} />
          {!checking && !availabilityError && !dates.length && <Text style={styles.text}>No quedan fechas disponibles para esta selección.</Text>}
          <View style={rowStyle}>
            {dates.map((day) => <Choice key={day} selected={day === date} disabled={saving}
              onPress={() => { setDate(day); setSelectedSlot(undefined); setError(''); }}>{spaDayLabel(day)}</Choice>)}
          </View>
          {!!date && !checking && !availabilityError && !sessions.length && (
            <Text style={styles.text}>No hay sesiones publicadas para esta fecha.</Text>
          )}
          {sessions.map((session) => {
            const freeSlots = session.slots.filter((slot) => slot.startsAt > agenda.now);
            const canReserve = selectedSlot && freeSlots.some((slot) =>
              slot.windowId === selectedSlot.windowId && slot.startsAt === selectedSlot.startsAt
            );
            return (
              <View key={session.id} style={styles.card}>
                <Text style={styles.heading}>{session.name}</Text>
                <Text style={styles.text}>{spaTime(session.startsAt)} a {spaTime(session.endsAt)}</Text>
                {!freeSlots.length && (
                  <Text style={styles.text}>Sin especialistas disponibles para esta cita en la sesión.</Text>
                )}
                <View style={rowStyle}>
                  {freeSlots.map((slot) => <Choice key={`${slot.windowId}-${slot.startsAt}`}
                    selected={selectedSlot?.windowId === slot.windowId && selectedSlot.startsAt === slot.startsAt}
                    disabled={saving} onPress={() => setSelectedSlot(slot)}>
                    {spaTime(slot.startsAt)} a {spaTime(slot.endsAt)} · {slot.specialistName}
                  </Choice>)}
                </View>
                {canReserve && (
                  <Action label={saving ? 'Guardando…' : rebooking ? 'Confirmar cambio' : 'Confirmar cita'}
                    onPress={reserve} disabled={saving || checking} />
                )}
              </View>
            );
          })}
        </View>
      )}
    </SpaPage>
  );
}
