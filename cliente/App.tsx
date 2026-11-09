import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ClientProvider, useClient } from './src/context/ClientContext';
import { StoreCatalogScreen } from './src/screens/StoreCatalogScreen';
import { StoreDetailScreen } from './src/screens/StoreDetailScreen';
import { CartScreen } from './src/screens/CartScreen';
import { OrderTrackingScreen } from './src/screens/OrderTrackingScreen';
import { PartnerStore } from './src/types';
import { AURA_THEME } from '../src/theme/auraTheme';

type ClientTab = 'inicio' | 'sedes' | 'carrito' | 'pedidos';

export interface ClienteAppProps {
  onLogout?: () => void;
  currentUser?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  [key: string]: any;
}

const MainClientNavigator: React.FC<ClienteAppProps> = ({ onLogout, currentUser }) => {
  const [activeTab, setActiveTab] = useState<ClientTab>('inicio');
  const [selectedStore, setSelectedStore] = useState<PartnerStore | null>(null);

  const { totalCartItemCount, orders, stores } = useClient();

  const handleSelectStore = (store: PartnerStore) => {
    setSelectedStore(store);
    setActiveTab('sedes');
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
      <StatusBar style="dark" />

      {/* Top Bar matching estilo.pdf */}
      <View style={styles.clientTopBar}>
        <View style={styles.topBarContent}>
          <View style={styles.brandRow}>
            <View style={styles.brandIconBox}>
              <MaterialCommunityIcons name="flower-tulip-outline" size={18} color={AURA_THEME.colors.forestDark} />
            </View>
            <View>
              <Text style={styles.appTitle}>AURA BOTANICALS</Text>
              <Text style={styles.locationSubtitle}>
                Sede Jardines del Valle • 1.8 km · Llegada ~18:42
              </Text>
            </View>
          </View>

          <View style={styles.rightActionsRow}>
            {currentUser && (
              <View style={styles.userInfoPill}>
                <Ionicons name="person-circle-outline" size={14} color={AURA_THEME.colors.forestDark} />
                <Text style={styles.userNameText} numberOfLines={1}>
                  {currentUser.name}
                </Text>
              </View>
            )}

            {onLogout && (
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={onLogout}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={14} color={AURA_THEME.colors.terracotta} />
                <Text style={styles.logoutBtnText}>Salir</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Subheader info chip */}
        <View style={styles.ecoNoticeBar}>
          <Ionicons name="shield-checkmark" size={12} color={AURA_THEME.colors.forestDark} />
          <Text style={styles.ecoNoticeText}>
            Entrega estimada ~25-35 min • 0% Huella de Carbono • Empaque térmico de lino
          </Text>
        </View>
      </View>

      {/* Screen Views */}
      <View style={styles.screenContainer}>
        {activeTab === 'inicio' && (
          <StoreCatalogScreen
            onSelectStore={handleSelectStore}
            onGoToExpress={() => setActiveTab('carrito')}
            onGoToCart={handleGoToCart}
          />
        )}

        {activeTab === 'sedes' && (
          <StoreDetailScreen
            store={selectedStore || stores[0]}
            onBack={handleBackToStores}
            onGoToCart={handleGoToCart}
          />
        )}

        {activeTab === 'carrito' && (
          <CartScreen
            onOrderSuccess={handleOrderPlaced}
            onExploreMore={() => setActiveTab('inicio')}
          />
        )}

        {activeTab === 'pedidos' && (
          <OrderTrackingScreen onGoToStores={() => setActiveTab('inicio')} />
        )}
      </View>

      {/* Bottom Navigation Bar matching estilo.pdf */}
      <View style={styles.bottomNav}>
        {/* Tab 1: Inicio */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('inicio')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'inicio' ? 'leaf' : 'leaf-outline'}
            size={22}
            color={activeTab === 'inicio' ? AURA_THEME.colors.forestDark : AURA_THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'inicio' && styles.navLabelActive,
            ]}
          >
            Inicio
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Sedes */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('sedes')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'sedes' ? 'business' : 'business-outline'}
            size={22}
            color={activeTab === 'sedes' ? AURA_THEME.colors.forestDark : AURA_THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'sedes' && styles.navLabelActive,
            ]}
          >
            Sedes
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
              name={activeTab === 'carrito' ? 'bag' : 'bag-outline'}
              size={22}
              color={activeTab === 'carrito' ? AURA_THEME.colors.forestDark : AURA_THEME.colors.textMuted}
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
          <Ionicons
            name={activeTab === 'pedidos' ? 'receipt' : 'receipt-outline'}
            size={22}
            color={activeTab === 'pedidos' ? AURA_THEME.colors.forestDark : AURA_THEME.colors.textMuted}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'pedidos' && styles.navLabelActive,
            ]}
          >
            Mis Pedidos
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function App({ onLogout, currentUser }: ClienteAppProps = {}) {
  return (
    <SafeAreaProvider>
      <ClientProvider>
        <MainClientNavigator onLogout={onLogout} currentUser={currentUser} />
      </ClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.bgPrimary,
  },
  clientTopBar: {
    backgroundColor: AURA_THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AURA_THEME.colors.borderLight,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 16,
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AURA_THEME.colors.sageBadge,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 1.2,
  },
  locationSubtitle: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
    marginTop: 1,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.bgSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AURA_THEME.borderRadius.full,
    gap: 4,
  },
  userNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: AURA_THEME.colors.forestDark,
    maxWidth: 90,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.terracottaSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: AURA_THEME.borderRadius.full,
    gap: 4,
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
  ecoNoticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.sageBadge,
    borderRadius: AURA_THEME.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  ecoNoticeText: {
    fontSize: 10,
    fontWeight: '600',
    color: AURA_THEME.colors.forestDark,
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: AURA_THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: AURA_THEME.colors.borderLight,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AURA_THEME.colors.textMuted,
    marginTop: 3,
  },
  navLabelActive: {
    color: AURA_THEME.colors.forestDark,
    fontWeight: '800',
  },
  iconWithBadge: {
    position: 'relative',
  },
  badgeCircle: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: AURA_THEME.colors.terracotta,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
});
