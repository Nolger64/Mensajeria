export type StoreCategory = 
  | 'todos'
  | 'restaurante' 
  | 'supermercado' 
  | 'farmacia' 
  | 'turbo' 
  | 'express' 
  | 'licores';

export type PartnerTier = 'diamond' | 'gold' | 'silver';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  emoji: string;
  available: boolean;
}

export interface PartnerStore {
  id: string;
  name: string;
  category: StoreCategory;
  partnerTier: PartnerTier;
  rating: number;
  reviewCount: number;
  address: string;
  coordinates: Coordinates;
  distanceKm: number;
  averagePrepTimeMin: number;
  activeOrdersWaiting: number;
  hasBonus: boolean;
  bonusAmount: number;
  bonusDescription: string;
  logo: string;
  bannerColor: string;
  openingHours: string;
  phone: string;
  tags: string[];
  products?: Product[];
}

export type VehicleType = 'moto' | 'bici' | 'auto';
export type CoworkerStatus = 'disponible' | 'en_ruta' | 'en_tienda' | 'descanso';

export interface Coworker {
  id: string;
  name: string;
  nickname: string;
  vehicle: VehicleType;
  vehicleModel: string;
  status: CoworkerStatus;
  rating: number;
  completedOrdersToday: number;
  batteryLevel: number;
  coordinates: Coordinates;
  distanceMeters: number;
  currentZone: string;
  lastUpdate: string;
  avatarColor: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  alias: string;
  rating: number;
  level: string; // 'Diamante FHS'
  vehicle: VehicleType;
  vehicleModel: string;
  plate: string;
  isOnline: boolean;
  coordinates: Coordinates;
  todayEarnings: number;
  totalOrdersToday: number;
  acceptanceRate: number;
  onTimeRate: number;
  tipsToday: number;
  balanceAvailable: number;
  thermalBagVerified: boolean;
  soatActive: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  checked?: boolean;
  price: number;
}

export type OrderStep = 
  | 'ofertado' 
  | 'rumbo_tienda' 
  | 'en_tienda' 
  | 'rumbo_cliente' 
  | 'entregado';

export interface DeliveryOrder {
  id: string;
  orderCode: string;
  store: PartnerStore;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes: string;
  customerCoordinates: Coordinates;
  items: OrderItem[];
  basePay: number;
  customerTip: number;
  partnerBonus: number;
  totalEarnings: number;
  distanceToStoreKm: number;
  distanceToCustomerKm: number;
  estimatedMinutes: number;
  paymentMethod: 'Tarjeta (Pagado)' | 'Efectivo contraentrega';
  securityPin: string;
  status: OrderStep;
  createdAt: string;
}

export type MessageTag = 'trafico' | 'clima' | 'tienda' | 'alerta' | 'general';

export interface CommunityMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderVehicle: VehicleType;
  text: string;
  timeAgo: string;
  tag: MessageTag;
  likes: number;
}

// Estrellita de dirección marcada por domiciliarios para guiar a futuros compañeros
export interface DeliveryStar {
  id: string;
  address: string;
  coordinates: Coordinates;
  notes: string;
  stars: number;
  createdBy: string;
  createdAt: string;
}

// ==========================================
// SALAS DE RADIO Y REUNIONES DE VOZ EN VIVO
// ==========================================

export interface RadioParticipant {
  id: string;
  name: string;
  role: 'repartidor' | 'administrador' | 'cliente';
  vehicle: VehicleType;
  isSpeaking: boolean;
  isMuted: boolean;
  joinedAt: string;
  batteryLevel?: number;
  avatarColor?: string;
}

export interface VoiceTransmission {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderVehicle: VehicleType;
  audioText: string;
  tag: MessageTag;
  durationSec: number;
  timestamp: string;
  timeAgo: string;
}

export interface RadioRoom {
  id: string;
  channelNumber: number;
  name: string;
  description: string;
  zone: string;
  participants: RadioParticipant[];
  transmissions: VoiceTransmission[];
}

