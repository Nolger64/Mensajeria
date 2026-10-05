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

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  checked?: boolean;
  price: number;
  emoji?: string;
}

export type OrderStep = 
  | 'pendiente'
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
  assignedWorkerId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  storeId: string;
  storeName: string;
}

export interface DeliveryStar {
  id: string;
  address: string;
  coordinates: Coordinates;
  notes: string;
  stars: number;
  createdBy: string;
  createdAt: string;
}

export type UserRole = 'administrador' | 'repartidor' | 'cliente';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  lastLogin?: string | null;
  department?: string;
  vehicle?: VehicleType;
  vehicleModel?: string;
  plate?: string;
  address?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

