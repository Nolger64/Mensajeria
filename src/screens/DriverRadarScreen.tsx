import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
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

      {/* Category Filter Chips Bar */}
      <View style={styles.categoriesBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Interactive Map Area */}
      <View style={styles.mapWrapper}>
        <DriverMap
          driverLocation={driver.coordinates}
          stores={filteredStores}
          coworkers={coworkers}
          showStores={showStores}
          showCoworkers={showCoworkers}
          showDemandZones={showDemandZones}
          activeOrder={activeOrder}
          onToggleStores={() => setShowStores((prev) => !prev)}
          onToggleCoworkers={() => setShowCoworkers((prev) => !prev)}
          onToggleDemandZones={() => setShowDemandZones((prev) => !prev)}
          onSelectStore={(st) => setSelectedStore(st)}
          onSelectCoworker={(cw) => setSelectedCoworker(cw)}
          onSelectDriver={() => {}}
        />

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
  categoriesBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoriesScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  categoryChipSelected: {
    backgroundColor: '#FF441F',
    borderColor: '#FF441F',
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#616161',
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  activeOrderHUDContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
