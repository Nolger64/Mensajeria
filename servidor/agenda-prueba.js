const { fork, spawn } = require('node:child_process');
const { once } = require('node:events');
const { loadEnvFile } = require('node:process');
const { join } = require('node:path');

const apiPort = 4100;
const webPort = 8094;
const apiUrl = `http://127.0.0.1:${apiPort}`;
const onlySeed = process.argv.includes('--solo-datos');

function credentials(type) {
  const email = process.env[`FHS_PRUEBA_${type}_EMAIL`];
  const password = process.env[`FHS_PRUEBA_${type}_PASSWORD`];
  if (!email || !password) throw new Error(`Completa las variables de prueba de ${type}.`);
  return { email: email.trim().toLowerCase(), password };
}

async function request(path, { body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${apiUrl}/api${path}`, {
    method: body ? 'POST' : 'GET', headers, body: body && JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`No se pudo preparar ${path} (HTTP ${response.status}).`);
  return result.data ?? result;
}

function nextDates() {
  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  return [1, 2].map((offset) =>
    new Date(Date.parse(`${today}T00:00:00Z`) + offset * 86400000).toISOString().slice(0, 10)
  );
}

async function seed(admin, accounts) {
  const { token } = await request('/auth/login', { body: admin });
  const users = await request('/auth/users', { token });
  for (const account of accounts) {
    if (!users.some((user) => user.email === account.email)) {
      await request('/auth/register', { token, body: account });
    }
    const { user } = await request('/auth/login', { body: { email: account.email, password: account.password } });
    if (user.role !== account.role) throw new Error('Una cuenta de prueba tiene un rol distinto al configurado.');
    account.id = user.id;
  }

  const branches = await request('/stores', { token });
  const name = 'Aura Spa · Sede de prueba';
  const branch = branches.find((entry) => entry.name === name)
    ?? await request('/stores', { token, body: { name, address: 'Bogotá · Sede de demostración' } });
  const { services, sessions, firstVisit } = await request('/spa/options', { token });
  const treatments = [
    { name: 'Masaje relajante', durationMinutes: 60, price: 90000 },
    { name: 'Ritual corporal', durationMinutes: 90, price: 135000 },
  ];
  const serviceIds = [firstVisit.id];
  for (const treatment of treatments) {
    const existing = services.find((service) => service.name === treatment.name)
      ?? await request('/spa/services', { token, body: treatment });
    if (existing.active) serviceIds.push(existing.id);
  }

  const specialistId = accounts.find((account) => account.role === 'especialista').id;
  const schedules = [
    { name: 'Mañana de prueba', start: '08:00', end: '12:00' },
    { name: 'Tarde de prueba', start: '14:00', end: '18:00' },
  ];
  const dates = nextDates();
  for (const date of dates) {
    for (const schedule of schedules) {
      if (sessions.some((entry) => entry.branchId === branch.id && entry.date === date && entry.name === schedule.name)) continue;
      await request('/spa/sessions', {
        token,
        body: { ...schedule, branchId: branch.id, startDate: date, endDate: date, assignments: [{ specialistId, serviceIds }] },
      });
    }
  }

  console.log(`Cuentas y horarios de prueba listos para ${dates.join(' y ')} (hora de Bogotá).`);
}

async function main() {
  try {
    loadEnvFile(join(__dirname, '.env.agenda-prueba.local'));
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error('Falta servidor/.env.agenda-prueba.local. Consulta el README.');
    throw error;
  }
  const admin = credentials('ADMIN');
  const jwtSecret = process.env.FHS_PRUEBA_JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) throw new Error('Configura FHS_PRUEBA_JWT_SECRET para esta base local.');

  const accounts = [
    { ...credentials('REPARTIDOR'), name: 'Repartidor de prueba', role: 'repartidor' },
    { ...credentials('CLIENTE'), name: 'Cliente de prueba', role: 'cliente' },
    { ...credentials('ESPECIALISTA'), name: 'Especialista de prueba', role: 'especialista' },
  ];
  const server = fork(join(__dirname, 'server.js'), {
    stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(apiPort),
      JWT_SECRET: jwtSecret,
      JWT_EXPIRES_IN: '24h',
      FHS_LOOPBACK: 'true',
      FHS_SANDBOX: 'false',
      FHS_DATABASE_PATH: join(__dirname, 'data', 'agenda-prueba.sqlite'),
      FHS_ADMIN_NAME: 'Administrador de prueba',
      FHS_ADMIN_EMAIL: admin.email,
      FHS_ADMIN_PASSWORD: admin.password,
    },
  });

  let web;
  const stop = () => {
    web?.kill();
    server.kill();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);

  try {
    await Promise.race([
      once(server, 'message'),
      once(server, 'exit').then(() => { throw new Error('La API de prueba no pudo iniciar.'); }),
    ]);
    await seed(admin, accounts);
    if (onlySeed) return;
    console.log(`Abre http://localhost:${webPort} para usar la agenda de prueba.`);
    const expoEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('FHS_PRUEBA_')));
    web = spawn(process.execPath, [
      require.resolve('expo/bin/cli'), 'start', '--web', '--localhost', '--port', String(webPort), '--clear',
    ], {
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...expoEnv, EXPO_PUBLIC_API_URL: apiUrl, BROWSER: 'none', CI: '1' },
    });
    const [code] = await once(web, 'exit');
    if (code) process.exitCode = code;
  } finally {
    stop();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
