const express = require('express');
const cors = require('cors');
const {
  VALID_ROLES,
  validateEmail,
  validatePasswordStrength,
  hashPassword,
  hashPasswordSync,
  comparePassword,
  generateToken,
  sanitizeUser,
  securityHeadersMiddleware,
  authenticateToken,
  authorizeRoles,
  checkRoleOrDev,
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware de seguridad y parseo
app.use(securityHeadersMiddleware);
app.use(cors());
app.use(express.json());

// ==========================================
// BASE DE DATOS EN MEMORIA (INICIALIZACIÓN)
// ==========================================

const INITIAL_USERS = [
  {
    id: 'usr-admin-1',
    name: 'Laura Gómez (Admin)',
    email: 'admin@fhs.com',
    password: hashPasswordSync('Admin123!'),
    role: 'administrador',
    phone: '+57 310 999 1122',
    department: 'Torre de Control & Despacho',
    createdAt: '2026-10-01T08:00:00.000Z',
    lastLogin: null,
  },
  {
    id: 'usr-driver-1',
    name: 'Carlos Mendoza',
    email: 'repartidor@fhs.com',
    password: hashPasswordSync('Repartidor123!'),
    role: 'repartidor',
    phone: '+57 311 555 4433',
    vehicle: 'moto',
    vehicleModel: 'Yamaha FZ25',
    plate: 'XYZ-89E',
    workerId: 'cow-1',
    createdAt: '2026-10-01T08:30:00.000Z',
    lastLogin: null,
  },
  {
    id: 'usr-client-1',
    name: 'Santiago Ramírez',
    email: 'cliente@fhs.com',
    password: hashPasswordSync('Cliente123!'),
    role: 'cliente',
    phone: '+57 314 982 7710',
    address: 'Cra. 14 #94-44, Chicó, Bogotá',
    createdAt: '2026-10-01T09:00:00.000Z',
    lastLogin: null,
  },
];

const INITIAL_STORES = [
  {
    id: 'store-1',
    name: 'Carulla Fresh Market - Calle 85',
    category: 'supermercado',
    partnerTier: 'diamond',
    rating: 4.9,
    reviewCount: 342,
    address: 'Cl. 85 #15-28, Zona Rosa',
    coordinates: { latitude: 4.6710, longitude: -74.0530 },
    distanceKm: 0.5,
    averagePrepTimeMin: 8,
    activeOrdersWaiting: 4,
    hasBonus: true,
    bonusAmount: 3200,
    bonusDescription: 'Bono +$3.200 COP por convenio de alta demanda',
    logo: '🛒',
    bannerColor: '#007A33',
    openingHours: '24 Horas',
    phone: '+57 311 200 4401',
    tags: ['Supermercado', 'Convenio Diamante', 'Retiro Express'],
    products: [
      { id: 'p-101', name: 'Canasta Frutas Frescas Seleccionadas', price: 24000, description: 'Mix de manzanas, uvas y duraznos premium', emoji: '🍎', available: true },
      { id: 'p-102', name: 'Pan de Masa Madre Artesanal', price: 12500, description: 'Horneado esta mañana con harina integral', emoji: '🥖', available: true },
      { id: 'p-103', name: 'Queso Holandés Madurado 250g', price: 18900, description: 'Sabor suave y cremoso con denominación de origen', emoji: '🧀', available: true },
      { id: 'p-104', name: 'Café Juan Valdez Colina 454g', price: 28000, description: 'Tueste medio con aroma floral y notas dulces', emoji: '☕', available: true },
    ],
  },
  {
    id: 'store-2',
    name: 'El Corral Burger Premium - Pq 93',
    category: 'restaurante',
    partnerTier: 'gold',
    rating: 4.8,
    reviewCount: 520,
    address: 'Cra. 12 #93-18, Parque de la 93',
    coordinates: { latitude: 4.6780, longitude: -74.0535 },
    distanceKm: 0.4,
    averagePrepTimeMin: 12,
    activeOrdersWaiting: 6,
    hasBonus: true,
    bonusAmount: 2500,
    bonusDescription: 'Bono +$2.500 COP fin de semana',
    logo: '🍔',
    bannerColor: '#D32F2F',
    openingHours: '11:00 AM - 11:30 PM',
    phone: '+57 315 889 1222',
    tags: ['Hamburguesas', 'Alta Demanda', 'Convenio Oficial'],
    products: [
      { id: 'p-201', name: 'Combo Corralísima Todo Terreno', price: 42000, description: 'Doble carne de res 250g, tocineta ahumada, queso y papas', emoji: '🍔', available: true },
      { id: 'p-202', name: 'Hamburguesa Vaquera BBQ Tocino', price: 34900, description: 'Carne asada a la parrilla con cebolla crujiente y BBQ', emoji: '🥩', available: true },
      { id: 'p-203', name: 'Papas en Cascos con Salsa Especial', price: 11000, description: 'Porción generosa sazonada con especias de la casa', emoji: '🍟', available: true },
      { id: 'p-204', name: 'Malteada de Arequipe y Caramelo', price: 15500, description: 'Batido cremoso con helado de vainilla y arequipe', emoji: '🥤', available: true },
    ],
  },
  {
    id: 'store-3',
    name: 'Farmatodo 24H - Cra 15',
    category: 'farmacia',
    partnerTier: 'diamond',
    rating: 4.9,
    reviewCount: 890,
    address: 'Cra. 15 #90-33, Chicó',
    coordinates: { latitude: 4.6740, longitude: -74.0590 },
    distanceKm: 0.45,
    averagePrepTimeMin: 5,
    activeOrdersWaiting: 3,
    hasBonus: true,
    bonusAmount: 2800,
    bonusDescription: 'Bono salud +$2.800 COP',
    logo: '💊',
    bannerColor: '#0047BA',
    openingHours: 'Abierto 24 Horas',
    phone: '+57 300 911 3450',
    tags: ['Medicamentos', 'Cuidado Personal', 'Mostrador Exclusivo'],
    products: [
      { id: 'p-301', name: 'Dolex Forte Acetaminofén x 24 tab', price: 14500, description: 'Alivio rápido para dolor de cabeza y fiebre', emoji: '💊', available: true },
      { id: 'p-302', name: 'Electrolit Suero Oral 625ml Fresa', price: 8200, description: 'Hidratación inmediata con electrolitos balanceados', emoji: '🧴', available: true },
      { id: 'p-303', name: 'Bloqueador Solar Isdin FPS 50', price: 89000, description: 'Fórmula ultra ligera toque seco no comedogénico', emoji: '☀️', available: true },
    ],
  },
  {
    id: 'store-4',
    name: 'Crepes & Waffles - Zona T',
    category: 'restaurante',
    partnerTier: 'gold',
    rating: 4.9,
    reviewCount: 1240,
    address: 'Cl. 83 #12-25, Zona T',
    coordinates: { latitude: 4.6675, longitude: -74.0545 },
    distanceKm: 0.8,
    averagePrepTimeMin: 15,
    activeOrdersWaiting: 5,
    hasBonus: false,
    bonusAmount: 0,
    bonusDescription: '',
    logo: '🧇',
    bannerColor: '#5D4037',
    openingHours: '12:00 PM - 10:00 PM',
    phone: '+57 310 445 7711',
    tags: ['Gourmet', 'Empaque Térmico'],
    products: [
      { id: 'p-401', name: 'Crepe de Pollo, Queso y Champiñones', price: 26500, description: 'Relleno cremoso en salsa blanca tradicional', emoji: '🥞', available: true },
      { id: 'p-402', name: 'Waffle con Arequipe y Helado', price: 18000, description: 'Waffle dorado crocante con bola de helado artesanal', emoji: '🧇', available: true },
    ],
  },
  {
    id: 'store-5',
    name: 'FHS Turbo Dark Store (10 min)',
    category: 'turbo',
    partnerTier: 'diamond',
    rating: 5.0,
    reviewCount: 3100,
    address: 'Cl. 92 #13A-40, Centro Logístico',
    coordinates: { latitude: 4.6765, longitude: -74.0515 },
    distanceKm: 0.35,
    averagePrepTimeMin: 2,
    activeOrdersWaiting: 8,
    hasBonus: true,
    bonusAmount: 4000,
    bonusDescription: 'Multiplicador Turbo 1.4x + $4.000 COP',
    logo: '⚡',
    bannerColor: '#FF441F',
    openingHours: 'Abierto 24 Horas',
    phone: '+57 320 000 8877',
    tags: ['Hub Oficial FHS', 'Entrega en 10 min', 'Despacho Inmediato'],
    products: [
      { id: 'p-501', name: 'Pack Cervezas Corona x 6 Latas', price: 26900, description: 'Cerveza clara helada 330ml lista para tomar', emoji: '🍺', available: true },
      { id: 'p-502', name: 'Papas Margarita Pollo Mega 170g', price: 7800, description: 'Papas fritas crujientes sabor a pollo', emoji: '🥔', available: true },
      { id: 'p-503', name: 'Helado Häagen-Dazs Dulce de Leche', price: 39900, description: 'Pote 473ml ultra cremoso importado', emoji: '🍨', available: true },
    ],
  },
];

const INITIAL_WORKERS = [
  {
    id: 'cow-1',
    name: 'Carlos Mendoza',
    nickname: 'El Rayo ⚡',
    vehicle: 'moto',
    vehicleModel: 'Yamaha FZ25',
    status: 'en_ruta',
    rating: 4.96,
    completedOrdersToday: 14,
    batteryLevel: 88,
    coordinates: { latitude: 4.6735, longitude: -74.0525 },
    distanceMeters: 280,
    currentZone: 'Zona Rosa',
    lastUpdate: 'Hace 30 seg',
    avatarColor: '#2979FF',
  },
  {
    id: 'cow-2',
    name: 'Valentina Ríos',
    nickname: 'Valen 🚴‍♀️',
    vehicle: 'bici',
    vehicleModel: 'Trek FX Eléctrica',
    status: 'disponible',
    rating: 4.92,
    completedOrdersToday: 11,
    batteryLevel: 74,
    coordinates: { latitude: 4.6765, longitude: -74.0565 },
    distanceMeters: 210,
    currentZone: 'Parque de la 93',
    lastUpdate: 'En vivo',
    avatarColor: '#00C853',
  },
  {
    id: 'cow-3',
    name: 'Mateo Silva',
    nickname: 'Teo',
    vehicle: 'moto',
    vehicleModel: 'Bajaj Pulsar NS200',
    status: 'en_tienda',
    rating: 4.89,
    completedOrdersToday: 16,
    batteryLevel: 62,
    coordinates: { latitude: 4.6715, longitude: -74.0538 },
    distanceMeters: 430,
    currentZone: 'Carulla Cll 85',
    lastUpdate: 'Hace 1 min',
    avatarColor: '#FF9100',
  },
  {
    id: 'cow-4',
    name: 'Andrés Peña',
    nickname: 'Pecoso',
    vehicle: 'moto',
    vehicleModel: 'Honda CB 190R',
    status: 'disponible',
    rating: 4.98,
    completedOrdersToday: 18,
    batteryLevel: 91,
    coordinates: { latitude: 4.6790, longitude: -74.0510 },
    distanceMeters: 590,
    currentZone: 'Chicó Norte',
    lastUpdate: 'En vivo',
    avatarColor: '#00C853',
  },
];

const INITIAL_ORDERS = [
  {
    id: 'ord-8491',
    orderCode: '#FHS-8491',
    store: INITIAL_STORES[1],
    customerName: 'Mariana Duarte',
    customerPhone: '+57 314 982 7710',
    customerAddress: 'Cra. 14 #94-44, Apto 502',
    customerNotes: 'Timbrar al 502',
    customerCoordinates: { latitude: 4.6795, longitude: -74.0558 },
    items: [
      { id: 'i-1', name: 'Combo Corralísima Todo Terreno', quantity: 2, price: 42000, checked: true },
    ],
    basePay: 8500,
    customerTip: 4500,
    partnerBonus: 2500,
    totalEarnings: 15500,
    distanceToStoreKm: 0.4,
    distanceToCustomerKm: 0.7,
    estimatedMinutes: 18,
    paymentMethod: 'Tarjeta (Pagado)',
    securityPin: '4821',
    status: 'entregado',
    createdAt: 'Hace 30 min',
  },
];

const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    senderId: 'cow-1',
    senderName: 'Carlos M. (Yamaha FZ)',
    senderVehicle: 'moto',
    text: '🌧️ Muchachos, empezó una llovizna suave por la 93, saquen el impermeable y manejen con precaución.',
    timeAgo: 'Hace 4 min',
    tag: 'clima',
    likes: 6,
  },
  {
    id: 'msg-2',
    senderId: 'cow-2',
    senderName: 'Valentina R. (Trek Bici)',
    senderVehicle: 'bici',
    text: '🍔 En El Corral del Parque 93 están entregando rapidísimo, 3 minutos por pedido. Buen flujo!',
    timeAgo: 'Hace 9 min',
    tag: 'tienda',
    likes: 8,
  },
];

const INITIAL_DELIVERY_STARS = [
  {
    id: 'star-1',
    address: 'Cra. 14 #94-44 (Edificio Nogales)',
    coordinates: { latitude: 4.6795, longitude: -74.0558 },
    notes: '⭐ Don Pedro en recepción recibe y avisa por citófono. Dejar moto en bahía derecha con candado.',
    stars: 5,
    createdBy: 'Carlos Mendoza (Yamaha FZ)',
    createdAt: 'Hace 2 horas',
  },
  {
    id: 'star-2',
    address: 'Cl. 85 #15-28 (Torre Santander)',
    coordinates: { latitude: 4.6715, longitude: -74.0535 },
    notes: '⭐ Timbrar al 402 directamente. Ascensor izquierdo más rápido. Cliente da muy buena propina.',
    stars: 5,
    createdBy: 'Mateo Silva (Pulsar)',
    createdAt: 'Ayer',
  },
  {
    id: 'star-3',
    address: 'Cra. 11 #90-10 (Edificio Virrey)',
    coordinates: { latitude: 4.6745, longitude: -74.0515 },
    notes: '⭐ Pedir ficha en portería peatonal. Parqueadero de motos techado gratis 15 min.',
    stars: 5,
    createdBy: 'Valentina Ríos (Trek)',
    createdAt: 'Ayer',
  },
];

const INITIAL_RADIO_ROOMS = [
  {
    id: 'room-1',
    channelNumber: 1,
    name: 'Canal 1: Zona 93 & Pq de la 93',
    description: 'Sala de operaciones principal y alertas inmediatas',
    zone: 'Zona Rosa / Parque 93',
    participants: [
      { id: 'cow-1', name: 'Carlos Mendoza (Tú)', role: 'repartidor', vehicle: 'moto', isSpeaking: false, isMuted: false, joinedAt: '2026-10-03T18:00:00.000Z', batteryLevel: 94, avatarColor: '#00C853' },
      { id: 'cow-2', name: 'Valentina Ríos (Trek)', role: 'repartidor', vehicle: 'bici', isSpeaking: false, isMuted: false, joinedAt: '2026-10-03T18:05:00.000Z', batteryLevel: 88, avatarColor: '#9C27B0' },
      { id: 'cow-3', name: 'Mateo Silva (Pulsar)', role: 'repartidor', vehicle: 'moto', isSpeaking: false, isMuted: false, joinedAt: '2026-10-03T18:10:00.000Z', batteryLevel: 76, avatarColor: '#2196F3' },
      { id: 'cow-4', name: 'Andrés Gómez (Honda)', role: 'repartidor', vehicle: 'moto', isSpeaking: false, isMuted: false, joinedAt: '2026-10-03T18:12:00.000Z', batteryLevel: 82, avatarColor: '#FF9800' },
    ],
    transmissions: [
      {
        id: 'tx-1',
        roomId: 'room-1',
        senderId: 'cow-3',
        senderName: 'Mateo Silva (Pulsar 200)',
        senderVehicle: 'moto',
        audioText: 'Muchachos, la Cra 15 con Calle 93 tiene trancón pesado por camión varado. Recomiendo bajar por la 11.',
        tag: 'trafico',
        durationSec: 4,
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        timeAgo: 'Hace 3 min',
      },
      {
        id: 'tx-2',
        roomId: 'room-1',
        senderId: 'cow-2',
        senderName: 'Valentina Ríos (Trek Bici)',
        senderVehicle: 'bici',
        audioText: 'El Corral del Parque 93 tiene los pedidos listos en mesa, entran y salen en 2 minutos sin esperar.',
        tag: 'tienda',
        durationSec: 3,
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        timeAgo: 'Hace 8 min',
      },
      {
        id: 'tx-3',
        roomId: 'room-1',
        senderId: 'cow-1',
        senderName: 'Carlos Mendoza (Yamaha FZ)',
        senderVehicle: 'moto',
        audioText: 'Llovizna suave sobre la 85. Pendientes con las líneas blancas del asfalto que están resbalosas.',
        tag: 'clima',
        durationSec: 4,
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        timeAgo: 'Hace 15 min',
      },
    ],
  },
  {
    id: 'room-2',
    channelNumber: 2,
    name: 'Canal 2: Chapinero & Chicó',
    description: 'Coordinación cuadrante centro-norte y comercio gastronómico',
    zone: 'Chapinero / Chicó',
    participants: [
      { id: 'cow-5', name: 'Daniela Torres (KTM)', role: 'repartidor', vehicle: 'moto', isSpeaking: false, isMuted: false, joinedAt: '2026-10-03T18:15:00.000Z', batteryLevel: 91, avatarColor: '#E91E63' },
      { id: 'cow-6', name: 'Sebastián Mora (Fixie)', role: 'repartidor', vehicle: 'bici', isSpeaking: false, isMuted: false, joinedAt: '2026-10-03T18:20:00.000Z', batteryLevel: 65, avatarColor: '#00BCD4' },
    ],
    transmissions: [
      {
        id: 'tx-201',
        roomId: 'room-2',
        senderId: 'cow-5',
        senderName: 'Daniela Torres (KTM)',
        senderVehicle: 'moto',
        audioText: 'Semáforos de la 67 con 7ma intermitentes, pasen con precaución compañeros.',
        tag: 'trafico',
        durationSec: 3,
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        timeAgo: 'Hace 20 min',
      },
    ],
  },
  {
    id: 'room-3',
    channelNumber: 3,
    name: 'Canal 3: Usaquén & Santa Bárbara',
    description: 'Entregas express y urbanizaciones residenciales',
    zone: 'Usaquén',
    participants: [
      { id: 'cow-7', name: 'Felipe Vargas (Scooter)', role: 'repartidor', vehicle: 'bici', isSpeaking: false, isMuted: false, joinedAt: '2026-10-03T18:22:00.000Z', batteryLevel: 84, avatarColor: '#4CAF50' },
    ],
    transmissions: [],
  },
  {
    id: 'room-4',
    channelNumber: 4,
    name: 'Canal 4: Emergencias & Reportes Viales',
    description: 'Alertas prioritarias de lluvia, retenes y asistencia mecánica',
    zone: 'Toda la ciudad',
    participants: [
      { id: 'usr-admin-1', name: 'Torre de Control FHS (Admin)', role: 'administrador', vehicle: 'auto', isSpeaking: false, isMuted: false, joinedAt: '2026-10-03T18:00:00.000Z', batteryLevel: 100, avatarColor: '#FF441F' },
    ],
    transmissions: [
      {
        id: 'tx-401',
        roomId: 'room-4',
        senderId: 'usr-admin-1',
        senderName: 'Torre de Control FHS',
        senderVehicle: 'auto',
        audioText: 'Atención equipo FHS: lluvia generalizada reportada. El tiempo límite de entrega se amplió 10 minutos.',
        tag: 'alerta',
        durationSec: 5,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        timeAgo: 'Hace 30 min',
      },
    ],
  },
];

// Almacenamiento en Memoria
let users = JSON.parse(JSON.stringify(INITIAL_USERS));
let stores = JSON.parse(JSON.stringify(INITIAL_STORES));
let workers = JSON.parse(JSON.stringify(INITIAL_WORKERS));
let orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
let messages = JSON.parse(JSON.stringify(INITIAL_MESSAGES));
let deliveryStars = JSON.parse(JSON.stringify(INITIAL_DELIVERY_STARS));
let radioRooms = JSON.parse(JSON.stringify(INITIAL_RADIO_ROOMS));
let systemSettings = {
  dispatchMode: 'manual', // 'manual' (Modo por defecto: admin asigna) | 'automatic' (la app asigna)
  serverOnline: true,
  serverVersion: '2.4.0',
  serverMessage: '🟢 Servidor FHS en Línea y Conectado',
  updatedAt: new Date().toISOString(),
};
let sseClients = [];

function broadcastEvent(eventType, data) {
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
    serverMessage: '🟢 Servidor FHS en Línea y Operativo',
    dispatchMode: systemSettings.dispatchMode,
    timestamp: new Date().toISOString(),
  });
});

// SSE Real-time Endpoint
app.get('/api/stream', (req, res) => {
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
      users: users.map(sanitizeUser),
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
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'cliente', phone, ...extra } = req.body;

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

    // Hash con bcrypt (salt rounds = 10)
    const hashedPassword = await hashPassword(password);

    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role,
      phone: phone || '',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      ...extra,
    };

    users.push(newUser);

    // Si el usuario es un repartidor, integrarlo automáticamente a la flota
    if (role === 'repartidor') {
      const newWorker = {
        id: `cow-${Date.now().toString().slice(-4)}`,
        name: newUser.name,
        nickname: extra.nickname || newUser.name.split(' ')[0],
        vehicle: extra.vehicle || 'moto',
        vehicleModel: extra.vehicleModel || 'Motocicleta Estándar',
        status: 'disponible',
        rating: 5.0,
        completedOrdersToday: 0,
        batteryLevel: 100,
        coordinates: { latitude: 4.6730, longitude: -74.0530 },
        distanceMeters: 300,
        currentZone: 'Zona Rosa',
        lastUpdate: 'En vivo (registro)',
        avatarColor: '#2979FF',
      };
      workers.unshift(newWorker);
      broadcastEvent('WORKER_CREATED', newWorker);
    }

    const token = generateToken(newUser);
    broadcastEvent('USER_REGISTERED', sanitizeUser(newUser));

    res.status(201).json({
      success: true,
      message: `Usuario registrado exitosamente con rol '${role}'`,
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno en el servidor', error: error.message });
  }
});

// 1.2 Inicio de Sesión (Login con JWT)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
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

    const passwordMatches = await comparePassword(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas. Verifica tu correo y contraseña.',
      });
    }

    // Actualizar marca temporal de inicio de sesión
    user.lastLogin = new Date().toISOString();

    const token = generateToken(user);

    res.json({
      success: true,
      message: `Bienvenido(a), ${user.name}`,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno en login', error: error.message });
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
app.patch('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const userIndex = users.findIndex((u) => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const { name, phone, address, vehicle, vehicleModel, currentPassword, newPassword } = req.body;
    const user = users[userIndex];

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (vehicle !== undefined) user.vehicle = vehicle;
    if (vehicleModel !== undefined) user.vehicleModel = vehicleModel;

    // Cambio seguro de contraseña
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Debes proporcionar tu contraseña actual' });
      }
      const isCurrentValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentValid) {
        return res.status(401).json({ success: false, message: 'La contraseña actual es incorrecta' });
      }
      const pwdValidation = validatePasswordStrength(newPassword);
      if (!pwdValidation.valid) {
        return res.status(400).json({ success: false, message: pwdValidation.message });
      }
      user.password = await hashPassword(newPassword);
    }

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error actualizando perfil', error: error.message });
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

  user.role = role;
  broadcastEvent('USER_ROLE_CHANGED', sanitizeUser(user));
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

  users = users.filter((u) => u.id !== id);
  broadcastEvent('USER_DELETED', { id });
  res.json({ success: true, message: 'Usuario eliminado del sistema' });
});

// ==========================================
// 2. TIENDAS (STORES) Y PRODUCTOS
// ==========================================

app.get('/api/stores', (req, res) => {
  res.json({ success: true, count: stores.length, data: stores });
});

// Crear tienda: Solo Administrador
app.post('/api/stores', checkRoleOrDev('administrador'), (req, res) => {
  const newStore = {
    id: `store-${Date.now().toString().slice(-4)}`,
    products: [],
    ...req.body,
  };
  stores.unshift(newStore);
  broadcastEvent('STORE_CREATED', newStore);
  res.status(201).json({ success: true, data: newStore });
});

// Modificar tienda: Solo Administrador
app.patch('/api/stores/:id', checkRoleOrDev('administrador'), (req, res) => {
  const { id } = req.params;
  stores = stores.map((s) => (s.id === id ? { ...s, ...req.body } : s));
  const updated = stores.find((s) => s.id === id);
  broadcastEvent('STORE_UPDATED', updated);
  res.json({ success: true, data: updated });
});

// Eliminar tienda: Solo Administrador
app.delete('/api/stores/:id', checkRoleOrDev('administrador'), (req, res) => {
  stores = stores.filter((s) => s.id !== req.params.id);
  broadcastEvent('STORE_DELETED', { id: req.params.id });
  res.json({ success: true, message: 'Tienda eliminada' });
});

// Catálogo de Productos
app.get('/api/stores/:id/products', (req, res) => {
  const store = stores.find((s) => s.id === req.params.id);
  if (!store) return res.status(404).json({ success: false, message: 'Tienda no encontrada' });
  res.json({ success: true, data: store.products || [] });
});

// Agregar producto: Solo Administrador
app.post('/api/stores/:id/products', checkRoleOrDev('administrador'), (req, res) => {
  const store = stores.find((s) => s.id === req.params.id);
  if (!store) return res.status(404).json({ success: false, message: 'Tienda no encontrada' });

  const newProduct = {
    id: `p-${Date.now().toString().slice(-4)}`,
    available: true,
    emoji: '🍱',
    ...req.body,
  };
  if (!store.products) store.products = [];
  store.products.push(newProduct);

  broadcastEvent('PRODUCT_ADDED', { storeId: store.id, product: newProduct });
  res.status(201).json({ success: true, data: newProduct });
});

// Eliminar producto: Solo Administrador
app.delete('/api/stores/:storeId/products/:productId', checkRoleOrDev('administrador'), (req, res) => {
  const { storeId, productId } = req.params;
  const store = stores.find((s) => s.id === storeId);
  if (store && store.products) {
    store.products = store.products.filter((p) => p.id !== productId);
    broadcastEvent('PRODUCT_DELETED', { storeId, productId });
  }
  res.json({ success: true, message: 'Producto eliminado' });
});

// ==========================================
// 3. ESTRELLITAS DE ENTREGA (DELIVERY STARS ⭐)
// ==========================================

app.get('/api/delivery-stars', (req, res) => {
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

app.get('/api/workers', (req, res) => {
  res.json({ success: true, count: workers.length, data: workers });
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
  const { id } = req.params;
  workers = workers.map((w) => (w.id === id ? { ...w, ...req.body } : w));
  const updated = workers.find((w) => w.id === id);
  broadcastEvent('WORKER_UPDATED', updated);
  res.json({ success: true, data: updated });
});

app.post('/api/workers/simulate-movement', (req, res) => {
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

app.get('/api/orders', (req, res) => {
  res.json({ success: true, count: orders.length, data: orders });
});

// Crear orden: Clientes o Administradores
app.post('/api/orders', checkRoleOrDev('cliente', 'administrador'), (req, res) => {
  const isAuto = systemSettings.dispatchMode === 'automatic';

  // En modo manual (por defecto), el pedido queda 'pendiente' de ser asignado por el admin.
  // En modo automático, la app se encarga de asignarlo o ofertarlo al repartidor.
  let assignedWorkerId = req.body.assignedWorkerId || null;
  let status = req.body.status || (isAuto ? 'ofertado' : 'pendiente');

  if (isAuto && !assignedWorkerId) {
    const availableWorker = workers.find((w) => w.status === 'disponible') || workers[0];
    if (availableWorker) {
      assignedWorkerId = availableWorker.id;
      status = 'ofertado';
    }
  }

  const newOrder = {
    id: `ord-${Date.now().toString().slice(-4)}`,
    orderCode: `#FHS-${Date.now().toString().slice(-4)}`,
    createdAt: 'Justo ahora',
    status,
    assignedWorkerId,
    dispatchModeUsed: systemSettings.dispatchMode,
    ...req.body,
  };

  orders.unshift(newOrder);
  broadcastEvent('ORDER_CREATED', newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

// Cambiar estado de orden: Repartidores o Administradores
app.patch('/api/orders/:id/status', checkRoleOrDev('repartidor', 'administrador'), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  orders = orders.map((o) => (o.id === id ? { ...o, status } : o));
  const updated = orders.find((o) => o.id === id);
  broadcastEvent('ORDER_STATUS_CHANGED', updated);
  res.json({ success: true, data: updated });
});

// Asignar orden a repartidor: Administrador o Repartidor
app.post('/api/orders/:id/assign', checkRoleOrDev('administrador', 'repartidor'), (req, res) => {
  const { id } = req.params;
  const { workerId } = req.body;
  // Cuando el administrador asigna, el pedido pasa a ofertado para que el repartidor lo reciba
  orders = orders.map((o) => (o.id === id ? { ...o, assignedWorkerId: workerId, status: 'ofertado' } : o));
  workers = workers.map((w) => (w.id === workerId ? { ...w, status: 'en_ruta' } : w));

  const updatedOrder = orders.find((o) => o.id === id);
  broadcastEvent('ORDER_ASSIGNED', { order: updatedOrder, workerId });
  res.json({ success: true, data: updatedOrder });
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

app.get('/api/messages', (req, res) => {
  res.json({ success: true, count: messages.length, data: messages });
});

app.post('/api/messages', (req, res) => {
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
app.get('/api/radio/rooms', (req, res) => {
  res.json({ success: true, count: radioRooms.length, data: radioRooms });
});

// Obtener detalle de una sala de radio
app.get('/api/radio/rooms/:id', (req, res) => {
  const room = radioRooms.find((r) => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Sala de radio no encontrada' });
  }
  res.json({ success: true, data: room });
});

// Unirse a una sala de radio / reunión de voz
app.post('/api/radio/rooms/:id/join', (req, res) => {
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
app.post('/api/radio/rooms/:id/leave', (req, res) => {
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
app.post('/api/radio/rooms/:id/speaking', (req, res) => {
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
app.post('/api/radio/rooms/:id/broadcast', (req, res) => {
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

app.post('/api/reset', checkRoleOrDev('administrador'), (req, res) => {
  users = JSON.parse(JSON.stringify(INITIAL_USERS));
  stores = JSON.parse(JSON.stringify(INITIAL_STORES));
  workers = JSON.parse(JSON.stringify(INITIAL_WORKERS));
  orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
  messages = JSON.parse(JSON.stringify(INITIAL_MESSAGES));
  deliveryStars = JSON.parse(JSON.stringify(INITIAL_DELIVERY_STARS));
  radioRooms = JSON.parse(JSON.stringify(INITIAL_RADIO_ROOMS));
  systemSettings = {
    dispatchMode: 'manual', // Vuelve al modo por defecto
    serverOnline: true,
    serverVersion: '2.4.0',
    serverMessage: '🟢 Servidor FHS en Línea y Conectado',
    updatedAt: new Date().toISOString(),
  };
  broadcastEvent('RESET_ALL', {
    users: users.map(sanitizeUser),
    stores,
    workers,
    orders,
    messages,
    deliveryStars,
    radioRooms,
    systemSettings,
  });
  res.json({ success: true, message: 'Datos y usuarios restablecidos a valores originales' });
});

// ==========================================
// 8. DASHBOARD WEB DE CONTROL
// ==========================================

app.get('/', (req, res) => {
  const adminCount = users.filter((u) => u.role === 'administrador').length;
  const driverCount = users.filter((u) => u.role === 'repartidor').length;
  const clientCount = users.filter((u) => u.role === 'cliente').length;

  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FHS Central Hub • Servidor Seguro con Control de Roles</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0B0E14; color: #FFF; padding: 24px; margin: 0; }
    .card { background: #151922; border-radius: 16px; padding: 26px; max-width: 960px; margin: 0 auto; border: 1px solid #232B3B; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { color: #FF441F; margin: 0; font-size: 26px; display: flex; align-items: center; gap: 10px; }
    .subtitle { color: #8C96A5; margin-top: 6px; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin: 20px 0; }
    .box { background: #1B212D; padding: 14px; border-radius: 12px; text-align: center; border: 1px solid #262E3E; }
    .box-val { font-size: 24px; font-weight: 800; color: #FF441F; }
    .box-lbl { font-size: 11px; color: #8C96A5; margin-top: 4px; text-transform: uppercase; font-weight: 600; }
    .actions { display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap; }
    button { background: #FF441F; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: opacity 0.2s; }
    button:hover { opacity: 0.9; }
    .status-pill { display: inline-flex; align-items: center; gap: 6px; background: #12281D; color: #00E676; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid rgba(0,230,118,0.3); }
    .section-title { color: #CBD5E1; font-size: 16px; font-weight: 700; margin: 24px 0 12px 0; border-bottom: 1px solid #232B3B; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #232B3B; }
    th { color: #8C96A5; font-size: 11px; text-transform: uppercase; background: #1A202C; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .badge-admin { background: rgba(229, 57, 53, 0.2); color: #FF5252; border: 1px solid #FF5252; }
    .badge-repartidor { background: rgba(255, 145, 0, 0.2); color: #FFB300; border: 1px solid #FFB300; }
    .badge-cliente { background: rgba(0, 230, 118, 0.2); color: #00E676; border: 1px solid #00E676; }
    .endpoints { background: #0E1219; padding: 16px; border-radius: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.8; border: 1px solid #1E2533; }
    .method { font-weight: bold; width: 60px; display: inline-block; }
    .get { color: #69F0AE; }
    .post { color: #40C4FF; }
    .patch { color: #FFD740; }
    .del { color: #FF5252; }
    .lock { color: #FFD54F; margin-left: 6px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <h1>🛵 FHS Central Hub • Auth & RBAC</h1>
        <div class="subtitle">Servidor central con autenticación JWT, hashing bcrypt y roles estrictos.</div>
      </div>
      <span class="status-pill">● ACTIVO Y PROTEGIDO (Puerto ${PORT})</span>
    </div>
    
    <div class="grid">
      <div class="box"><div class="box-val">${users.length}</div><div class="box-lbl">Usuarios Totales</div></div>
      <div class="box"><div class="box-val" style="color:#FF5252;">${adminCount}</div><div class="box-lbl">Admins</div></div>
      <div class="box"><div class="box-val" style="color:#FFB300;">${driverCount}</div><div class="box-lbl">Repartidores</div></div>
      <div class="box"><div class="box-val" style="color:#00E676;">${clientCount}</div><div class="box-lbl">Clientes</div></div>
      <div class="box"><div class="box-val">${stores.length}</div><div class="box-lbl">Tiendas</div></div>
      <div class="box"><div class="box-val">${orders.length}</div><div class="box-lbl">Órdenes</div></div>
      <div class="box"><div class="box-val">${deliveryStars.length}</div><div class="box-lbl">⭐ Pines</div></div>
    </div>

    <div class="actions">
      <button onclick="fetch('/api/workers/simulate-movement', {method:'POST'}).then(()=>location.reload())">⚡ Simular Movimiento GPS</button>
      <button onclick="fetch('/api/reset', {method:'POST'}).then(()=>location.reload())" style="background:#455A64;">🔄 Restablecer Datos & Demo Users</button>
    </div>

    <div class="section-title">🔑 Cuentas Demo Preconfiguradas (Estándar OWASP)</div>
    <table>
      <thead>
        <tr>
          <th>Rol</th>
          <th>Nombre</th>
          <th>Correo Electrónico</th>
          <th>Contraseña</th>
          <th>Permisos Principales</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge badge-admin">administrador</span></td>
          <td>Laura Gómez</td>
          <td><code>admin@fhs.com</code></td>
          <td><code>Admin123!</code></td>
          <td>Gestión total: tiendas, productos, reasignación, usuarios y roles</td>
        </tr>
        <tr>
          <td><span class="badge badge-repartidor">repartidor</span></td>
          <td>Carlos Mendoza</td>
          <td><code>repartidor@fhs.com</code></td>
          <td><code>Repartidor123!</code></td>
          <td>Aceptación de pedidos, cambio de estado, marcar ⭐ estrellitas</td>
        </tr>
        <tr>
          <td><span class="badge badge-cliente">cliente</span></td>
          <td>Santiago Ramírez</td>
          <td><code>cliente@fhs.com</code></td>
          <td><code>Cliente123!</code></td>
          <td>Explorar catálogo, hacer pedidos, solicitar Domicilio Express</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">📡 Endpoints de Autenticación & Control de Roles (RBAC)</div>
    <div class="endpoints">
      <div><span class="method post">POST</span> /api/auth/register <span style="color:#8C96A5;">(Registro con validación de fortaleza OWASP y JWT)</span></div>
      <div><span class="method post">POST</span> /api/auth/login <span style="color:#8C96A5;">(Inicio de sesión con validación de credenciales en bcrypt)</span></div>
      <div><span class="method get">GET</span>  /api/auth/me <span class="lock">🔒 [Cualquier usuario autenticado]</span></div>
      <div><span class="method patch">PATCH</span>/api/auth/profile <span class="lock">🔒 [Actualizar perfil propio y cambio seguro de clave]</span></div>
      <div><span class="method get">GET</span>  /api/auth/users <span class="lock">🔒 [Solo Administrador - Ver todos los usuarios]</span></div>
      <div><span class="method patch">PATCH</span>/api/auth/users/:id/role <span class="lock">🔒 [Solo Administrador - Promover / Cambiar rol]</span></div>
      <div><span class="method del">DEL</span>  /api/auth/users/:id <span class="lock">🔒 [Solo Administrador - Eliminar usuario]</span></div>
      <div style="margin-top:10px; border-top: 1px dashed #232B3B; padding-top: 8px;">
        <div><span class="method get">GET</span>  /api/stores | <span class="method post">POST</span> | <span class="method patch">PATCH</span> | <span class="method del">DEL</span> <span class="lock">🔒 [POST/PATCH/DEL: Solo Administrador]</span></div>
        <div><span class="method get">GET</span>  /api/delivery-stars | <span class="method post">POST</span> <span class="lock">🔒 [POST: Repartidor o Administrador]</span></div>
        <div><span class="method get">GET</span>  /api/orders | <span class="method post">POST</span> | <span class="method patch">PATCH</span> :id/status <span class="lock">🔒 [POST: Cliente/Admin | Status: Repartidor/Admin]</span></div>
        <div><span class="method get">GET</span>  /api/stream <span style="color:#8C96A5;">(Server-Sent Events en tiempo real)</span></div>
      </div>
    </div>
  </div>
</body>
</html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[FHS Server Seguro] Corriendo en http://localhost:${PORT}`);
  console.log(`[Auth] Roles disponibles: ${VALID_ROLES.join(', ')}`);
});
