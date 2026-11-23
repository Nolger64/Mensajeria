import { randomInt, randomUUID } from 'node:crypto';
import express from 'express';
import cors from 'cors';
import { mountSpa } from './spa.mjs';
import {
  VALID_ROLES, validateEmail, validatePasswordStrength, hashPasswordSync, sanitizeUser,
  securityHeadersMiddleware, authorizeRoles, createAuthentication, localIdentities,
} from './auth.mjs';

export function createApp({ state, signingKey, tokenExpiry = '24h', sandboxEnabled = false, bootstrapAdmin = {}, identities = localIdentities }) {
  const app = express();
  app.disable('x-powered-by');
  const { authenticateToken, checkRoleOrDev, generateToken } = createAuthentication({
    signingKey, tokenExpiry, sandboxEnabled,
  });
  // Middleware de seguridad y parseo
  app.use(securityHeadersMiddleware);
  app.use(cors());
  app.use(express.json({ limit: '32kb' }));

  // ==========================================
  // BASE DE DATOS EN MEMORIA (INICIALIZACIÓN)
  // ==========================================

  const INITIAL_STORES = [{
    id: 'spa-local',
    name: 'Aura Spa · Sede de desarrollo',
    category: 'spa',
    active: true,
    address: 'Bogotá',
    coordinates: { latitude: 4.671, longitude: -74.053 },
    products: [{ id: 'aceite-local', name: 'Aceite corporal', description: 'Aceite de masaje', price: 24000, available: true }],
  }];
  const INITIAL_WORKERS = [{
    id: 'reparto-local',
    name: 'Repartidor de desarrollo',
    nickname: 'Reparto',
    vehicle: 'bici',
    vehicleModel: 'Bicicleta',
    status: 'disponible',
    rating: 0,
    completedOrdersToday: 0,
    batteryLevel: 100,
    coordinates: { latitude: 4.667, longitude: -74.05 },
    distanceMeters: 0,
    currentZone: '',
    lastUpdate: '',
    avatarColor: '#38523E',
  }];

  const saved = state.read('operation', {});
  const users = saved.users || [];
  const initialUsers = users.length;
  const { name: adminName, email: adminEmail, password: adminPassword } = bootstrapAdmin;
  if (!users.some((user) => user.role === 'administrador') && (adminName || adminEmail || adminPassword)) {
    if (!adminName?.trim() || !validateEmail(adminEmail) ||
        !validatePasswordStrength(adminPassword).valid) {
      throw new Error('Revisa las variables de configuración de la cuenta administradora.');
    }
    const email = adminEmail.trim().toLowerCase();
    const existing = users.find((user) => user.email === email);
    if (existing && existing.role !== 'administrador') {
      throw new Error('El correo configurado ya pertenece a una cuenta sin rol administrador.');
    }
    if (!existing) {
      users.push({
        id: randomUUID(),
        name: adminName.trim(),
        email,
        password: hashPasswordSync(adminPassword),
        role: 'administrador',
        createdAt: new Date().toISOString(),
        lastLogin: null,
      });
    }
  }

  app.locals.findUser = (id) => users.find((user) => user.id === id);

  function addWorkerForUser(user) {
    if (workers.some((worker) => worker.id === user.id)) return;
    const worker = {
      id: user.id,
      name: user.name,
      nickname: user.name.split(' ')[0],
      vehicle: user.vehicle || 'moto',
      vehicleModel: user.vehicleModel || 'Motocicleta',
      status: 'descanso',
      rating: 0,
      completedOrdersToday: 0,
      distanceMeters: 0,
      lastUpdate: 'Sin ubicación reciente',
      avatarColor: '#2979FF',
    };
    workers.unshift(worker);
    broadcastEvent('WORKER_CREATED', worker);
  }

  const sandboxData = (data) => sandboxEnabled ? structuredClone(data) : [];
  let stores = (saved.stores || sandboxData(INITIAL_STORES)).filter((store) => store.category === 'spa');
  let workers = saved.workers || sandboxData(INITIAL_WORKERS);
  let orders = saved.orders || [];
  let messages = saved.messages || [];
  let deliveryStars = saved.deliveryStars || [];
  const defaultRadioRooms = () => [
    { id: 'operaciones', channelNumber: 1, name: 'Entregas Aura Spa', description: 'Coordinación de entregas de la tienda', participants: [], transmissions: [] },
  ];
  let radioRooms = saved.radioRooms || defaultRadioRooms();
  let systemSettings = saved.systemSettings || {
    dispatchMode: 'manual',
    serverOnline: true,
    serverVersion: '2.4.0',
    serverMessage: 'Aura Spa en línea',
    updatedAt: new Date().toISOString(),
  };

  function persistOperation() {
    state.write('operation', { users, stores, workers, orders, messages, deliveryStars, systemSettings, radioRooms });
  }

  if (initialUsers !== users.length) persistOperation();
  const agenda = mountSpa(app, { state, getBranches: () => stores, getUsers: () => users, authenticateToken });

  let sseClients = [];

  function broadcastEvent(eventType, data) {
    persistOperation();
    const payload = JSON.stringify({ type: eventType, data, timestamp: new Date().toISOString() });
    sseClients.forEach((client) => {
      client.res.write(`data: ${payload}\n\n`);
    });
  }

  // Healthcheck endpoint para verificación instantánea de conexión
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      online: true,
      serverMessage: 'Aura Spa en línea',
      dispatchMode: systemSettings.dispatchMode,
      timestamp: new Date().toISOString(),
    });
  });

  function sandboxOnly(req, res, next) {
    if (!sandboxEnabled) return res.sendStatus(404);
    next();
  }

  // Las aplicaciones de operación consultan sus datos mediante solicitudes autenticadas.
  app.get('/api/stream', sandboxOnly, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    sseClients.push(newClient);

    res.write(`data: ${JSON.stringify({
      type: 'INITIAL_STATE',
      data: {
        stores,
        workers,
        orders,
        messages,
        deliveryStars,
        radioRooms,
        systemSettings,
      }
    })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter((c) => c.id !== clientId);
    });
  });

  // ==========================================
  // 1. AUTENTICACIÓN Y CONTROL DE USUARIOS (RBAC)
  // ==========================================

  // 1.1 Registro de Usuario (con validación de seguridad OWASP)
  function authorizeRegistration(req, res, next) {
    const { role = 'cliente' } = req.body;
    if (role === 'cliente') return next();
    authenticateToken(req, res, () => authorizeRoles('administrador')(req, res, next));
  }

  app.post('/api/auth/register', authorizeRegistration, async (req, res, next) => {
    try {
      const { name, email, password, role = 'cliente', phone, vehicle, vehicleModel, plate } = req.body;

      // Validación de nombre
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, code: 'INVALID_NAME', message: 'El nombre completo es obligatorio' });
      }

      // Validación de formato de email
      if (!validateEmail(email)) {
        return res.status(400).json({ success: false, code: 'INVALID_EMAIL', message: 'El correo electrónico no tiene un formato válido' });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Comprobar si ya existe
      const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(409).json({ success: false, code: 'EMAIL_ALREADY_EXISTS', message: 'Este correo electrónico ya está registrado' });
      }

      // Validación de fortaleza de contraseña según OWASP
      const pwdValidation = validatePasswordStrength(password);
      if (!pwdValidation.valid) {
        return res.status(400).json({ success: false, code: 'WEAK_PASSWORD', message: pwdValidation.message });
      }

      // Validación de rol
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_ROLE',
          message: `El rol '${role}' no es válido. Roles autorizados: [${VALID_ROLES.join(', ')}]`,
        });
      }

      const identity = await identities.create(cleanEmail, password);

      if (users.some((user) => user.email === cleanEmail)) {
        return res.status(409).json({ success: false, message: 'Este correo electrónico ya está registrado' });
      }
      const newUser = {
        ...identity,
        name: name.trim(),
        email: cleanEmail,
        role,
        phone: phone || '',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        vehicle,
        vehicleModel,
        plate,
      };

      users.push(newUser);

      // Si el usuario es un repartidor, integrarlo automáticamente a la flota
      if (role === 'repartidor') addWorkerForUser(newUser);
      else persistOperation();

      const token = generateToken(newUser);

      res.status(201).json({
        success: true,
        message: `Usuario registrado exitosamente con rol '${role}'`,
        token,
        user: sanitizeUser(newUser),
      });
    } catch (error) {
      next(error);
    }
  });

  // 1.2 Inicio de Sesión (Login con JWT)
  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!validateEmail(email) || typeof password !== 'string' || !password) {
        return res.status(400).json({
          success: false,
          code: 'MISSING_CREDENTIALS',
          message: 'Debes proporcionar correo electrónico y contraseña',
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

      // OWASP: respuesta genérica para mitigar user enumeration
      if (!user) {
        return res.status(401).json({
          success: false,
          code: 'INVALID_CREDENTIALS',
          message: 'Credenciales inválidas. Verifica tu correo y contraseña.',
        });
      }

      const passwordMatches = await identities.verify(user, password);
      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          code: 'INVALID_CREDENTIALS',
          message: 'Credenciales inválidas. Verifica tu correo y contraseña.',
        });
      }

      // Actualizar marca temporal de inicio de sesión
      user.lastLogin = new Date().toISOString();
      persistOperation();

      const token = generateToken(user);

      res.json({
        success: true,
        message: `Bienvenido(a), ${user.name}`,
        token,
        user: sanitizeUser(user),
      });
    } catch (error) {
      next(error);
    }
  });

  // 1.3 Perfil del Usuario Autenticado (/api/auth/me)
  app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = users.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, user: sanitizeUser(user) });
  });

  // 1.4 Actualización de Perfil (Propio)
  app.patch('/api/auth/profile', authenticateToken, async (req, res, next) => {
    try {
      const userIndex = users.findIndex((u) => u.id === req.user.id);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const { name, phone, address, vehicle, vehicleModel, currentPassword, newPassword } = req.body;
      const user = users[userIndex];

      // Cambio seguro de contraseña
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Debes proporcionar tu contraseña actual' });
        }
        const isCurrentValid = await identities.verify(user, currentPassword);
        if (!isCurrentValid) {
          return res.status(401).json({ success: false, message: 'La contraseña actual es incorrecta' });
        }
        const pwdValidation = validatePasswordStrength(newPassword);
        if (!pwdValidation.valid) {
          return res.status(400).json({ success: false, message: pwdValidation.message });
        }
        await identities.changePassword(user, newPassword, currentPassword);
      }

      if (typeof name === 'string' && name.trim()) user.name = name.trim();
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (vehicle !== undefined) user.vehicle = vehicle;
      if (vehicleModel !== undefined) user.vehicleModel = vehicleModel;
      persistOperation();
      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        user: sanitizeUser(user),
      });
    } catch (error) {
      next(error);
    }
  });

  // 1.5 Listar Usuarios (Solo Administrador)
  app.get('/api/auth/users', authenticateToken, authorizeRoles('administrador'), (req, res) => {
    const { role } = req.query;
    let filtered = users;
    if (role && VALID_ROLES.includes(role)) {
      filtered = users.filter((u) => u.role === role);
    }
    res.json({
      success: true,
      count: filtered.length,
      data: filtered.map(sanitizeUser),
    });
  });

  app.patch('/api/auth/users/:id', authenticateToken, authorizeRoles('administrador'), async (req, res, next) => {
    const user = app.locals.findUser(req.params.id);
    if (!user || !['especialista', 'repartidor'].includes(user.role)) {
      return res.status(404).json({ message: 'No encontramos esa cuenta del equipo.' });
    }

    const input = req.body ?? {};
    const name = input.name === undefined ? user.name : typeof input.name === 'string' ? input.name.trim() : '';
    const email = input.email === undefined ? user.email : typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const phone = input.phone === undefined ? user.phone || '' : input.phone;
    if (!name || name.length > 100 || email.length > 254 || !validateEmail(email) ||
        typeof phone !== 'string' || phone.length > 32) {
      return res.status(400).json({ message: 'Revisa el nombre, correo y teléfono.' });
    }
    if (users.some((entry) => entry.id !== user.id && entry.email === email)) {
      return res.status(409).json({ message: 'Ese correo ya pertenece a otra cuenta.' });
    }

    const changes = { name, email, phone: phone.trim() };
    if (user.role === 'repartidor') {
      const { vehicle = user.vehicle || 'moto', vehicleModel = user.vehicleModel || '', plate = user.plate || '' } = input;
      if (!['moto', 'bici', 'auto'].includes(vehicle) || typeof vehicleModel !== 'string' || vehicleModel.length > 80 ||
          typeof plate !== 'string' || plate.length > 16) {
        return res.status(400).json({ message: 'Revisa el vehículo, el modelo y la placa.' });
      }
      Object.assign(changes, { vehicle, vehicleModel: vehicleModel.trim(), plate: plate.trim().toUpperCase() });
    }
    if (email !== user.email) {
      try { await identities.changeEmail(user, email); } catch (error) { return next(error); }
    }
    Object.assign(user, changes);
    if (user.role === 'repartidor') {
      const worker = workers.find((entry) => entry.id === user.id);
      if (worker) Object.assign(worker, {
        name: user.name,
        nickname: user.name.split(' ')[0],
        vehicle: user.vehicle,
        vehicleModel: user.vehicleModel,
      });
    }
    persistOperation();
    res.json({ data: sanitizeUser(user) });
  });

  function deliveryInProgress(workerId) {
    return orders.some((order) => order.assignedWorkerId === workerId &&
      ['rumbo_tienda', 'en_tienda', 'rumbo_cliente'].includes(order.status));
  }

  function removeFromFleet(workerId) {
    workers = workers.filter((worker) => worker.id !== workerId);
    for (const order of orders) {
      if (order.assignedWorkerId === workerId && order.status === 'ofertado') {
        order.assignedWorkerId = null;
        order.status = 'pendiente';
      }
    }
  }

  // 1.6 Cambiar Rol de Usuario (Solo Administrador)
  app.patch('/api/auth/users/:id/role', authenticateToken, authorizeRoles('administrador'), (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Rol no válido. Roles permitidos: [${VALID_ROLES.join(', ')}]`,
      });
    }

    const user = users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (user.role === 'administrador' && role !== user.role && !users.some(
      (entry) => entry.id !== user.id && entry.role === 'administrador'
    )) {
      return res.status(409).json({ message: 'Debe quedar al menos una cuenta administradora.' });
    }
    if (user.role === 'especialista' && role !== user.role && agenda.hasFutureAppointments('specialistId', id)) {
      return res.status(409).json({ message: 'El especialista tiene citas activas.' });
    }
    if (user.role === 'repartidor' && role !== user.role && deliveryInProgress(user.id)) {
      return res.status(409).json({ message: 'El repartidor tiene una entrega en curso.' });
    }
    user.role = role;
    if (role === 'repartidor') addWorkerForUser(user);
    else removeFromFleet(user.id);
    persistOperation();
    res.json({ success: true, message: `Rol del usuario actualizado a '${role}'`, user: sanitizeUser(user) });
  });

  // 1.7 Eliminar Usuario (Solo Administrador)
  app.delete('/api/auth/users/:id', authenticateToken, authorizeRoles('administrador'), (req, res) => {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ success: false, message: 'No puedes eliminar tu propia cuenta de administrador' });
    }

    const exists = users.some((u) => u.id === id);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (agenda.hasFutureAppointments('specialistId', id) || agenda.hasFutureAppointments('clientId', id)) {
      return res.status(409).json({ message: 'La cuenta tiene citas activas. Cancélalas o reprograma antes de eliminarla.' });
    }
    if (deliveryInProgress(id)) {
      return res.status(409).json({ message: 'El repartidor tiene una entrega en curso. Debe finalizarla antes de eliminar la cuenta.' });
    }
    identities.remove(id);
    users.splice(users.findIndex((user) => user.id === id), 1);
    removeFromFleet(id);
    persistOperation();
    res.json({ success: true, message: 'Usuario eliminado del sistema' });
  });

  // ==========================================
  // 2. TIENDAS (STORES) Y PRODUCTOS
  // ==========================================

  function branchInput(body) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const address = typeof body.address === 'string' ? body.address.trim() : '';
    const { active = true } = body;
    if (!name || name.length > 100 || !address || address.length > 250 || typeof active !== 'boolean') return null;
    return { name, address, active, category: 'spa', logo: '🌿' };
  }

  function productInput(body) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const { price, available = true } = body;
    if (!name || name.length > 100 || description.length > 1000 || !Number.isSafeInteger(price) ||
        price <= 0 || price > 100000000 || typeof available !== 'boolean') return null;
    return { name, description, price, available, emoji: '🌿' };
  }

  app.get('/api/stores', checkRoleOrDev('cliente', 'administrador', 'repartidor'), (req, res) => {
    const visible = req.user.role === 'administrador' ? stores : stores.filter((store) => store.active !== false);
    res.json({ success: true, count: visible.length, data: visible.map((store) =>
      req.user.role === 'cliente'
        ? { ...store, products: store.products?.filter((product) => product.available) || [] }
        : store
    ) });
  });

  app.post('/api/stores', checkRoleOrDev('administrador'), (req, res) => {
    if (req.body.category && req.body.category !== 'spa') {
      return res.status(400).json({ message: 'Solo se pueden registrar sedes de Aura Spa.' });
    }
    const input = branchInput(req.body);
    if (!input) return res.status(400).json({ message: 'Ingresa el nombre y la dirección de la sede.' });
    const fixture = sandboxEnabled && req.user.id === 'sandbox' ? req.body : null;
    const initialProducts = Array.isArray(fixture?.products)
      ? fixture.products.map(productInput).filter(Boolean).map((product) => ({ id: randomUUID(), ...product }))
      : [];
    const store = {
      ...(fixture && { coordinates: fixture.coordinates, distanceKm: fixture.distanceKm }),
      id: randomUUID(),
      ...input,
      products: initialProducts,
    };
    stores.unshift(store);
    broadcastEvent('STORE_CREATED', store);
    res.status(201).json({ data: store });
  });

  app.patch('/api/stores/:id', checkRoleOrDev('administrador'), (req, res) => {
    const store = stores.find((entry) => entry.id === req.params.id);
    if (!store) return res.sendStatus(404);
    if (req.body.category && req.body.category !== 'spa') {
      return res.status(400).json({ message: 'Solo se pueden registrar sedes de Aura Spa.' });
    }
    const input = branchInput({ ...store, ...req.body });
    if (!input) return res.status(400).json({ message: 'Revisa el nombre y la dirección de la sede.' });
    Object.assign(store, input);
    broadcastEvent('STORE_UPDATED', store);
    res.json({ data: store });
  });

  app.delete('/api/stores/:id', checkRoleOrDev('administrador'), (req, res) => {
    const store = stores.find((entry) => entry.id === req.params.id);
    if (!store) return res.sendStatus(404);
    store.active = false;
    broadcastEvent('STORE_UPDATED', store);
    res.json({ success: true });
  });

  app.get('/api/stores/:id/products', checkRoleOrDev('cliente', 'administrador', 'repartidor'), (req, res) => {
    const admin = req.user.role === 'administrador';
    const store = stores.find((entry) => entry.id === req.params.id && (admin || entry.active !== false));
    if (!store) return res.sendStatus(404);
    const products = store.products || [];
    res.json({ data: admin ? products : products.filter((product) => product.available) });
  });

  app.post('/api/stores/:id/products', checkRoleOrDev('administrador'), (req, res) => {
    const store = stores.find((entry) => entry.id === req.params.id);
    if (!store) return res.sendStatus(404);
    const product = productInput(req.body);
    if (!product) return res.status(400).json({ message: 'Ingresa un producto y un precio válido en pesos.' });
    const created = { id: randomUUID(), ...product };
    store.products ||= [];
    store.products.push(created);
    broadcastEvent('PRODUCT_ADDED', { storeId: store.id, product: created });
    res.status(201).json({ data: created });
  });

  app.patch('/api/stores/:storeId/products/:productId', checkRoleOrDev('administrador'), (req, res) => {
    const store = stores.find((entry) => entry.id === req.params.storeId);
    const current = store?.products?.find((entry) => entry.id === req.params.productId);
    if (!current) return res.sendStatus(404);
    const input = productInput({ ...current, ...req.body });
    if (!input) return res.status(400).json({ message: 'Revisa el producto y su precio.' });
    Object.assign(current, input);
    broadcastEvent('STORE_UPDATED', store);
    res.json({ data: current });
  });

  app.delete('/api/stores/:storeId/products/:productId', checkRoleOrDev('administrador'), (req, res) => {
    const store = stores.find((entry) => entry.id === req.params.storeId);
    const product = store?.products?.find((entry) => entry.id === req.params.productId);
    if (!product) return res.sendStatus(404);
    product.available = false;
    broadcastEvent('STORE_UPDATED', store);
    res.json({ success: true });
  });

  // ==========================================
  // 3. ESTRELLITAS DE ENTREGA (DELIVERY STARS ⭐)
  // ==========================================

  app.get('/api/delivery-stars', checkRoleOrDev('administrador', 'repartidor'), (req, res) => {
    res.json({ success: true, count: deliveryStars.length, data: deliveryStars });
  });

  // Crear estrellita: Repartidores o Administradores
  app.post('/api/delivery-stars', checkRoleOrDev('repartidor', 'administrador'), (req, res) => {
    const newStar = {
      id: `star-${Date.now().toString().slice(-4)}`,
      createdAt: 'Justo ahora',
      stars: 5,
      createdBy: req.user ? `${req.user.name} (${req.user.role})` : 'Repartidor de turno',
      ...req.body,
    };
    deliveryStars.unshift(newStar);
    broadcastEvent('DELIVERY_STAR_ADDED', newStar);
    res.status(201).json({ success: true, data: newStar });
  });

  // ==========================================
  // 4. TRABAJADORES (WORKERS / COURIERS)
  // ==========================================

  app.get('/api/workers', checkRoleOrDev('administrador', 'repartidor', 'cliente'), (req, res) => {
    const visibleWorkers = req.user.role === 'cliente' && req.user.id !== 'sandbox'
      ? workers.filter((worker) => orders.some((order) =>
        order.customerId === req.user.id && order.assignedWorkerId === worker.id))
      : workers;
    res.json({ success: true, count: visibleWorkers.length, data: visibleWorkers });
  });

  app.post('/api/workers', checkRoleOrDev('administrador'), (req, res) => {
    const newWorker = {
      id: `cow-${Date.now().toString().slice(-4)}`,
      ...req.body,
    };
    workers.unshift(newWorker);
    broadcastEvent('WORKER_CREATED', newWorker);
    res.status(201).json({ success: true, data: newWorker });
  });

  app.patch('/api/workers/:id', checkRoleOrDev('administrador', 'repartidor'), (req, res) => {
    const current = workers.find((worker) => worker.id === req.params.id);
    if (!current) return res.sendStatus(404);
    if (req.user.role === 'repartidor') {
      if (req.user.id !== current.id) return res.sendStatus(403);
      if (!['disponible', 'descanso'].includes(req.body.status) || current.status === 'en_ruta') {
        return res.sendStatus(409);
      }
      current.status = req.body.status;
    } else {
      Object.assign(current, { ...req.body, id: current.id });
    }
    const updated = current;
    broadcastEvent('WORKER_UPDATED', updated);
    res.json({ success: true, data: updated });
  });

  app.post('/api/workers/simulate-movement', sandboxOnly, (req, res) => {
    workers = workers.map((w) => {
      const deltaLat = (Math.random() - 0.5) * 0.0016;
      const deltaLng = (Math.random() - 0.5) * 0.0016;
      const newBattery = Math.max(10, w.batteryLevel - Math.floor(Math.random() * 2));
      return {
        ...w,
        coordinates: {
          latitude: Number((w.coordinates.latitude + deltaLat).toFixed(5)),
          longitude: Number((w.coordinates.longitude + deltaLng).toFixed(5)),
        },
        batteryLevel: newBattery,
        lastUpdate: 'En vivo (movimiento detectado)',
      };
    });
    broadcastEvent('WORKERS_MOVED', workers);
    res.json({ success: true, count: workers.length, data: workers });
  });

  // ==========================================
  // 5. ÓRDENES (ORDERS)
  // ==========================================

  function canReadOrder(order, user) {
    if (sandboxEnabled && user.id === 'sandbox') return true;
    if (user.role === 'administrador') return true;
    if (user.role === 'cliente') return order.customerId === user.id;
    return order.assignedWorkerId === user.id;
  }

  function orderForUser(order, user) {
    if (user.role === 'cliente' || (sandboxEnabled && user.id === 'sandbox')) return order;
    const { securityPin, customerId, ...visibleOrder } = order;
    return visibleOrder;
  }

  app.get('/api/orders', checkRoleOrDev('administrador', 'repartidor', 'cliente'), (req, res) => {
    const visibleOrders = orders.filter((order) => canReadOrder(order, req.user))
      .map((order) => orderForUser(order, req.user));
    res.json({ success: true, count: visibleOrders.length, data: visibleOrders });
  });

  app.post('/api/orders', checkRoleOrDev('cliente', 'administrador'), (req, res) => {
    const isAuto = systemSettings.dispatchMode === 'automatic';
    const isSandboxRequest = sandboxEnabled && req.user.id === 'sandbox';
    const { customerAddress, customerCoordinates, customerNotes, customerTip = 0 } = req.body;
    const requestedStore = req.body.storeId || req.body.store?.id;
    const branch = stores.find((entry) => entry.id === requestedStore && entry.active !== false);
    if (!branch || typeof customerAddress !== 'string' || !customerAddress.trim() ||
        !Array.isArray(req.body.items) || req.body.items.length === 0 || req.body.items.length > 50 ||
        !Number.isSafeInteger(customerTip) || customerTip < 0 || customerTip > 1000000) {
      return res.status(400).json({ message: 'El pedido requiere una sede de Aura Spa, productos y dirección de entrega.' });
    }

    const items = [];
    for (const input of req.body.items) {
      const product = branch.products?.find((entry) => entry.id === input?.id && entry.available);
      if (!product || !Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 99 ||
          items.some((item) => item.id === product.id)) {
        return res.status(409).json({ message: 'Revisa los productos, cantidades y disponibilidad del carrito.' });
      }
      items.push({ id: product.id, name: product.name, price: product.price, quantity: input.quantity });
    }

    const { products, ...store } = branch;
    const basePay = 5500;
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalEarnings = basePay + customerTip;
    const totalToPay = subtotal + totalEarnings;
    if (req.body.expectedTotal !== undefined && req.body.expectedTotal !== totalToPay) {
      return res.status(409).json({ message: 'El precio cambió. Revisa el total del carrito antes de confirmar.' });
    }
    const id = randomUUID();
    const assignedWorkerId = isSandboxRequest && req.body.assignedWorkerId
      ? req.body.assignedWorkerId
      : (isAuto ? workers.find((worker) => worker.status === 'disponible')?.id : null) || null;

    const newOrder = {
      store,
      customerAddress: customerAddress.trim(),
      customerCoordinates,
      customerNotes: typeof customerNotes === 'string' ? customerNotes : '',
      items,
      subtotal,
      totalToPay,
      basePay,
      customerTip,
      partnerBonus: 0,
      totalEarnings,
      paymentMethod: 'Efectivo contraentrega',
      id,
      orderCode: `#FHS-${id.slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: assignedWorkerId ? 'ofertado' : 'pendiente',
      assignedWorkerId,
      customerId: req.user.id,
      customerName: isSandboxRequest ? req.body.customerName : req.user.name,
      customerPhone: isSandboxRequest ? req.body.customerPhone : req.user.phone || '',
      dispatchModeUsed: systemSettings.dispatchMode,
      securityPin: isSandboxRequest && req.body.securityPin ? req.body.securityPin : String(randomInt(1000, 10000)),
    };

    orders.unshift(newOrder);
    const assignedWorker = workers.find((worker) => worker.id === assignedWorkerId);
    if (assignedWorker) assignedWorker.status = 'en_ruta';
    broadcastEvent('ORDER_CREATED', newOrder);
    res.status(201).json({ success: true, data: orderForUser(newOrder, req.user) });
  });

  const nextOrderStatus = {
    ofertado: 'rumbo_tienda',
    rumbo_tienda: 'en_tienda',
    en_tienda: 'rumbo_cliente',
    rumbo_cliente: 'entregado',
  };

  app.patch('/api/orders/:id/status', checkRoleOrDev('repartidor', 'administrador'), (req, res) => {
    const { status, pin } = req.body;
    const order = orders.find((entry) => entry.id === req.params.id);
    if (!order || !canReadOrder(order, req.user)) return res.sendStatus(404);

    if (!sandboxEnabled && (!nextOrderStatus[order.status] || nextOrderStatus[order.status] !== status)) {
      return res.status(409).json({ success: false, message: 'El estado del pedido cambió.' });
    }
    if (!sandboxEnabled && status === 'entregado' && pin !== order.securityPin) {
      return res.status(400).json({ success: false, message: 'Código de entrega incorrecto.' });
    }

    order.status = status;
    if (status === 'entregado') {
      const worker = workers.find((entry) => entry.id === order.assignedWorkerId);
      if (worker) worker.status = 'disponible';
    }
    broadcastEvent('ORDER_STATUS_CHANGED', order);
    res.json({ success: true, data: orderForUser(order, req.user) });
  });

  app.post('/api/orders/:id/assign', checkRoleOrDev('administrador'), (req, res) => {
    const { workerId } = req.body;
    const order = orders.find((entry) => entry.id === req.params.id);
    const worker = workers.find((entry) => entry.id === workerId);
    if (!order || !worker) return res.sendStatus(404);
    if (!['pendiente', 'ofertado'].includes(order.status) || worker.status !== 'disponible') {
      return res.status(409).json({ success: false, message: 'El pedido o el repartidor ya no está disponible.' });
    }

    const previousWorker = workers.find((entry) => entry.id === order.assignedWorkerId);
    if (previousWorker) previousWorker.status = 'disponible';
    order.assignedWorkerId = workerId;
    order.status = 'ofertado';
    worker.status = 'en_ruta';

    broadcastEvent('ORDER_ASSIGNED', { order, workerId });
    res.json({ success: true, data: orderForUser(order, req.user) });
  });

  // ==========================================
  // 5.1. CONFIGURACIÓN Y MODOS DE DESPACHO (SOLO ADMINS)
  // ==========================================

  // Obtener configuración global
  app.get('/api/settings', (req, res) => {
    res.json({ success: true, data: systemSettings });
  });

  // Cambiar modo de despacho: SOLO ADMINISTRADORES
  app.patch('/api/settings/dispatch-mode', checkRoleOrDev('administrador'), (req, res) => {
    const mode = req.body.dispatchMode || req.body.mode;
    if (mode !== 'manual' && mode !== 'automatic') {
      return res.status(400).json({
        success: false,
        message: 'dispatchMode inválido. Debe ser "manual" o "automatic".',
      });
    }

    systemSettings.dispatchMode = mode;
    systemSettings.updatedAt = new Date().toISOString();

    broadcastEvent('DISPATCH_MODE_CHANGED', systemSettings);
    res.json({
      success: true,
      message: `Modo de despacho configurado a: ${
        mode === 'manual' ? 'Manual por Administrador (Por Defecto)' : 'Automático por la App'
      }`,
      data: systemSettings,
    });
  });

  // ==========================================
  // ==========================================
  // 6. MENSAJES Y SALAS DE RADIO / REUNIONES EN VIVO
  // ==========================================

  app.get('/api/messages', checkRoleOrDev('administrador', 'repartidor'), (req, res) => {
    res.json({ success: true, count: messages.length, data: messages });
  });

  app.post('/api/messages', checkRoleOrDev('administrador', 'repartidor'), (req, res) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      timeAgo: 'Justo ahora',
      likes: 1,
      ...req.body,
    };
    messages.unshift(newMsg);
    broadcastEvent('MESSAGE_CREATED', newMsg);

    // Sincronizar también con la sala de radio
    const targetRoom = radioRooms.find((r) => r.id === 'room-1') || radioRooms[0];
    if (targetRoom && newMsg.text) {
      const cleanText = newMsg.text.replace(/^📻\s*\[[^\]]+\]:\s*/, '');
      const tx = {
        id: `tx-${Date.now()}`,
        roomId: targetRoom.id,
        senderId: newMsg.senderId || 'cow-1',
        senderName: newMsg.senderName || 'Repartidor FHS',
        senderVehicle: newMsg.senderVehicle || 'moto',
        audioText: cleanText,
        tag: newMsg.tag || 'general',
        durationSec: Math.max(2, Math.round(cleanText.split(' ').length * 0.4)),
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
      };
      targetRoom.transmissions = [tx, ...targetRoom.transmissions.slice(0, 49)];
      broadcastEvent('RADIO_VOICE_TRANSMISSION', { roomId: targetRoom.id, transmission: tx, room: targetRoom });
    }

    res.status(201).json({ success: true, data: newMsg });
  });

  // Listar todas las salas de radio / canales
  app.get('/api/radio/rooms', checkRoleOrDev('administrador', 'repartidor'), (req, res) => {
    res.json({ success: true, count: radioRooms.length, data: radioRooms });
  });

  // Obtener detalle de una sala de radio
  app.get('/api/radio/rooms/:id', checkRoleOrDev('administrador', 'repartidor'), (req, res) => {
    const room = radioRooms.find((r) => r.id === req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Sala de radio no encontrada' });
    }
    res.json({ success: true, data: room });
  });

  // Unirse a una sala de radio / reunión de voz
  app.post('/api/radio/rooms/:id/join', checkRoleOrDev('administrador', 'repartidor'), (req, res) => {
    const room = radioRooms.find((r) => r.id === req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Sala de radio no encontrada' });
    }
    const { id, name, role = 'repartidor', vehicle = 'moto', batteryLevel = 90, avatarColor = '#FF441F' } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'id de usuario requerido' });
    }

    // Si ya estaba en la sala, actualizar estado
    const existingIdx = room.participants.findIndex((p) => p.id === id);
    const participant = {
      id,
      name: name || 'Repartidor FHS',
      role,
      vehicle,
      batteryLevel,
      avatarColor,
      isSpeaking: false,
      isMuted: false,
      joinedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      room.participants[existingIdx] = { ...room.participants[existingIdx], ...participant };
    } else {
      room.participants.push(participant);
    }

    broadcastEvent('RADIO_PARTICIPANT_JOINED', { roomId: room.id, participant, room });
    res.json({ success: true, data: room, participant });
  });

  // Salir de una sala de radio
  app.post('/api/radio/rooms/:id/leave', checkRoleOrDev('administrador', 'repartidor'), (req, res) => {
    const room = radioRooms.find((r) => r.id === req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Sala de radio no encontrada' });
    }
    const { userId } = req.body;
    room.participants = room.participants.filter((p) => p.id !== userId);

    broadcastEvent('RADIO_PARTICIPANT_LEFT', { roomId: room.id, userId, room });
    res.json({ success: true, data: room });
  });

  // Notificar estado de hablar / silencio (PTT)
  app.post('/api/radio/rooms/:id/speaking', checkRoleOrDev('administrador', 'repartidor'), (req, res) => {
    const room = radioRooms.find((r) => r.id === req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Sala de radio no encontrada' });
    }
    const { userId, isSpeaking = false } = req.body;
    const p = room.participants.find((part) => part.id === userId);
    if (p) {
      p.isSpeaking = !!isSpeaking;
    }
    broadcastEvent('RADIO_PARTICIPANT_SPEAKING', { roomId: room.id, userId, isSpeaking });
    res.json({ success: true, data: { userId, isSpeaking } });
  });

  // Transmitir mensaje de voz / nota de radio en vivo
  app.post('/api/radio/rooms/:id/broadcast', checkRoleOrDev('administrador', 'repartidor'), (req, res) => {
    const room = radioRooms.find((r) => r.id === req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Sala de radio no encontrada' });
    }
    const {
      senderId = 'cow-1',
      senderName = 'Repartidor FHS',
      senderVehicle = 'moto',
      audioText = '',
      tag = 'general',
      durationSec = 3,
    } = req.body;

    if (!audioText.trim()) {
      return res.status(400).json({ success: false, message: 'El texto de audio no puede estar vacío' });
    }

    const newTx = {
      id: `tx-${Date.now()}`,
      roomId: room.id,
      senderId,
      senderName,
      senderVehicle,
      audioText: audioText.trim(),
      tag,
      durationSec: Math.max(2, Math.round(durationSec || audioText.trim().split(' ').length * 0.4)),
      timestamp: new Date().toISOString(),
      timeAgo: 'Justo ahora',
    };

    room.transmissions = [newTx, ...room.transmissions.slice(0, 49)];

    // Sincronizar también con messages para compatibilidad
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      senderVehicle,
      text: `📻 [${room.name}]: ${audioText}`,
      timeAgo: 'Justo ahora',
      tag,
      likes: 1,
    };
    messages.unshift(newMsg);

    broadcastEvent('RADIO_VOICE_TRANSMISSION', { roomId: room.id, transmission: newTx, room });
    broadcastEvent('MESSAGE_CREATED', newMsg);

    res.status(201).json({ success: true, data: newTx, room });
  });

  // ==========================================
  // 7. RESTABLECER DATOS (RESET)
  // ==========================================

  app.post('/api/reset', sandboxOnly, checkRoleOrDev('administrador'), (req, res) => {
    stores = JSON.parse(JSON.stringify(INITIAL_STORES));
    workers = JSON.parse(JSON.stringify(INITIAL_WORKERS));
    orders = [];
    messages = [];
    deliveryStars = [];
    radioRooms = defaultRadioRooms();
    systemSettings = {
      dispatchMode: 'manual', // Vuelve al modo por defecto
      serverOnline: true,
      serverVersion: '2.4.0',
      serverMessage: 'Aura Spa en línea',
      updatedAt: new Date().toISOString(),
    };
    broadcastEvent('RESET_ALL', {
      stores,
      workers,
      orders,
      messages,
      deliveryStars,
      radioRooms,
      systemSettings,
    });
    res.json({ success: true, message: 'Datos de pruebas restablecidos' });
  });

  app.get('/', (req, res) => {
    res.json({ service: 'Aura Spa' });
  });
  app.use((req, res) => res.status(404).json({ message: 'El recurso no está disponible.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === 'entity.too.large') return res.status(413).json({ message: 'La solicitud es demasiado grande.' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'La solicitud no es JSON válido.' });
    if (error.code === 'EMAIL_ALREADY_EXISTS') return res.status(409).json({ message: 'Ese correo ya pertenece a otra cuenta.' });
    console.error('Error en la API de Aura Spa', error.name);
    res.status(500).json({ message: 'No se pudo completar la operación.' });
  });
  return app;
}
