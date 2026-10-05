import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ClientProvider, useClient } from './src/context/ClientContext';
import { StoreCatalogScreen } from './src/screens/StoreCatalogScreen';
import { StoreDetailScreen } from './src/screens/StoreDetailScreen';
import { ExpressDeliveryScreen } from './src/screens/ExpressDeliveryScreen';
import { CartScreen } from './src/screens/CartScreen';
import { OrderTrackingScreen } from './src/screens/OrderTrackingScreen';
import { PartnerStore } from './src/types';

type ClientTab = 'tiendas' | 'express' | 'carrito' | 'pedidos';

const MainClientNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ClientTab>('tiendas');
  const [selectedStore, setSelectedStore] = useState<PartnerStore | null>(null);

  const { totalCartItemCount, orders } = useClient();

  // Active uncompleted orders count
  const pendingOrdersCount = orders.filter((o) => o.status !== 'entregado').length;

  const handleSelectStore = (store: PartnerStore) => {
    setSelectedStore(store);
  };

  const handleBackToStores = () => {
    setSelectedStore(null);
  };

  const handleGoToCart = () => {
    setActiveTab('carrito');
  };

  const handleOrderPlaced = () => {
    setSelectedStore(null);
    setActiveTab('pedidos');
  };

  return (
    <SafeAreaView style={styles.rootContainer} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Screen Views */}
      <View style={styles.screenContainer}>
        {activeTab === 'tiendas' && (
          selectedStore ? (
            <StoreDetailScreen
              store={selectedStore}
              onBack={handleBackToStores}
              onGoToCart={handleGoToCart}
            />
          ) : (
            <StoreCatalogScreen
              onSelectStore={handleSelectStore}
              onGoToExpress={() => setActiveTab('express')}
              onGoToCart={handleGoToCart}
            />
          )
        )}

        {activeTab === 'express' && (
          <ExpressDeliveryScreen onOrderPlaced={handleOrderPlaced} />
        )}

        {activeTab === 'carrito' && (
          <CartScreen
            onOrderSuccess={handleOrderPlaced}
            onExploreMore={() => setActiveTab('tiendas')}
          />
        )}

        {activeTab === 'pedidos' && (
          <OrderTrackingScreen onGoToStores={() => setActiveTab('tiendas')} />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {/* Tab 1: Tiendas */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            setSelectedStore(null);
            setActiveTab('tiendas');
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'tiendas' ? 'storefront' : 'storefront-outline'}
            size={22}
            color={activeTab === 'tiendas' ? '#FF441F' : '#8C96A5'}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'tiendas' && styles.navLabelActive,
            ]}
          >
            Tiendas
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Express / Mandados */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('express')}
          activeOpacity={0.8}
        >
          <View style={styles.expressTabIcon}>
            <Ionicons
              name={activeTab === 'express' ? 'bicycle' : 'bicycle-outline'}
              size={22}
              color={activeTab === 'express' ? '#FF6F00' : '#8C96A5'}
            />
          </View>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'express' && styles.navLabelActiveExpress,
            ]}
          >
            Express
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Carrito */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('carrito')}
          activeOpacity={0.8}
        >
          <View style={styles.iconWithBadge}>
            <Ionicons
              name={activeTab === 'carrito' ? 'cart' : 'cart-outline'}
              size={22}
              color={activeTab === 'carrito' ? '#FF441F' : '#8C96A5'}
            />
            {totalCartItemCount > 0 && (
              <View style={styles.badgeCircle}>
                <Text style={styles.badgeText}>{totalCartItemCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'carrito' && styles.navLabelActive,
            ]}
          >
            Carrito
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Mis Pedidos */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('pedidos')}
          activeOpacity={0.8}
        >
          <View style={styles.iconWithBadge}>
            <Ionicons
              name={activeTab === 'pedidos' ? 'receipt' : 'receipt-outline'}
              size={22}
              color={activeTab === 'pedidos' ? '#FF441F' : '#8C96A5'}
            />
            {pendingOrdersCount > 0 && (
              <View style={[styles.badgeCircle, { backgroundColor: '#00E676' }]}>
                <Text style={[styles.badgeText, { color: '#000' }]}>
                  {pendingOrdersCount}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'pedidos' && styles.navLabelActive,
            ]}
          >
            Rastreo
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ClientProvider>
        <MainClientNavigator />
      </ClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0E1014',
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#12151B',
    borderTopWidth: 1,
    borderTopColor: '#202633',
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8C96A5',
    marginTop: 3,
  },
  navLabelActive: {
    color: '#FF441F',
    fontWeight: '800',
  },
  navLabelActiveExpress: {
    color: '#FF6F00',
    fontWeight: '800',
  },
  expressTabIcon: {
    position: 'relative',
  },
  iconWithBadge: {
    position: 'relative',
  },
  badgeCircle: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#FF441F',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
