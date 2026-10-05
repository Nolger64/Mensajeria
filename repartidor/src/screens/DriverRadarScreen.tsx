import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PartnerStore, Coworker, DeliveryOrder, StoreCategory } from '../types';
import { DriverHeader } from '../components/Header/DriverHeader';
import { DriverMap } from '../components/Map/DriverMap';
import { StoreDetailSheet } from '../components/Sheets/StoreDetailSheet';
import { CoworkerDetailSheet } from '../components/Sheets/CoworkerDetailSheet';
import { IncomingOrderModal } from '../components/Orders/IncomingOrderModal';
import { ActiveOrderPanel } from '../components/Orders/ActiveOrderPanel';
import { DeliverySuccessModal } from '../components/Orders/DeliverySuccessModal';
import { CoworkerRadioModal } from '../components/Community/CoworkerRadioModal';
import { SAMPLE_INCOMING_ORDER } from '../data/mockData';
import { useApp } from '../context/AppContext';

export const DriverRadarScreen: React.FC = () => {
  const {
    driver,
    updateDriver,
    stores,
    coworkers,
    incomingOrder,
    activeOrder,
    completedOrder,
    createAndDispatchOrder,
    acceptIncomingOrder,
    rejectIncomingOrder,
    advanceActiveOrderStep,
    completeActiveOrder,
    dismissCompletedOrder,
    communityMessages,
    sendCommunityMessage,
    deliveryStars,
    dispatchMode,
  } = useApp();

  // Layer toggles
  const [showStores, setShowStores] = useState(true);
  const [showCoworkers, setShowCoworkers] = useState(true);
  const [showDemandZones, setShowDemandZones] = useState(true);

  // Selected filters
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory>('todos');

  // Modals & Selection state
  const [selectedStore, setSelectedStore] = useState<PartnerStore | null>(null);
  const [selectedCoworker, setSelectedCoworker] = useState<Coworker | null>(null);
  const [isRadioOpen, setIsRadioOpen] = useState(false);

  // Categories list
  const categories: { key: StoreCategory; label: string; icon: string }[] = [
    { key: 'todos', label: 'Todos', icon: '🌟' },
    { key: 'restaurante', label: 'Restaurantes', icon: '🍔' },
    { key: 'supermercado', label: 'Supermercados', icon: '🛒' },
    { key: 'turbo', label: 'Turbo 10m', icon: '⚡' },
    { key: 'farmacia', label: 'Farmacias', icon: '💊' },
    { key: 'express', label: 'Express 24/7', icon: '🏪' },
  ];

  // Filter stores according to selected category
  const filteredStores = stores.filter((s) => {
    if (selectedCategory === 'todos') return true;
    return s.category === selectedCategory;
  });

  // Handle incoming order simulation
  const handleTriggerSimulatedOrder = () => {
    createAndDispatchOrder(
      {
        ...SAMPLE_INCOMING_ORDER,
        id: `ord-${Date.now().toString().slice(-4)}`,
        orderCode: `#FHS-${Date.now().toString().slice(-4)}`,
        status: 'ofertado',
      },
      'repartidor'
    );
  };

  // Quick order claim from store modal
  const handleRequestOrderFromStore = (store: PartnerStore) => {
    const customOrder: DeliveryOrder = {
      ...SAMPLE_INCOMING_ORDER,
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderCode: `#FHS-${Date.now().toString().slice(-4)}`,
      store: store,
      totalEarnings: 12000 + (store.hasBonus ? store.bonusAmount : 0),
      basePay: 7500,
      partnerBonus: store.bonusAmount,
      customerTip: 4500,
      status: 'ofertado',
    };
    acceptIncomingOrder(customOrder);
  };

  return (
    <View style={styles.container}>
      {/* Top Driver Header */}
      <DriverHeader
        driver={driver}
        onToggleOnline={(online) => updateDriver({ isOnline: online })}
        onOpenRadio={() => setIsRadioOpen(true)}
        onSimulateOrder={handleTriggerSimulatedOrder}
      />

      {/* Dispatch Mode & Status Banner */}
      <View style={styles.dispatchStatusBar}>
        <View style={[styles.dispatchModePill, dispatchMode === 'manual' ? styles.modeManual : styles.modeAuto]}>
          <Ionicons
            name={dispatchMode === 'manual' ? 'clipboard-outline' : 'flash'}
            size={14}
            color={dispatchMode === 'manual' ? '#1565C0' : '#E65100'}
          />
          <Text style={[styles.dispatchModeText, dispatchMode === 'manual' ? styles.textManual : styles.textAuto]}>
            {dispatchMode === 'manual'
              ? 'Modo: Asignación por Torre de Control (Por Defecto)'
              : 'Modo: Asignación Automática por la App'}
          </Text>
        </View>
        <View style={styles.radarStatusPill}>
          <View style={styles.gpsDotLive} />
          <Text style={styles.radarStatusText}>GPS Activo</Text>
        </View>
      </View>

      {/* Interactive Map Area (Limpio: sin marcadores de prueba de tiendas ni domiciliarios) */}
      <View style={styles.mapWrapper}>
        <DriverMap
          driverLocation={driver.coordinates}
          stores={[]} // Sin tiendas de prueba
          coworkers={[]} // Sin domiciliarios de prueba
          deliveryStars={deliveryStars}
          showStores={false}
          showCoworkers={false}
          showDemandZones={false}
          activeOrder={activeOrder}
          onToggleStores={() => {}}
          onToggleCoworkers={() => {}}
          onToggleDemandZones={() => {}}
          onSelectStore={() => {}}
          onSelectCoworker={() => {}}
          onSelectDriver={() => {}}
        />

        {/* Mensaje de espera si está en modo manual y sin pedido activo */}
        {!activeOrder && dispatchMode === 'manual' && (
          <View style={styles.manualWaitOverlay}>
            <Ionicons name="hourglass-outline" size={16} color="#1565C0" />
            <Text style={styles.manualWaitText}>
              Esperando que el administrador asigne un domicilio a tu moto/bici...
            </Text>
          </View>
        )}

        {/* Active Order HUD overlay at bottom of screen if delivery in progress */}
        {activeOrder && (
          <View style={styles.activeOrderHUDContainer}>
            <ActiveOrderPanel
              order={activeOrder}
              onAdvanceOrderStep={advanceActiveOrderStep}
              onCompleteDelivery={completeActiveOrder}
              onCancelOrder={rejectIncomingOrder}
            />
          </View>
        )}
      </View>

      {/* Store Details Sheet */}
      <StoreDetailSheet
        store={selectedStore}
        visible={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        onRequestOrderFromStore={handleRequestOrderFromStore}
      />

      {/* Coworker Details Sheet */}
      <CoworkerDetailSheet
        coworker={selectedCoworker}
        visible={!!selectedCoworker}
        onClose={() => setSelectedCoworker(null)}
        onOpenRadioWithCoworker={() => setIsRadioOpen(true)}
      />

      {/* Incoming Order Alert Modal */}
      <IncomingOrderModal
        order={incomingOrder}
        visible={!!incomingOrder}
        onAccept={acceptIncomingOrder}
        onReject={rejectIncomingOrder}
      />

      {/* Delivery Success Celebration Modal */}
      <DeliverySuccessModal
        order={completedOrder}
        visible={!!completedOrder}
        onDismiss={dismissCompletedOrder}
      />

      {/* Courier Community Radio Modal */}
      <CoworkerRadioModal
        visible={isRadioOpen}
        messages={communityMessages}
        coworkers={coworkers}
        onClose={() => setIsRadioOpen(false)}
        onSendMessage={sendCommunityMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  dispatchStatusBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dispatchModePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  modeManual: {
    backgroundColor: '#E3F2FD',
  },
  modeAuto: {
    backgroundColor: '#FFF3E0',
  },
  dispatchModeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  textManual: {
    color: '#1565C0',
  },
  textAuto: {
    color: '#E65100',
  },
  radarStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  gpsDotLive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C853',
  },
  radarStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#616161',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  manualWaitOverlay: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 900,
  },
  manualWaitText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#1565C0',
    lineHeight: 15,
  },
  activeOrderHUDContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
