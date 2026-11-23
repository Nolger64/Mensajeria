import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  PartnerStore,
  Product,
  DeliveryOrder,
  CartItem,
  Coworker,
  Coordinates,
} from '../types';
import { FHSApiService } from '../services/api';
import { LocationService } from '../services/locationService';
import { LocationPermissionModal } from '../components/Permissions/LocationPermissionModal';

interface ClientContextType {
  stores: PartnerStore[];
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
  placeStoreOrder: (tip: number) => Promise<DeliveryOrder | null>;
  refreshOrders: () => Promise<void>;

  // Couriers (for tracking display)
  workers: Coworker[];

  // Server Status
  isServerConnected: boolean;
  refreshStores: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<PartnerStore[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cartItems, setCart] = useState<CartItem[]>([]);
  const cart = useMemo(() => {
    const branch = stores.find((entry) => entry.id === cartItems[0]?.storeId);
    return cartItems.map((item) => ({
      ...item,
      product: branch?.products?.find((product) => product.id === item.product.id) ?? item.product,
    }));
  }, [cartItems, stores]);
  const [cartStoreId, setCartStoreId] = useState<string | null>(null);
  const [cartStoreName, setCartStoreName] = useState<string | null>(null);

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<Coordinates>();
  const [deliveryNotes, setDeliveryNotes] = useState('');

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
        setDeliveryCoordinates(coords);
      }
    }
    return granted;
  };

  // Sync Stores from Server
  const refreshStores = async () => {
    try {
      const serverStores = await FHSApiService.getStores();
      if (serverStores) {
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
    if (cartStoreId && cartStoreId !== store.id && cart.length > 0) return;

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

  const placeStoreOrder = async (tip: number): Promise<DeliveryOrder | null> => {
    if (!cart.length || !cartStoreId || !deliveryAddress.trim()) return null;
    const created = await FHSApiService.createOrder({
      storeId: cartStoreId,
      customerAddress: deliveryAddress.trim(),
      customerNotes: deliveryNotes,
      customerCoordinates: deliveryCoordinates,
      customerTip: tip,
      expectedTotal: cartSubtotal + 5500 + tip,
      items: cart.map(({ product, quantity }) => ({ id: product.id, quantity })),
    });
    if (!created) return null;

    setOrders((prev) => [created, ...prev.filter((order) => order.id !== created.id)]);
    setActiveOrderId(created.id);
    clearCart();
    return created;
  };

  return (
    <ClientContext.Provider
      value={{
        stores,
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
