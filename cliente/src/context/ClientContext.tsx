import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PartnerStore,
  Product,
  DeliveryOrder,
  CartItem,
  StoreCategory,
  Coworker,
} from '../types';
import { FHSApiService } from '../services/api';
import { INITIAL_CLIENT_STORES } from '../data/mockData';
import { LocationService } from '../services/locationService';
import { LocationPermissionModal } from '../components/Permissions/LocationPermissionModal';

interface PlaceExpressParams {
  pickupAddress: string;
  deliveryAddress: string;
  errandDescription: string;
  notes: string;
  tip: number;
  paymentMethod: 'Tarjeta (Pagado)' | 'Efectivo contraentrega';
}

interface ClientContextType {
  stores: PartnerStore[];
  categories: { id: StoreCategory; label: string; icon: string }[];
  selectedCategory: StoreCategory;
  setSelectedCategory: (cat: StoreCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Cart
  cart: CartItem[];
  cartStoreId: string | null;
  cartStoreName: string | null;
  addToCart: (product: Product, store: PartnerStore) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  totalCartItemCount: number;

  // Delivery Info
  deliveryAddress: string;
  setDeliveryAddress: (addr: string) => void;
  deliveryNotes: string;
  setDeliveryNotes: (notes: string) => void;

  locationPermissionGranted: boolean;
  showPermissionModal: boolean;
  requestLocationPermission: () => Promise<boolean>;
  dismissPermissionModal: () => void;

  // Orders & Tracking
  orders: DeliveryOrder[];
  activeOrder: DeliveryOrder | null;
  setActiveOrder: (order: DeliveryOrder | null) => void;
  placeStoreOrder: (tip: number, paymentMethod: 'Tarjeta (Pagado)' | 'Efectivo contraentrega') => Promise<DeliveryOrder | null>;
  placeExpressDelivery: (params: PlaceExpressParams) => Promise<DeliveryOrder | null>;
  refreshOrders: () => Promise<void>;

  // Couriers (for tracking display)
  workers: Coworker[];

  // Server Status
  isServerConnected: boolean;
  refreshStores: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const CATEGORIES_LIST: { id: StoreCategory; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todos', icon: '✨' },
  { id: 'restaurante', label: 'Restaurantes', icon: '🍔' },
  { id: 'supermercado', label: 'Supermercados', icon: '🛒' },
  { id: 'turbo', label: 'FHS Turbo 10m', icon: '⚡' },
  { id: 'farmacia', label: 'Farmacias', icon: '💊' },
  { id: 'licores', label: 'Licores & Drinks', icon: '🍾' },
  { id: 'express', label: 'Domicilio Express', icon: '🛵' },
];

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<PartnerStore[]>(INITIAL_CLIENT_STORES);
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartStoreId, setCartStoreId] = useState<string | null>(null);
  const [cartStoreName, setCartStoreName] = useState<string | null>(null);

  const [deliveryAddress, setDeliveryAddress] = useState('Cra. 14 #94-44, Chicó, Bogotá');
  const [deliveryNotes, setDeliveryNotes] = useState('Apto 502, Torre B. Timbrar directo al citófono.');

  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [workers, setWorkers] = useState<Coworker[]>([]);
  const [isServerConnected, setIsServerConnected] = useState(false);

  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const requestLocationPermission = async (): Promise<boolean> => {
    const { granted } = await LocationService.requestLocationPermissions();
    setLocationPermissionGranted(granted);
    if (granted) {
      setShowPermissionModal(false);
      const coords = await LocationService.getCurrentLocation();
      if (coords) {
        // En un dispositivo real, actualizar con la dirección o zona detectada
        setDeliveryAddress(`Ubicación GPS (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`);
      }
    }
    return granted;
  };

  useEffect(() => {
    // Solicitar permiso de ubicación al abrir la app del cliente
    requestLocationPermission().then((granted) => {
      if (!granted) {
        setShowPermissionModal(true);
      }
    });
  }, []);

  // Sync Stores from Server
  const refreshStores = async () => {
    try {
      const serverStores = await FHSApiService.getStores();
      if (serverStores && serverStores.length > 0) {
        setStores(serverStores);
        setIsServerConnected(true);
      } else {
        setIsServerConnected(false);
      }
    } catch {
      setIsServerConnected(false);
    }
  };

  // Sync Orders and Workers
  const refreshOrders = async () => {
    try {
      const serverOrders = await FHSApiService.getOrders();
      if (serverOrders) {
        setOrders(serverOrders);
        setIsServerConnected(true);
      }
      const serverWorkers = await FHSApiService.getWorkers();
      if (serverWorkers) {
        setWorkers(serverWorkers);
      }
    } catch {
      // Keep existing orders in state
    }
  };

  useEffect(() => {
    refreshStores();
    refreshOrders();

    // Poll every 5 seconds for live status updates on orders and stores
    const interval = setInterval(() => {
      refreshOrders();
      refreshStores();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Cart operations
  const addToCart = (product: Product, store: PartnerStore) => {
    if (cartStoreId && cartStoreId !== store.id && cart.length > 0) {
      // If adding from a different store, reset or alert
      // In this version, we switch store automatically with the new item
      setCart([{ product, quantity: 1, storeId: store.id, storeName: store.name }]);
      setCartStoreId(store.id);
      setCartStoreName(store.name);
      return;
    }

    setCartStoreId(store.id);
    setCartStoreName(store.name);

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, storeId: store.id, storeName: store.name }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      if (updated.length === 0) {
        setCartStoreId(null);
        setCartStoreName(null);
      }
      return updated;
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setCartStoreId(null);
    setCartStoreName(null);
  };

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalCartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Active Order tracking helper
  const activeOrder =
    (activeOrderId ? orders.find((o) => o.id === activeOrderId) : null) ||
    orders.find((o) => o.status !== 'entregado') ||
    orders[0] ||
    null;

  const setActiveOrder = (order: DeliveryOrder | null) => {
    setActiveOrderId(order ? order.id : null);
  };

  // Place Order from Store Cart
  const placeStoreOrder = async (
    tip: number,
    paymentMethod: 'Tarjeta (Pagado)' | 'Efectivo contraentrega'
  ): Promise<DeliveryOrder | null> => {
    if (cart.length === 0 || !cartStoreId) return null;

    const currentStore = stores.find((s) => s.id === cartStoreId) || INITIAL_CLIENT_STORES[0];
    const orderItems = cart.map((item) => ({
      id: `item-${item.product.id}`,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      checked: false,
      emoji: item.product.emoji,
    }));

    const deliveryFee = currentStore.category === 'turbo' ? 3500 : 5500;
    const partnerBonus = currentStore.hasBonus ? currentStore.bonusAmount : 0;
    const totalEarnings = deliveryFee + tip + partnerBonus;

    const newOrderPayload: Partial<DeliveryOrder> = {
      store: currentStore,
      customerName: 'Santiago Ramírez (Cliente)',
      customerPhone: '+57 314 982 7710',
      customerAddress: deliveryAddress,
      customerNotes: deliveryNotes,
      customerCoordinates: { latitude: 4.6795, longitude: -74.0558 },
      items: orderItems,
      basePay: deliveryFee,
      customerTip: tip,
      partnerBonus: partnerBonus,
      totalEarnings: totalEarnings,
      distanceToStoreKm: currentStore.distanceKm || 0.6,
      distanceToCustomerKm: 0.8,
      estimatedMinutes: currentStore.averagePrepTimeMin + 10,
      paymentMethod: paymentMethod,
      securityPin: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'ofertado',
    };

    // Try sending to Server
    let created = await FHSApiService.createOrder(newOrderPayload);

    if (!created) {
      // Local fallback
      created = {
        id: `ord-${Date.now().toString().slice(-4)}`,
        orderCode: `#FHS-${Date.now().toString().slice(-4)}`,
        createdAt: 'Justo ahora',
        ...newOrderPayload,
      } as DeliveryOrder;
    }

    setOrders((prev) => [created!, ...prev]);
    setActiveOrderId(created.id);
    clearCart();
    return created;
  };

  // Place Express Courier Delivery ("Pedir Domicilio Express / Mandado")
  const placeExpressDelivery = async (params: PlaceExpressParams): Promise<DeliveryOrder | null> => {
    const expressStore: PartnerStore = {
      id: `exp-${Date.now().toString().slice(-4)}`,
      name: 'FHS Favor Mandado Express 🛵',
      category: 'express',
      partnerTier: 'diamond',
      rating: 5.0,
      reviewCount: 999,
      address: params.pickupAddress,
      coordinates: { latitude: 4.6750, longitude: -74.0520 },
      distanceKm: 0.5,
      averagePrepTimeMin: 3,
      activeOrdersWaiting: 1,
      hasBonus: true,
      bonusAmount: 1500,
      bonusDescription: 'Tarifa Dinámica Express',
      logo: '📦',
      bannerColor: '#FF6F00',
      openingHours: '24 Horas',
      phone: '+57 300 000 0000',
      tags: ['Mandado Directo', 'Courier Express', 'Entrega Rápida'],
    };

    const deliveryFee = 6800;
    const partnerBonus = 1500;
    const totalEarnings = deliveryFee + params.tip + partnerBonus;

    const newOrderPayload: Partial<DeliveryOrder> = {
      store: expressStore,
      customerName: 'Santiago Ramírez (Cliente)',
      customerPhone: '+57 314 982 7710',
      customerAddress: params.deliveryAddress,
      customerNotes: `${params.notes ? params.notes + ' | ' : ''}Mandado: ${params.errandDescription} (Recoger en: ${params.pickupAddress})`,
      customerCoordinates: { latitude: 4.6795, longitude: -74.0558 },
      items: [
        {
          id: 'item-exp-1',
          name: params.errandDescription,
          quantity: 1,
          price: 0,
          notes: `Recogida: ${params.pickupAddress}`,
          emoji: '📦',
        },
      ],
      basePay: deliveryFee,
      customerTip: params.tip,
      partnerBonus: partnerBonus,
      totalEarnings: totalEarnings,
      distanceToStoreKm: 0.5,
      distanceToCustomerKm: 1.2,
      estimatedMinutes: 20,
      paymentMethod: params.paymentMethod,
      securityPin: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'ofertado',
    };

    let created = await FHSApiService.createOrder(newOrderPayload);

    if (!created) {
      created = {
        id: `ord-${Date.now().toString().slice(-4)}`,
        orderCode: `#FHS-${Date.now().toString().slice(-4)}`,
        createdAt: 'Justo ahora',
        ...newOrderPayload,
      } as DeliveryOrder;
    }

    setOrders((prev) => [created!, ...prev]);
    setActiveOrderId(created.id);
    return created;
  };

  return (
    <ClientContext.Provider
      value={{
        stores,
        categories: CATEGORIES_LIST,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        cart,
        cartStoreId,
        cartStoreName,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        totalCartItemCount,
        deliveryAddress,
        setDeliveryAddress,
        deliveryNotes,
        setDeliveryNotes,
        orders,
        activeOrder,
        setActiveOrder,
        placeStoreOrder,
        placeExpressDelivery,
        refreshOrders,
        workers,
        isServerConnected,
        refreshStores,
        locationPermissionGranted,
        showPermissionModal,
        requestLocationPermission,
        dismissPermissionModal: () => setShowPermissionModal(false),
      }}
    >
      {children}
      <LocationPermissionModal
        visible={showPermissionModal}
        onRequestPermission={requestLocationPermission}
        onDismiss={() => setShowPermissionModal(false)}
      />
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};
