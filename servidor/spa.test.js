const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const { once } = require('node:events');
const { existsSync, mkdtempSync, rmdirSync, unlinkSync } = require('node:fs');
const net = require('node:net');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { test } = require('node:test');
const { setTimeout: delay } = require('node:timers/promises');

async function freePort() {
  const socket = net.createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  socket.close();
  await once(socket, 'close');
  return port;
}

test('Aura Spa: personal, horarios por tratamiento, consulta general y persistencia', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'aura-spa-test-'));
  const database = join(dir, 'agenda.sqlite');
  const password = `Aa1!${randomBytes(16).toString('hex')}`;
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    FHS_SANDBOX: 'false',
    FHS_DATABASE_PATH: database,
    JWT_SECRET: randomBytes(32).toString('hex'),
    FHS_ADMIN_NAME: 'Administración',
    FHS_ADMIN_EMAIL: 'admin@aura.invalid',
    FHS_ADMIN_PASSWORD: password,
  };
  let child;
  let base;

  async function request(path, token, method = 'GET', payload) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (payload) headers['Content-Type'] = 'application/json';
    const response = await fetch(`${base}/api${path}`, { method, headers, body: payload && JSON.stringify(payload) });
    return { ...await response.json().catch(() => ({})), status: response.status };
  }

  async function expectRequest(status, ...params) {
    const result = await request(...params);
    assert.equal(result.status, status, `${params[2] || 'GET'} ${params[0]}: ${result.message || ''}`);
    return result;
  }

  async function boot() {
    const port = await freePort();
    base = `http://127.0.0.1:${port}`;
    child = spawn(process.execPath, [join(__dirname, 'server.js')], {
      env: { ...env, PORT: String(port) },
      stdio: 'ignore',
    });
    for (let attempt = 0; attempt < 80; attempt++) {
      assert.equal(child.exitCode, null, 'El servidor terminó al iniciar');
      const status = await request('/health').then((result) => result.status).catch(() => 0);
      if (status === 200) return;
      await delay(100);
    }
    assert.fail('El servidor no respondió');
  }

  async function stop() {
    if (child && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
  }

  try {
    await boot();
    const admin = await expectRequest(200, '/auth/login', undefined, 'POST', { email: env.FHS_ADMIN_EMAIL, password });
    const register = (name, role, token) => expectRequest(201, '/auth/register', token, 'POST', {
      name, role, email: `${name}@aura.invalid`, password,
    });
    const client = await register('Cliente', 'cliente');
    const other = await register('OtraCuenta', 'cliente');
    const courier = await register('Repartidor', 'repartidor', admin.token);
    const specialist = await register('Especialista', 'especialista', admin.token);
    const secondSpecialist = await register('SegundoEspecialista', 'especialista', admin.token);
    await expectRequest(401, '/spa/options');
    await expectRequest(403, '/spa/appointments', courier.token);
    await expectRequest(403, '/orders', specialist.token);
    await expectRequest(403, '/auth/register', client.token, 'POST', {
      name: 'Cuenta', role: 'especialista', email: 'escala@aura.invalid', password,
    });
    await expectRequest(403, '/spa/services', client.token, 'POST', {});
    await expectRequest(400, '/stores', admin.token, 'POST', { name: 'Tienda ajena', address: 'Fuera', category: 'farmacia' });

    const { data: north } = await expectRequest(201, '/stores', admin.token, 'POST', { name: 'Aura Norte', address: 'Sede norte' });
    const { data: south } = await expectRequest(201, '/stores', admin.token, 'POST', { name: 'Aura Sur', address: 'Sede sur' });
    const staffPath = (id) => `/auth/users/${id}`;
    await expectRequest(403, staffPath(specialist.user.id), client.token, 'PATCH', { name: 'No autorizado' });
    await expectRequest(403, staffPath(courier.user.id), specialist.token, 'DELETE');
    await expectRequest(409, staffPath(courier.user.id), admin.token, 'PATCH', { email: specialist.user.email });
    const { data: editedCourier } = await expectRequest(200, staffPath(courier.user.id), admin.token, 'PATCH', {
      name: 'Repartidor editado', email: 'reparto-nuevo@aura.invalid', phone: '+573000000010',
      vehicle: 'bici', vehicleModel: 'Bicicleta urbana', plate: '',
    });
    assert.equal(editedCourier.role, 'repartidor');
    assert.equal(editedCourier.email, 'reparto-nuevo@aura.invalid');
    assert.equal(editedCourier.phone, '+573000000010');
    assert.equal(editedCourier.password, undefined);
    const { data: fleet } = await expectRequest(200, '/workers', admin.token);
    assert.equal(fleet.find((entry) => entry.id === courier.user.id).name, editedCourier.name);
    assert.equal(fleet.find((entry) => entry.id === courier.user.id).vehicle, 'bici');
    await expectRequest(401, '/auth/login', undefined, 'POST', { email: courier.user.email, password });
    await expectRequest(200, '/auth/login', undefined, 'POST', { email: editedCourier.email, password });

    const specialistName = 'Especialista actualizada';
    const { data: editedSpecialist } = await expectRequest(200, staffPath(specialist.user.id), admin.token, 'PATCH', {
      name: specialistName, phone: '+573000000011',
    });
    assert.equal(editedSpecialist.name, specialistName);
    assert.equal(editedSpecialist.role, 'especialista');
    const { data: initialOptions } = await expectRequest(200, '/spa/options', client.token);
    assert.equal(initialOptions.services.length, 0);
    assert.equal(initialOptions.firstVisit.price, null);

    const date = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    const initialAssignment = [{ specialistId: specialist.user.id }];
    const early = { branchId: north.id, date, name: 'Mañana', start: '09:00', end: '13:00', assignments: initialAssignment };
    const late = { ...early, name: 'Tarde', start: '14:00', end: '18:00' };
    await expectRequest(403, '/spa/sessions', client.token, 'POST', early);
    await expectRequest(400, '/spa/sessions', admin.token, 'POST', { ...early, assignments: [] });
    const { data: morning } = await expectRequest(201, '/spa/sessions', admin.token, 'POST', early);
    const { data: afternoon } = await expectRequest(201, '/spa/sessions', admin.token, 'POST', late);
    await expectRequest(409, '/spa/sessions', admin.token, 'POST', { ...late, start: '12:00' });
    const { data: initialRoster } = await expectRequest(200, '/spa/options', admin.token);
    for (const window of initialRoster.windows) {
      assert.equal(window.consultations, true);
      assert.deepEqual(window.serviceIds, []);
      await expectRequest(204, `/spa/windows/${window.id}`, admin.token, 'DELETE');
    }

    const firstVisitQuery = new URLSearchParams({ branchId: north.id, date, serviceId: initialOptions.firstVisit.id });
    const { data: unstaffed } = await expectRequest(200, `/spa/schedule?${firstVisitQuery}`, client.token);
    assert.deepEqual(unstaffed.map(({ name, slots }) => ({ name, slots })), [
      { name: 'Mañana', slots: [] }, { name: 'Tarde', slots: [] },
    ]);
    const allocation = { sessionId: afternoon.id, specialistId: specialist.user.id, start: '14:30', end: '15:30' };
    await expectRequest(400, '/spa/windows', admin.token, 'POST', { ...allocation, start: '13:30' });
    const { data: afternoonWindow } = await expectRequest(201, '/spa/windows', admin.token, 'POST', allocation);
    const firstBooking = {
      branchId: north.id, date, windowId: afternoonWindow.id,
      startsAt: Date.parse(`${date}T14:00:00-05:00`), serviceId: null,
    };
    await expectRequest(409, '/spa/appointments', client.token, 'POST', firstBooking);
    const { data: schedule } = await expectRequest(200, `/spa/schedule?${firstVisitQuery}`, client.token);
    const afternoonSlots = schedule.find((session) => session.id === afternoon.id).slots;
    assert.equal(schedule.find((session) => session.id === morning.id).slots.length, 0);
    assert.deepEqual(afternoonSlots.map((slot) => slot.startsAt), ['14:30', '15:00']
      .map((time) => Date.parse(`${date}T${time}:00-05:00`)));
    assert.equal(afternoonSlots[0].specialistName, specialistName);

    const { data: initialVisit } = await expectRequest(201, '/spa/appointments', client.token, 'POST', {
      ...firstBooking, startsAt: afternoonSlots[0].startsAt,
    });
    assert.equal(initialVisit.serviceId, null);
    assert.equal(initialVisit.serviceName, 'Consulta general');
    assert.equal(initialVisit.durationMinutes, 30);
    assert.equal(initialVisit.price, null);
    assert.equal(initialVisit.sessionName, 'Tarde');
    await expectRequest(409, staffPath(specialist.user.id), admin.token, 'DELETE');
    await expectRequest(409, `/spa/sessions/${afternoon.id}`, admin.token, 'DELETE');
    const { data: initialMoved } = await expectRequest(200, `/spa/appointments/${initialVisit.id}/reschedule`, client.token, 'PATCH', {
      ...firstBooking, startsAt: afternoonSlots[1].startsAt,
    });
    assert.equal(initialMoved.serviceId, null);
    await expectRequest(200, `/spa/appointments/${initialVisit.id}/cancel`, client.token, 'PATCH');
    assert.equal((await expectRequest(200, `/spa/availability?${firstVisitQuery}`, client.token)).data.length, 2);

    const { data: service } = await expectRequest(201, '/spa/services', admin.token, 'POST', {
      name: 'Masaje', durationMinutes: 60, price: 85000,
    });
    const window = { specialistId: specialist.user.id, start: '09:00', end: '13:00', serviceIds: [service.id] };
    const { data: period } = await expectRequest(201, '/spa/windows', admin.token, 'POST', { ...window, sessionId: morning.id });
    // El formato anterior sigue creando una sesión para un bloque nuevo.
    await expectRequest(409, '/spa/windows', admin.token, 'POST', { ...window, branchId: south.id, date });
    await expectRequest(201, '/spa/windows', admin.token, 'POST', {
      ...window, specialistId: secondSpecialist.user.id, branchId: south.id, date,
    });

    const query = new URLSearchParams({ branchId: north.id, serviceId: service.id, date });
    assert.deepEqual((await expectRequest(200, `/spa/dates?${query}`, client.token)).data, [date]);
    const { data: slots } = await expectRequest(200, `/spa/availability?${query}`, client.token);
    const input = { branchId: north.id, serviceId: service.id, date, windowId: period.id, startsAt: slots[0].startsAt };
    const collision = await Promise.all([client, other].map((account) =>
      request('/spa/appointments', account.token, 'POST', input)));
    assert.deepEqual(collision.map((entry) => entry.status).sort(), [201, 409]);
    const winner = collision[0].status === 201 ? client : other;
    const loser = winner === client ? other : client;
    const appointment = collision.find((entry) => entry.status === 201).data;
    assert.equal((await expectRequest(200, '/spa/appointments', loser.token)).data
      .filter((entry) => entry.status === 'confirmada').length, 0);
    assert.equal((await expectRequest(200, '/spa/appointments', secondSpecialist.token)).data.length, 0);
    assert.equal((await expectRequest(200, '/spa/appointments', specialist.token)).data[0].id, appointment.id);
    await expectRequest(404, `/spa/appointments/${appointment.id}/cancel`, loser.token, 'PATCH');
    await expectRequest(403, `/spa/appointments/${appointment.id}/cancel`, specialist.token, 'PATCH');
    await expectRequest(409, `/spa/windows/${period.id}`, admin.token, 'DELETE');
    const { data: afterBooking } = await expectRequest(200, `/spa/availability?${query}`, loser.token);
    assert.equal(afterBooking[0].startsAt, slots[1].startsAt);
    const { data: southSlots } = await expectRequest(200,
      `/spa/availability?${new URLSearchParams({ ...Object.fromEntries(query), branchId: south.id })}`, winner.token);
    assert.equal(southSlots[0].startsAt, slots[1].startsAt);

    await expectRequest(409, `/spa/appointments/${appointment.id}/reschedule`, winner.token, 'PATCH', { ...input, startsAt: 0 });
    assert.equal((await expectRequest(200, '/spa/appointments', winner.token)).data[0].startsAt, input.startsAt);
    const { data: moved } = await expectRequest(200, `/spa/appointments/${appointment.id}/reschedule`, winner.token, 'PATCH',
      { ...input, startsAt: slots[1].startsAt });
    assert.equal(moved.id, appointment.id);
    assert.equal(moved.startsAt, slots[1].startsAt);
    const { data: secondBooking } = await expectRequest(201, '/spa/appointments', loser.token, 'POST', input);
    await expectRequest(200, `/spa/appointments/${secondBooking.id}/cancel`, loser.token, 'PATCH');

    const blockDate = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);
    const addTreatment = async (durationMinutes) => (await expectRequest(201, '/spa/services', admin.token, 'POST', {
      name: `Tratamiento de ${durationMinutes} minutos`, durationMinutes, price: 85000,
    })).data;
    const medium = await addTreatment(90);
    const long = await addTreatment(120);
    const shorter = await addTreatment(45);
    const availableServices = [service.id, medium.id, long.id, shorter.id];
    const lastBlockDate = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
    const block = { branchId: north.id, startDate: blockDate, endDate: lastBlockDate, name: 'Mañana completa', start: '08:00', end: '12:00' };
    const assignments = [specialist, secondSpecialist].map((account) => ({
      specialistId: account.user.id, serviceIds: availableServices,
    }));
    await expectRequest(400, '/spa/sessions', admin.token, 'POST', { ...block, end: '09:00', assignments });
    await expectRequest(400, '/spa/sessions', admin.token, 'POST', {
      ...block, assignments: [{ specialistId: specialist.user.id, serviceIds: [] }],
    });
    await expectRequest(400, '/spa/sessions', admin.token, 'POST', { ...block, endDate: date, assignments });
    await expectRequest(400, '/spa/sessions', admin.token, 'POST', { ...block, assignments: [assignments[0], assignments[0]] });
    const { data: completeSchedule } = await expectRequest(201, '/spa/sessions', admin.token, 'POST', { ...block, assignments });
    assert.equal(completeSchedule.daysPublished, 2);
    assert.equal(completeSchedule.sectionMinutes, undefined);
    const { data: completeOptions } = await expectRequest(200, '/spa/options', admin.token);
    assert.equal(completeOptions.windows.filter((entry) => entry.sessionId === completeSchedule.id).length, 2);
    const publishedDays = completeOptions.sessions.filter((entry) => entry.name === block.name);
    assert.deepEqual(publishedDays.map((entry) => entry.date), [blockDate, lastBlockDate]);

    const freeSpecialist = await register('TercerEspecialista', 'especialista', admin.token);
    await expectRequest(409, '/spa/sessions', admin.token, 'POST', {
      ...block, branchId: south.id, name: 'Horario cruzado',
      assignments: [{ specialistId: freeSpecialist.user.id, serviceIds: availableServices }, assignments[0]],
    });
    const { data: afterConflict } = await expectRequest(200, '/spa/options', admin.token);
    assert.ok(!afterConflict.sessions.some((entry) => entry.name === 'Horario cruzado'));
    assert.ok(!afterConflict.windows.some((entry) => entry.specialistId === freeSpecialist.user.id));

    const slotList = async (branchId, serviceId, token = client.token) => (await expectRequest(200,
      `/spa/availability?${new URLSearchParams({ branchId, serviceId, date: blockDate })}`, token)).data;
    for (const treatment of [shorter, service, medium, long]) {
      const available = await slotList(north.id, treatment.id);
      const duration = treatment.durationMinutes * 60000;
      assert.equal(available.length, Math.floor(240 / treatment.durationMinutes) * 2);
      assert.equal(available[0].startsAt, completeSchedule.startsAt);
      assert.equal(available[0].endsAt - available[0].startsAt, duration);
      assert.equal(available[2].startsAt - available[0].startsAt, duration);
    }
    assert.deepEqual(await slotList(north.id, initialOptions.firstVisit.id), []);
    const longOptions = await slotList(north.id, long.id);
    const reserveBlock = (serviceId, slot, branchId = north.id) => ({
      branchId, serviceId, date: blockDate, windowId: slot.windowId, startsAt: slot.startsAt,
    });
    const { data: longBooked } = await expectRequest(201, '/spa/appointments', client.token, 'POST',
      reserveBlock(long.id, longOptions[0]));
    assert.equal(longBooked.endsAt - longBooked.startsAt, 120 * 60000);
    assert.equal(longBooked.sectionMinutes, undefined);
    assert.equal((await slotList(north.id, service.id)).filter((slot) => slot.startsAt < longBooked.endsAt).length, 0);
    assert.equal((await slotList(north.id, service.id, other.token))
      .filter((slot) => slot.startsAt === longBooked.startsAt).length, 1);
    await expectRequest(409, '/spa/appointments', other.token, 'POST', {
      ...reserveBlock(service.id, longOptions[0]), startsAt: longBooked.startsAt + 30 * 60000,
    });
    await expectRequest(200, `/spa/appointments/${longBooked.id}/cancel`, client.token, 'PATCH');

    const { data: splitSession } = await expectRequest(201, '/spa/sessions', admin.token, 'POST', {
      ...block, endDate: blockDate, branchId: south.id, name: 'Tarde con descanso', start: '14:00', end: '18:00',
      assignments: [{ specialistId: freeSpecialist.user.id, serviceIds: [service.id] }],
    });
    const { data: initialSplit } = await expectRequest(200, '/spa/options', admin.token);
    const placeholder = initialSplit.windows.find((entry) => entry.sessionId === splitSession.id);
    await expectRequest(204, `/spa/windows/${placeholder.id}`, admin.token, 'DELETE');
    const splitWindow = { sessionId: splitSession.id, specialistId: specialist.user.id, serviceIds: availableServices };
    await expectRequest(201, '/spa/windows', admin.token, 'POST', { ...splitWindow, start: '14:15', end: '15:15' });
    const { data: continuation } = await expectRequest(201, '/spa/windows', admin.token, 'POST', {
      ...splitWindow, start: '15:15', end: '16:15',
    });
    await expectRequest(201, '/spa/windows', admin.token, 'POST', { ...splitWindow, start: '16:30', end: '18:00' });
    const splitSlots = await slotList(south.id, long.id);
    assert.deepEqual(splitSlots.map((entry) => entry.startsAt), [Date.parse(`${blockDate}T14:15:00-05:00`)]);
    const { data: crossedWindow } = await expectRequest(201, '/spa/appointments', client.token, 'POST',
      reserveBlock(long.id, splitSlots[0], south.id));
    await expectRequest(409, `/spa/windows/${continuation.id}`, admin.token, 'DELETE');
    await expectRequest(200, `/spa/appointments/${crossedWindow.id}/cancel`, client.token, 'PATCH');

    const { data: product } = await expectRequest(201, `/stores/${north.id}/products`, admin.token, 'POST',
      { name: 'Aceite corporal', price: 30000 });
    await expectRequest(400, '/orders', winner.token, 'POST', { storeId: 'ajena', items: [], customerAddress: 'Entrega' });
    await expectRequest(409, '/orders', winner.token, 'POST', {
      storeId: north.id, items: [{ id: product.id, quantity: 2 }], customerAddress: 'Entrega', expectedTotal: 1000,
    });
    const { data: order } = await expectRequest(201, '/orders', winner.token, 'POST', {
      storeId: north.id, items: [{ id: product.id, quantity: 2, price: 1 }], customerAddress: 'Entrega',
    });
    assert.equal(order.totalToPay, 65500);
    assert.equal(order.items[0].price, 30000);

    await expectRequest(200, `/workers/${courier.user.id}`, courier.token, 'PATCH', { status: 'disponible' });
    await expectRequest(200, `/orders/${order.id}/assign`, admin.token, 'POST', { workerId: courier.user.id });
    await expectRequest(200, staffPath(courier.user.id), admin.token, 'DELETE');
    await expectRequest(401, '/orders', courier.token);
    const { data: pendingOrders } = await expectRequest(200, '/orders', admin.token);
    assert.equal(pendingOrders.find((entry) => entry.id === order.id).status, 'pendiente');
    assert.equal(pendingOrders.find((entry) => entry.id === order.id).assignedWorkerId, null);

    await stop();
    await boot();
    assert.equal((await expectRequest(200, '/spa/appointments', winner.token)).data
      .find((entry) => entry.id === moved.id).startsAt, moved.startsAt);
    assert.equal((await expectRequest(200, '/spa/options', admin.token)).data.sessions
      .filter((entry) => entry.name === block.name).length, 2);
    assert.equal((await expectRequest(200, '/orders', winner.token)).data[0].id, order.id);
    assert.ok((await expectRequest(200, '/stores', admin.token)).data.some((entry) => entry.id === north.id));
    assert.deepEqual((await expectRequest(200, `/spa/schedule?${firstVisitQuery}`, client.token)).data
      .map((entry) => entry.name), ['Mañana', 'Tarde']);

    await stop();
    const db = new DatabaseSync(database);
    try {
      const persisted = JSON.parse(db.prepare("SELECT data FROM app_state WHERE key = 'agenda'").get().data);
      // Reproduce un archivo guardado antes de que existieran las sesiones.
      delete persisted.sessions;
      for (const block of persisted.windows) {
        delete block.sessionId;
        delete block.consultations;
      }
      for (const entry of persisted.appointments) {
        delete entry.sessionId;
        delete entry.sessionName;
      }
      const past = persisted.appointments.find((entry) => entry.id === moved.id);
      past.startsAt = Date.now() - 7200000;
      past.endsAt = Date.now() - 3600000;
      db.prepare("UPDATE app_state SET data = ? WHERE key = 'agenda'").run(JSON.stringify(persisted));
    } finally {
      db.close();
    }

    await boot();
    await expectRequest(404, `/spa/appointments/${moved.id}/outcome`, secondSpecialist.token, 'PATCH', { status: 'atendida' });
    const done = await expectRequest(200, `/spa/appointments/${moved.id}/outcome`, specialist.token, 'PATCH', { status: 'atendida' });
    assert.equal(done.data.status, 'atendida');
    assert.equal(done.data.sessionName, 'Sesión');
    await expectRequest(200, staffPath(specialist.user.id), admin.token, 'DELETE');
    await expectRequest(401, '/spa/appointments', specialist.token);
    const { data: retiredSchedule } = await expectRequest(200, `/spa/schedule?${firstVisitQuery}`, client.token);
    assert.ok(retiredSchedule.length > 0);
    assert.ok(retiredSchedule.every((entry) => entry.slots.length === 0));
  } finally {
    await stop();
    for (const suffix of ['', '-shm', '-wal']) {
      if (existsSync(database + suffix)) unlinkSync(database + suffix);
    }
    rmdirSync(dir);
  }
});
