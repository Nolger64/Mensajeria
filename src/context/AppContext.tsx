import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  DriverProfile,
  PartnerStore,
  Coworker,
  DeliveryOrder,
  CommunityMessage,
  MessageTag,
} from '../types';
import {
  INITIAL_DRIVER_PROFILE,
  MOCK_PARTNER_STORES,
  MOCK_COWORKERS,
  MOCK_COMMUNITY_MESSAGES,
  SAMPLE_INCOMING_ORDER,
} from '../data/mockData';

export type UserRole = 'repartidor' | 'admin' | 'test_lab';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;

  // Driver state
  driver: DriverProfile;
  updateDriver: (updated: Partial<DriverProfile>) => void;

  // Partner stores
  stores: PartnerStore[];
  addStore: (newStore: PartnerStore) => void;
  removeStore: (id: string) => void;

  // Coworkers
  coworkers: Coworker[];
  addCoworker: (newCoworker: Coworker) => void;
  removeCoworker: (id: string) => void;
  updateCoworkerStatus: (id: string, status: Coworker['status']) => void;
  simulateCoworkersMovement: () => void;

  // Orders
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
  assignOrderToCoworker: (orderId: string, coworkerId: string) => void;

  // Community Messages
  communityMessages: CommunityMessage[];
  sendCommunityMessage: (text: string, tag: MessageTag, customSender?: string) => void;

  // Reset
  resetToMockData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('repartidor');
  const [driver, setDriver] = useState<DriverProfile>(INITIAL_DRIVER_PROFILE);
  const [stores, setStores] = useState<PartnerStore[]>(MOCK_PARTNER_STORES);
  const [coworkers, setCoworkers] = useState<Coworker[]>(MOCK_COWORKERS);

  // Initial orders list
  const [allOrders, setAllOrders] = useState<DeliveryOrder[]>([
    {
      ...SAMPLE_INCOMING_ORDER,
      id: 'ord-8491',
      orderCode: '#FHS-8491',
      status: 'entregado',
    },
    {
      ...SAMPLE_INCOMING_ORDER,
      id: 'ord-8472',
      orderCode: '#FHS-8472',
      store: MOCK_PARTNER_STORES[0],
      customerName: 'Andrés Felipe Castro',
      customerAddress: 'Cl. 87 #11-20, Apto 301',
      status: 'entregado',
      totalEarnings: 18400,
    },
    {
      ...SAMPLE_INCOMING_ORDER,
      id: 'ord-8500',
      orderCode: '#FHS-8500',
      store: MOCK_PARTNER_STORES[4], // Turbo Dark store
      customerName: 'Laura Jimeno',
      customerAddress: 'Cra. 13 #93-40, Of 402',
      status: 'rumbo_cliente',
      totalEarnings: 14000,
    },
  ]);

  const [incomingOrder, setIncomingOrder] = useState<DeliveryOrder | null>(null);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [completedOrder, setCompletedOrder] = useState<DeliveryOrder | null>(null);

  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>(MOCK_COMMUNITY_MESSAGES);

  const updateDriver = (updated: Partial<DriverProfile>) => {
    setDriver((prev) => ({ ...prev, ...updated }));
  };

  const addStore = (newStore: PartnerStore) => {
    setStores((prev) => [newStore, ...prev]);
  };

  const removeStore = (id: string) => {
    setStores((prev) => prev.filter((s) => s.id !== id));
  };

  const addCoworker = (newCoworker: Coworker) => {
    setCoworkers((prev) => [newCoworker, ...prev]);
  };

  const removeCoworker = (id: string) => {
    setCoworkers((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCoworkerStatus = (id: string, status: Coworker['status']) => {
    setCoworkers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, lastUpdate: 'Modificado por Admin' } : c))
    );
  };

  // Simulate movement of coworkers
  const simulateCoworkersMovement = () => {
    setCoworkers((prev) =>
      prev.map((c) => {
        // slight jitter to lat/lng +/- 0.0008
        const deltaLat = (Math.random() - 0.5) * 0.0016;
        const deltaLng = (Math.random() - 0.5) * 0.0016;
        const newBattery = Math.max(10, c.batteryLevel - Math.floor(Math.random() * 2));
        return {
          ...c,
          coordinates: {
            latitude: Number((c.coordinates.latitude + deltaLat).toFixed(5)),
            longitude: Number((c.coordinates.longitude + deltaLng).toFixed(5)),
          },
          batteryLevel: newBattery,
          lastUpdate: 'En vivo (movimiento detectado)',
        };
      })
    );
  };

  // Dispatch an order
  const createAndDispatchOrder = (order: DeliveryOrder, target: 'repartidor' | 'fleet') => {
    setAllOrders((prev) => [order, ...prev]);
    if (target === 'repartidor') {
      setIncomingOrder(order);
    }
  };

  const acceptIncomingOrder = (order: DeliveryOrder) => {
    setIncomingOrder(null);
    const active = { ...order, status: 'rumbo_tienda' as const };
    setActiveOrder(active);
    setAllOrders((prev) => prev.map((o) => (o.id === order.id ? active : o)));
  };

  const rejectIncomingOrder = () => {
    setIncomingOrder(null);
  };

  const advanceActiveOrderStep = () => {
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
  };

  const completeActiveOrder = () => {
    if (!activeOrder) return;
    const finished: DeliveryOrder = { ...activeOrder, status: 'entregado' };
    setCompletedOrder(finished);
    setActiveOrder(null);

    setAllOrders((prev) => prev.map((o) => (o.id === activeOrder.id ? finished : o)));

    // update driver stats
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

  const assignOrderToCoworker = (orderId: string, coworkerId: string) => {
    const cw = coworkers.find((c) => c.id === coworkerId);
    if (!cw) return;

    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'rumbo_tienda' } : o))
    );
    updateCoworkerStatus(coworkerId, 'en_ruta');
  };

  const sendCommunityMessage = (text: string, tag: MessageTag, customSender?: string) => {
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
  };

  const resetToMockData = () => {
    setDriver(INITIAL_DRIVER_PROFILE);
    setStores(MOCK_PARTNER_STORES);
    setCoworkers(MOCK_COWORKERS);
    setCommunityMessages(MOCK_COMMUNITY_MESSAGES);
    setIncomingOrder(null);
    setActiveOrder(null);
    setCompletedOrder(null);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
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
        resetToMockData,
      }}
    >
      {children}
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
