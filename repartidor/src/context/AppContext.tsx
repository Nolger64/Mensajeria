import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  DriverProfile,
  PartnerStore,
  Coworker,
  DeliveryOrder,
  CommunityMessage,
  MessageTag,
  RadioRoom,
  RadioParticipant,
  VoiceTransmission,
} from '../types';
import type { AuthUser } from '../../../src/services/authService';
import { FHSApiService } from '../services/api';
import { LocationService, DEFAULT_COORDINATES } from '../services/locationService';
import { LocationPermissionModal } from '../components/Permissions/LocationPermissionModal';
import { radioAudioService } from '../services/radioAudioService';

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
  acceptIncomingOrder: (order: DeliveryOrder) => Promise<boolean>;
  rejectIncomingOrder: () => void;
  advanceActiveOrderStep: () => Promise<boolean>;
  completeActiveOrder: (pin: string) => Promise<boolean>;
  dismissCompletedOrder: () => void;
  assignOrderToCoworker: (orderId: string, coworkerId: string) => void;

  communityMessages: CommunityMessage[];
  sendCommunityMessage: (text: string, tag: MessageTag, customSender?: string) => void;

  // Salas de Radio y Reuniones de Voz en Vivo
  radioRooms: RadioRoom[];
  activeRadioRoomId: string;
  activeRadioRoom: RadioRoom | null;
  isInVoiceMeeting: boolean;
  isMuted: boolean;
  isHandsFreeSpeaker: boolean;
  isTransmittingVoice: boolean;
  speakingParticipantId: string | null;

  joinRadioRoom: (roomId: string) => Promise<void>;
  leaveRadioRoom: () => Promise<void>;
  toggleMute: () => void;
  toggleHandsFreeSpeaker: () => void;
  startTransmitting: () => void;
  stopTransmittingAndSend: (text: string, tag?: MessageTag) => Promise<void>;
  playTransmissionAudio: (tx: VoiceTransmission) => void;

  deliveryStars: import('../types').DeliveryStar[];
  addDeliveryStar: (star: Omit<import('../types').DeliveryStar, 'id' | 'createdAt'>) => Promise<void>;

  // Modo de Despacho (Manual por Admin vs Automático por App)
  dispatchMode: import('../types').DispatchMode;
  serverOnlineNotice: string | null;
  dismissServerOnlineNotice: () => void;

  resetToMockData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode; currentUser?: AuthUser | null }> = ({ children, currentUser }) => {
  const [role, setRole] = useState<UserRole>('repartidor');
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

  // Modo de despacho y aviso de conexión
  const [dispatchMode, setDispatchMode] = useState<import('../types').DispatchMode>('manual');
  const [serverOnlineNotice, setServerOnlineNotice] = useState<string | null>(null);

  // Estados de Salas de Radio y Reunión en Vivo
  const [radioRooms, setRadioRooms] = useState<RadioRoom[]>([]);
  const [activeRadioRoomId, setActiveRadioRoomId] = useState<string>('');
  const [isInVoiceMeeting, setIsInVoiceMeeting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHandsFreeSpeaker, setIsHandsFreeSpeaker] = useState<boolean>(true);
  const [isTransmittingVoice, setIsTransmittingVoice] = useState<boolean>(false);
  const [speakingParticipantId, setSpeakingParticipantId] = useState<string | null>(null);

  const activeRadioRoom = radioRooms.find((r) => r.id === activeRadioRoomId) || radioRooms[0] || null;

  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const requestLocationPermission = async (): Promise<boolean> => {
    const { granted } = await LocationService.requestLocationPermissions();
    setLocationPermissionGranted(granted);
    if (granted) {
      setShowPermissionModal(false);
      const coords = await LocationService.getCurrentLocation();
      if (coords) {
        setDriver((prev) => ({
          ...prev,
          coordinates: coords,
        }));
      }
    }
    return granted;
  };

  // Solicitar permiso de ubicación y activar GPS al iniciar la app
  useEffect(() => {
    requestLocationPermission().then((granted) => {
      if (!granted) {
        setShowPermissionModal(true);
      }
    });

    let subscription: any = null;
    LocationService.watchLocation((coords) => {
      setDriver((prev) => ({
        ...prev,
        coordinates: coords,
      }));
    }).then((sub) => {
      subscription = sub;
    });

    return () => {
      subscription?.remove?.();
    };
  }, []);

  const setServerUrl = (url: string) => {
    FHSApiService.setServerUrl(url);
    setServerUrlState(url);
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
          setDispatchMode(health.dispatchMode as import('../types').DispatchMode);
        }

        const serverStores = await FHSApiService.getStores();
        if (serverStores && isMounted) setStores(serverStores);

        const serverWorkers = await FHSApiService.getWorkers();
        if (serverWorkers && isMounted) {
          setCoworkers(serverWorkers);
          const me = serverWorkers.find((worker) => worker.id === driver.id);
          if (me) setDriver((previous) => ({ ...previous, isOnline: me.status !== 'descanso' }));
        }

        const serverOrders = await FHSApiService.getOrders();
        if (serverOrders && isMounted) {
          setAllOrders(serverOrders);

          const active = serverOrders.find((order) =>
            ['rumbo_tienda', 'en_tienda', 'rumbo_cliente'].includes(order.status)
          ) ?? null;
          setActiveOrder(active);
          setIncomingOrder(active ? null : serverOrders.find((order) => order.status === 'ofertado') ?? null);
        }

        const serverMessages = await FHSApiService.getMessages();
        if (serverMessages && isMounted) setCommunityMessages(serverMessages);

        const serverStars = await FHSApiService.getDeliveryStars();
        if (serverStars && isMounted) setDeliveryStars(serverStars);

        const serverRooms = await FHSApiService.getRadioRooms();
        if (serverRooms && isMounted) setRadioRooms(serverRooms);
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
  }, [serverConnected, driver.id]);

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
    const updated = await FHSApiService.updateOrderStatus(order.id, 'rumbo_tienda');
    if (!updated) return false;
    setIncomingOrder(null);
    setActiveOrder(updated);
    setAllOrders((prev) => prev.map((entry) => entry.id === updated.id ? updated : entry));
    return true;
  };

  const rejectIncomingOrder = () => {
    setIncomingOrder(null);
  };

  const advanceActiveOrderStep = async () => {
    if (!activeOrder) return false;
    const status = activeOrder.status === 'rumbo_tienda' ? 'en_tienda' : 'rumbo_cliente';
    const updated = await FHSApiService.updateOrderStatus(activeOrder.id, status);
    if (!updated) return false;
    setActiveOrder(updated);
    setAllOrders((prev) => prev.map((entry) => entry.id === updated.id ? updated : entry));
    return true;
  };

  const completeActiveOrder = async (pin: string) => {
    if (!activeOrder) return false;
    const finished = await FHSApiService.updateOrderStatus(activeOrder.id, 'entregado', pin);
    if (!finished) return false;
    setCompletedOrder(finished);
    setActiveOrder(null);
    setAllOrders((prev) => prev.map((entry) => entry.id === finished.id ? finished : entry));
    return true;
  };

  const dismissCompletedOrder = () => {
    setCompletedOrder(null);
  };

  const assignOrderToCoworker = async (orderId: string, coworkerId: string) => {
    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'rumbo_tienda' } : o))
    );
    await FHSApiService.assignOrder(orderId, coworkerId);
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

  const joinRadioRoom = async (roomId: string) => {
    setActiveRadioRoomId(roomId);
    setIsInVoiceMeeting(true);
    radioAudioService.playJoinRoomChime();
    await FHSApiService.joinRadioRoom(roomId, {
      id: driver.id,
      name: `${driver.name} (Tú)`,
      role: 'repartidor',
      vehicle: driver.vehicle,
      batteryLevel: 94,
      avatarColor: '#00C853',
    });
  };

  const leaveRadioRoom = async () => {
    setIsInVoiceMeeting(false);
    radioAudioService.playLeaveRoomChime();
    if (activeRadioRoomId) {
      await FHSApiService.leaveRadioRoom(activeRadioRoomId, driver.id);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const toggleHandsFreeSpeaker = () => {
    setIsHandsFreeSpeaker((prev) => {
      const next = !prev;
      radioAudioService.setHandsFreeEnabled(next);
      return next;
    });
  };

  const startTransmitting = () => {
    setIsTransmittingVoice(true);
    radioAudioService.playPttStartBeep();
    if (activeRadioRoomId) {
      FHSApiService.setRadioSpeaking(activeRadioRoomId, driver.id, true);
    }
  };

  const stopTransmittingAndSend = async (text: string, tag: MessageTag = 'general') => {
    setIsTransmittingVoice(false);
    radioAudioService.playPttReleaseSquelch();
    if (activeRadioRoomId) {
      FHSApiService.setRadioSpeaking(activeRadioRoomId, driver.id, false);
    }
    if (text.trim() && activeRadioRoomId) {
      const newTx: VoiceTransmission = {
        id: `tx-${Date.now()}`,
        roomId: activeRadioRoomId,
        senderId: driver.id,
        senderName: `${driver.name} (Tú)`,
        senderVehicle: driver.vehicle,
        audioText: text.trim(),
        tag,
        durationSec: Math.max(2, Math.round(text.trim().split(' ').length * 0.4)),
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
      };
      setRadioRooms((prev) =>
        prev.map((r) =>
          r.id === activeRadioRoomId
            ? { ...r, transmissions: [newTx, ...r.transmissions.slice(0, 49)] }
            : r
        )
      );
      await FHSApiService.broadcastVoiceTransmission(activeRadioRoomId, {
        senderId: driver.id,
        senderName: `${driver.name} (Tú)`,
        senderVehicle: driver.vehicle,
        audioText: text.trim(),
        tag,
        durationSec: newTx.durationSec,
      });
    }
  };

  const playTransmissionAudio = (tx: VoiceTransmission) => {
    setSpeakingParticipantId(tx.senderId);
    radioAudioService.speakTransmission(
      tx.senderName,
      tx.audioText,
      tx.senderVehicle,
      () => setSpeakingParticipantId(tx.senderId),
      () => setSpeakingParticipantId(null)
    );
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
        radioRooms,
        activeRadioRoomId,
        activeRadioRoom,
        isInVoiceMeeting,
        isMuted,
        isHandsFreeSpeaker,
        isTransmittingVoice,
        speakingParticipantId,
        joinRadioRoom,
        leaveRadioRoom,
        toggleMute,
        toggleHandsFreeSpeaker,
        startTransmitting,
        stopTransmittingAndSend,
        playTransmissionAudio,
        deliveryStars,
        addDeliveryStar,
        dispatchMode,
        serverOnlineNotice,
        dismissServerOnlineNotice: () => setServerOnlineNotice(null),
        resetToMockData,
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
