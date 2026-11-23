const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { join } = require('node:path');

process.loadEnvFile(join(__dirname, '.env.supabase-prueba.local'));
const base = new URL(process.env.AURA_CLOUD_API_URL);
assert.equal(base.protocol, 'https:', 'Usa la URL HTTPS del proyecto de pruebas.');
assert.equal(base.pathname, '/functions/v1/aura-api', 'Configura la URL de la función Aura Spa.');

function credentials(role) {
  const prefix = `FHS_PRUEBA_${role.toUpperCase()}`;
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  assert.ok(email && password, `Faltan credenciales de ${role}.`);
  return { email, password };
}

async function call(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${base.href}/api${path}`, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(body && { 'Content-Type': 'application/json' }),
    },
    body: body && JSON.stringify(body),
    signal: AbortSignal.timeout(25_000),
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

async function expect(status, path, options) {
  const result = await call(path, options);
  assert.equal(result.status, status, `${options?.method ?? 'GET'} ${path}: ${result.payload.message ?? ''}`);
  return result.payload.data ?? result.payload;
}

const post = (body, token) => ({ body, token, method: 'POST' });
const patch = (body, token) => ({ body, token, method: 'PATCH' });

async function account(name, role, admin) {
  const login = credentials(role);
  let response = await call('/auth/login', post(login));
  if (response.status === 401) {
    await expect(201, '/auth/register', post({ ...login, name, role }, admin));
    response = await call('/auth/login', post(login));
  }
  assert.equal(response.status, 200, `Inicio de sesión de ${role}`);
  assert.equal(response.payload.user.role, role);
  return response.payload;
}

function datesInBogota() {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota', dateStyle: 'short' }).format(new Date());
  return [1, 2].map((day) => new Date(Date.parse(`${today}T00:00:00Z`) + day * 86_400_000).toISOString().slice(0, 10));
}

async function main() {
  const admin = await expect(200, '/auth/login', post(credentials('admin')));
  assert.equal(admin.user.role, 'administrador');
  const client = await account('Cliente de prueba', 'cliente', admin.token);
  const specialist = await account('Especialista de prueba', 'especialista', admin.token);
  const courier = await account('Repartidor de prueba', 'repartidor', admin.token);
  await expect(403, '/spa/options', { token: courier.token });
  await expect(403, '/auth/users', { token: client.token });
  await expect(403, '/orders', { token: specialist.token });

  const stores = await expect(200, '/stores', { token: admin.token });
  const branch = stores.find(({ name }) => name === 'Aura Spa · Sede de prueba') ??
    await expect(201, '/stores', post({ name: 'Aura Spa · Sede de prueba', address: 'Bogotá' }, admin.token));
  const product = branch.products.find(({ name }) => name === 'Aceite corporal') ??
    await expect(201, `/stores/${branch.id}/products`, post({ name: 'Aceite corporal', price: 24000 }, admin.token));

  const options = await expect(200, '/spa/options', { token: admin.token });
  const services = [];
  for (const service of [
    { name: 'Masaje relajante', durationMinutes: 60, price: 90000 },
    { name: 'Ritual corporal', durationMinutes: 90, price: 135000 },
  ]) {
    services.push(options.services.find(({ name }) => name === service.name) ??
      await expect(201, '/spa/services', post(service, admin.token)));
  }
  const dates = datesInBogota();
  for (const date of dates) {
    for (const [name, start, end] of [['Mañana', '08:00', '12:00'], ['Tarde', '14:00', '18:00']]) {
      if (options.sessions.some((entry) => entry.branchId === branch.id && entry.date === date && entry.name === name)) continue;
      await expect(201, '/spa/sessions', post({
        branchId: branch.id, date, name, start, end,
        assignments: [{ specialistId: specialist.user.id, serviceIds: [options.firstVisit.id, ...services.map(({ id }) => id)] }],
      }, admin.token));
    }
  }

  const query = { branchId: branch.id, date: dates[0] };
  const slotsFor = (serviceId) => expect(200, `/spa/availability?${new URLSearchParams({ ...query, serviceId })}`, { token: client.token });
  const slots = await slotsFor(services[0].id);
  assert.equal(slots[0].endsAt - slots[0].startsAt, 60 * 60_000);
  const consultation = (await slotsFor(options.firstVisit.id))[0];
  assert.equal(consultation.endsAt - consultation.startsAt, 30 * 60_000);
  const ritual = (await slotsFor(services[1].id))[0];
  assert.equal(ritual.endsAt - ritual.startsAt, 90 * 60_000);

  const unique = randomBytes(8).toString('hex');
  const password = `Aa1!${randomBytes(20).toString('hex')}`;
  const other = await expect(201, '/auth/register', post({
    name: 'Verificación de agenda', email: `agenda-${unique}@fhs.com`, password,
  }));
  const inputFor = (slot) => ({
    ...query, serviceId: services[0].id, startsAt: slot.startsAt, windowId: slot.windowId,
  });
  const attempts = await Promise.all([client, other].map(({ token }) =>
    call('/spa/appointments', post(inputFor(slots[0]), token))));
  assert.deepEqual(attempts.map(({ status }) => status).sort(), [201, 409]);
  const won = attempts.findIndex(({ status }) => status === 201);
  const booked = attempts[won].payload.data;
  const winner = [client, other][won];
  const appointmentPath = `/spa/appointments/${booked.id}`;
  await expect(404, `${appointmentPath}/cancel`, patch({}, [client, other][1 - won].token));
  const agenda = await expect(200, '/spa/appointments', { token: specialist.token });
  assert.ok(agenda.some(({ id }) => id === booked.id));
  const moved = await expect(200, `${appointmentPath}/reschedule`, patch(inputFor(slots[1]), winner.token));
  assert.equal(moved.startsAt, slots[1].startsAt);
  await expect(200, `${appointmentPath}/cancel`, patch({}, winner.token));
  await expect(200, `/auth/users/${other.user.id}`, { method: 'DELETE', token: admin.token });
  await expect(401, '/auth/me', { token: other.token });

  for (const role of ['especialista', 'repartidor']) {
    const login = { email: `${role}-${unique}@fhs.com`, password };
    const temporary = await expect(201, '/auth/register', post({ ...login, role, name: 'Verificación de equipo' }, admin.token));
    const staffPath = `/auth/users/${temporary.user.id}`;
    const update = { name: 'Equipo verificado', email: `equipo-${role}-${unique}@fhs.com` };
    await expect(403, staffPath, patch(update, client.token));
    const edited = await expect(200, staffPath, patch(update, admin.token));
    assert.equal(edited.name, update.name);
    await expect(401, '/auth/login', post(login));
    await expect(200, '/auth/login', post({ ...login, email: update.email }));
    await expect(200, staffPath, { method: 'DELETE', token: admin.token });
    await expect(401, '/auth/me', { token: temporary.token });
  }

  await expect(200, `/workers/${courier.user.id}`, patch({ status: 'disponible' }, courier.token));
  const order = await expect(201, '/orders', post({
    storeId: branch.id, customerAddress: 'Dirección de verificación', items: [{ id: product.id, quantity: 1 }],
  }, client.token));
  assert.equal(order.totalToPay, product.price + 5500);
  if (!order.assignedWorkerId) {
    await expect(200, `/orders/${order.id}/assign`, post({ workerId: courier.user.id }, admin.token));
  }
  const deliveries = await expect(200, '/orders', { token: courier.token });
  assert.ok(deliveries.some((entry) => entry.id === order.id && !entry.securityPin));
  const statusPath = `/orders/${order.id}/status`;
  for (const status of ['rumbo_tienda', 'en_tienda', 'rumbo_cliente']) {
    await expect(200, statusPath, patch({ status }, courier.token));
  }
  await expect(400, statusPath, patch({ status: 'entregado', pin: '0000' }, courier.token));
  await expect(200, statusPath, patch({ status: 'entregado', pin: order.securityPin }, courier.token));
  const history = await expect(200, '/orders', { token: client.token });
  assert.equal(history.find(({ id }) => id === order.id).status, 'entregado');

  console.log(JSON.stringify({ dates, appointmentId: booked.id, orderId: order.id, verified: true }));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
