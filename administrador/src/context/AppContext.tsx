import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  DriverProfile,
  PartnerStore,
  Coworker,
  DeliveryOrder,
  CommunityMessage,
  MessageTag,
} from '../types';
import type { AuthUser } from '../../../src/services/authService';
import { FHSApiService } from '../services/api';
import { LocationService, DEFAULT_COORDINATES } from '../services/locationService';
import { LocationPermissionModal } from '../components/Permissions/LocationPermissionModal';

export type UserRole = 'repartidor' | 'admin' | 'test_lab';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  serverConnected: boolean;
  serverUrl: string;
  setServerUrl: (url: string) => void;

  locationPermissionGranted: boolean;
  showPermissionModal: boolean;
  requestLocationPermission: () => Promise<boolean>;
  dismissPermissionModal: () => void;

  driver: DriverProfile;
  updateDriver: (updated: Partial<DriverProfile>) => void;

  stores: PartnerStore[];
  addStore: (newStore: PartnerStore) => void;
  removeStore: (id: string) => void;

  coworkers: Coworker[];
  addCoworker: (newCoworker: Coworker) => void;
  removeCoworker: (id: string) => void;
  updateCoworkerStatus: (id: string, status: Coworker['status']) => void;
  simulateCoworkersMovement: () => void;

  allOrders: DeliveryOrder[];
  incomingOrder: DeliveryOrder | null;
  activeOrder: DeliveryOrder | null;
  completedOrder: DeliveryOrder | null;
  createAndDispatchOrder: (order: DeliveryOrder, target: 'repartidor' | 'fleet') => void;
  acceptIncomingOrder: (order: DeliveryOrder) => void;
  rejectIncomingOrder: () => void;
  advanceActiveOrderStep: () => void;
  completeActiveOrder: () => void;
  dismissCompletedOrder: () => void;
  assignOrderToCoworker: (orderId: string, coworkerId: string) => Promise<boolean>;

  communityMessages: CommunityMessage[];
  sendCommunityMessage: (text: string, tag: MessageTag, customSender?: string) => void;

  deliveryStars: import('../types').DeliveryStar[];
  addDeliveryStar: (star: Omit<import('../types').DeliveryStar, 'id' | 'createdAt'>) => Promise<void>;

  // Modo de Despacho del Sistema (Solo Administradores pueden cambiarlo)
  dispatchMode: import('../types').DispatchMode;
  setDispatchMode: (mode: import('../types').DispatchMode) => Promise<void>;
  serverOnlineNotice: string | null;
  dismissServerOnlineNotice: () => void;

  resetToMockData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode; currentUser?: AuthUser | null }> = ({ children, currentUser }) => {
  const [role, setRole] = useState<UserRole>('admin');
  const [serverConnected, setServerConnected] = useState(false);
  const [serverUrl, setServerUrlState] = useState(FHSApiService.getServerUrl());

  const [driver, setDriver] = useState<DriverProfile>(() => ({
    id: currentUser?.id ?? '',
    name: currentUser?.name ?? '',
    alias: currentUser?.name ?? '',
    rating: 0,
    level: '',
    vehicle: currentUser?.vehicle ?? 'moto',
    vehicleModel: '',
    plate: currentUser?.plate ?? '',
    isOnline: false,
    coordinates: DEFAULT_COORDINATES,
    todayEarnings: 0,
    totalOrdersToday: 0,
    acceptanceRate: 0,
    onTimeRate: 0,
    tipsToday: 0,
    balanceAvailable: 0,
    thermalBagVerified: false,
    soatActive: false,
  }));
  const [stores, setStores] = useState<PartnerStore[]>([]);
  const [coworkers, setCoworkers] = useState<Coworker[]>([]);
  const [allOrders, setAllOrders] = useState<DeliveryOrder[]>([]);
  const [incomingOrder, setIncomingOrder] = useState<DeliveryOrder | null>(null);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [completedOrder, setCompletedOrder] = useState<DeliveryOrder | null>(null);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [deliveryStars, setDeliveryStars] = useState<import('../types').DeliveryStar[]>([]);

  // Modo de Despacho y Aviso de Conexión
  const [dispatchMode, setDispatchModeState] = useState<import('../types').DispatchMode>('manual');
  const [serverOnlineNotice, setServerOnlineNotice] = useState<string | null>(null);

  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const requestLocationPermission = async (): Promise<boolean> => {
    const { granted } = await LocationService.requestLocationPermissions();
    setLocationPermissionGranted(granted);
    setShowPermissionModal(!granted);
    return granted;
  };

  const setServerUrl = (url: string) => {
    FHSApiService.setServerUrl(url);
    setServerUrlState(url);
  };

  const setDispatchMode = async (mode: import('../types').DispatchMode) => {
    setDispatchModeState(mode);
    await FHSApiService.updateDispatchMode(mode);
  };

  // Auto-cerrar aviso de servidor en línea tras 5 segundos
  useEffect(() => {
    if (serverOnlineNotice) {
      const timer = setTimeout(() => {
        setServerOnlineNotice(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [serverOnlineNotice]);

  // Sync with Server loop
  useEffect(() => {
    let isMounted = true;

    const syncWithBackend = async () => {
      const health = await FHSApiService.checkHealth();
      if (!isMounted) return;

      if (health && health.online) {
        if (!serverConnected) {
          setServerOnlineNotice('Conexión restablecida');
        }
        setServerConnected(true);
        if (health.dispatchMode === 'manual' || health.dispatchMode === 'automatic') {
          setDispatchModeState(health.dispatchMode as import('../types').DispatchMode);
        }

        const serverStores = await FHSApiService.getStores();
        if (serverStores && isMounted) setStores(serverStores);

        const serverWorkers = await FHSApiService.getWorkers();
        if (serverWorkers && isMounted) setCoworkers(serverWorkers);

        const serverOrders = await FHSApiService.getOrders();
        if (serverOrders && isMounted) {
          setAllOrders(serverOrders);
        }

        const serverMessages = await FHSApiService.getMessages();
        if (serverMessages && isMounted) setCommunityMessages(serverMessages);

        const serverStars = await FHSApiService.getDeliveryStars();
        if (serverStars && isMounted) setDeliveryStars(serverStars);
      } else {
        setServerConnected(false);
      }
    };

    syncWithBackend();
    const interval = setInterval(syncWithBackend, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [serverConnected, dispatchMode]);

  const updateDriver = (updated: Partial<DriverProfile>) => {
    setDriver((prev) => ({ ...prev, ...updated }));
  };

  const addStore = async (newStore: PartnerStore) => {
    setStores((prev) => [newStore, ...prev]);
    await FHSApiService.createStore(newStore);
  };

  const removeStore = (id: string) => {
    setStores((prev) => prev.filter((s) => s.id !== id));
  };

  const addCoworker = async (newCoworker: Coworker) => {
    setCoworkers((prev) => [newCoworker, ...prev]);
    await FHSApiService.createWorker(newCoworker);
  };

  const removeCoworker = (id: string) => {
    setCoworkers((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCoworkerStatus = async (id: string, status: Coworker['status']) => {
    setCoworkers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, lastUpdate: 'Modificado' } : c))
    );
    await FHSApiService.updateWorker(id, { status });
  };

  const simulateCoworkersMovement = async () => {
    const updated = await FHSApiService.simulateMovement();
    if (updated) {
      setCoworkers(updated);
    } else {
      setCoworkers((prev) =>
        prev.map((c) => {
          const deltaLat = (Math.random() - 0.5) * 0.0016;
          const deltaLng = (Math.random() - 0.5) * 0.0016;
          return {
            ...c,
            coordinates: {
              latitude: Number((c.coordinates.latitude + deltaLat).toFixed(5)),
              longitude: Number((c.coordinates.longitude + deltaLng).toFixed(5)),
            },
            batteryLevel: Math.max(10, c.batteryLevel - 1),
          };
        })
      );
    }
  };

  const createAndDispatchOrder = async (order: DeliveryOrder, target: 'repartidor' | 'fleet') => {
    setAllOrders((prev) => [order, ...prev]);
    if (target === 'repartidor') {
      setIncomingOrder(order);
    }
    await FHSApiService.createOrder(order);
  };

  const acceptIncomingOrder = async (order: DeliveryOrder) => {
    setIncomingOrder(null);
    const active = { ...order, status: 'rumbo_tienda' as const };
    setActiveOrder(active);
    setAllOrders((prev) => prev.map((o) => (o.id === order.id ? active : o)));
    await FHSApiService.updateOrderStatus(order.id, 'rumbo_tienda');
  };

  const rejectIncomingOrder = () => {
    setIncomingOrder(null);
  };

  const advanceActiveOrderStep = async () => {
    if (!activeOrder) return;
    let nextStatus: DeliveryOrder['status'] = activeOrder.status;

    if (activeOrder.status === 'rumbo_tienda') {
      nextStatus = 'en_tienda';
    } else if (activeOrder.status === 'en_tienda') {
      nextStatus = 'rumbo_cliente';
    }

    const updated = { ...activeOrder, status: nextStatus };
    setActiveOrder(updated);
    setAllOrders((prev) => prev.map((o) => (o.id === activeOrder.id ? updated : o)));
    await FHSApiService.updateOrderStatus(activeOrder.id, nextStatus);
  };

  const completeActiveOrder = async () => {
    if (!activeOrder) return;
    const finished: DeliveryOrder = { ...activeOrder, status: 'entregado' };
    setCompletedOrder(finished);
    setActiveOrder(null);

    setAllOrders((prev) => prev.map((o) => (o.id === activeOrder.id ? finished : o)));
    await FHSApiService.updateOrderStatus(activeOrder.id, 'entregado');

    updateDriver({
      todayEarnings: driver.todayEarnings + finished.totalEarnings,
      totalOrdersToday: driver.totalOrdersToday + 1,
      tipsToday: driver.tipsToday + finished.customerTip,
      balanceAvailable: driver.balanceAvailable + finished.totalEarnings,
    });
  };

  const dismissCompletedOrder = () => {
    setCompletedOrder(null);
  };

  const assignOrderToCoworker = async (orderId: string, coworkerId: string) => {
    const updated = await FHSApiService.assignOrder(orderId, coworkerId);
    if (!updated) return false;
    setAllOrders((prev) => prev.map((order) => order.id === orderId ? updated : order));
    setCoworkers((prev) => prev.map((worker) =>
      worker.id === coworkerId ? { ...worker, status: 'en_ruta' } : worker
    ));
    return true;
  };

  const sendCommunityMessage = async (text: string, tag: MessageTag, customSender?: string) => {
    const newMsg: CommunityMessage = {
      id: `msg-${Date.now()}`,
      senderId: customSender ? 'admin' : driver.id,
      senderName: customSender || `${driver.name} (Tú)`,
      senderVehicle: customSender ? 'auto' : driver.vehicle,
      text,
      timeAgo: 'Justo ahora',
      tag,
      likes: 1,
    };
    setCommunityMessages((prev) => [newMsg, ...prev]);
    await FHSApiService.sendMessage(newMsg);
  };

  const addDeliveryStar = async (starData: Omit<import('../types').DeliveryStar, 'id' | 'createdAt'>) => {
    const newStar: import('../types').DeliveryStar = {
      id: `star-${Date.now().toString().slice(-4)}`,
      createdAt: 'Justo ahora',
      ...starData,
    };
    setDeliveryStars((prev) => [newStar, ...prev]);
    await FHSApiService.createDeliveryStar(newStar);
  };

  const resetToMockData = () => FHSApiService.resetData();

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        serverConnected,
        serverUrl,
        setServerUrl,
        driver,
        updateDriver,
        stores,
        addStore,
        removeStore,
        coworkers,
        addCoworker,
        removeCoworker,
        updateCoworkerStatus,
        simulateCoworkersMovement,
        allOrders,
        incomingOrder,
        activeOrder,
        completedOrder,
        createAndDispatchOrder,
        acceptIncomingOrder,
        rejectIncomingOrder,
        advanceActiveOrderStep,
        completeActiveOrder,
        dismissCompletedOrder,
        assignOrderToCoworker,
        communityMessages,
        sendCommunityMessage,
        deliveryStars,
        addDeliveryStar,
        resetToMockData,
        locationPermissionGranted,
        showPermissionModal,
        requestLocationPermission,
        dismissPermissionModal: () => setShowPermissionModal(false),
        dispatchMode,
        setDispatchMode,
        serverOnlineNotice,
        dismissServerOnlineNotice: () => setServerOnlineNotice(null),
      }}
    >
      {children}
      <LocationPermissionModal
        visible={showPermissionModal}
        onRequestPermission={requestLocationPermission}
        onDismiss={() => setShowPermissionModal(false)}
      />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
