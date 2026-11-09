import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import { DriverRadarScreen } from './src/screens/DriverRadarScreen';
import { OrdersHistoryScreen } from './src/screens/OrdersHistoryScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { DriverTabBar, TabKey } from './src/components/Navigation/DriverTabBar';
import { AURA_THEME } from '../src/theme/auraTheme';

export interface RepartidorAppProps {
  onLogout?: () => void;
  currentUser?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  [key: string]: any;
}

function RepartidorMain({ onLogout, currentUser }: RepartidorAppProps) {
  const { allOrders, serverConnected, serverOnlineNotice, dismissServerOnlineNotice } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('radar');

  const activeOrdersCount = allOrders.filter(
    (o) => o.status === 'rumbo_tienda' || o.status === 'en_tienda' || o.status === 'rumbo_cliente'
  ).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Top Bar matching estilo.pdf Page 11 & 3 */}
      <View style={styles.topBar}>
        <View style={styles.topBarMain}>
          <View style={styles.brandRow}>
            <View style={styles.bikeIconCircle}>
              <Ionicons name="bicycle" size={17} color={AURA_THEME.colors.forestDark} />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.brandTitle}>AURA COURIER PRO</Text>
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineBadgeText}>EN LÍNEA</Text>
                </View>
              </View>
              <Text style={styles.vehicleSub}>
                Eco-Bike #08 Activo · 84% carga botánica
              </Text>
            </View>
          </View>

          <View style={styles.rightActionsRow}>
            {currentUser && (
              <View style={styles.lotoBadge}>
                <Ionicons name="star" size={11} color={AURA_THEME.colors.star} />
                <Text style={styles.lotoBadgeText}>Loto Oro</Text>
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

        {/* Ambient notice */}
        <View style={styles.subNoticeBar}>
          <MaterialCommunityIcons name="leaf" size={12} color={AURA_THEME.colors.forestDark} />
          <Text style={styles.subNoticeText}>
            Rutas Verdes & Tráfico Suave • Baúl térmico a 21.2°C (Óptimo)
          </Text>
        </View>
      </View>

      {/* Notice Banner if server came online */}
      {serverOnlineNotice && (
        <View style={styles.serverNoticeBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
          <Text style={styles.serverNoticeText}>{serverOnlineNotice}</Text>
          <TouchableOpacity onPress={dismissServerOnlineNotice} style={styles.dismissNoticeBtn}>
            <Ionicons name="close" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Screen Views */}
      <View style={styles.screenContainer}>
        {activeTab === 'radar' && <DriverRadarScreen />}
        {activeTab === 'pedidos' && <OrdersHistoryScreen />}
        {activeTab === 'billetera' && <WalletScreen />}
        {activeTab === 'perfil' && <ProfileScreen onLogout={onLogout} currentUser={currentUser} />}
      </View>

      {/* Bottom Tabs */}
      <DriverTabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeOrderCount={activeOrdersCount}
      />
    </SafeAreaView>
  );
}

export default function App({ onLogout, currentUser }: RepartidorAppProps = {}) {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RepartidorMain onLogout={onLogout} currentUser={currentUser} />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.bgPrimary,
  },
  topBar: {
    backgroundColor: AURA_THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AURA_THEME.colors.borderLight,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 16,
  },
  topBarMain: {
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
  bikeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AURA_THEME.colors.sageBadge,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 0.8,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AURA_THEME.colors.statusGreenBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AURA_THEME.colors.statusGreen,
  },
  onlineBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.statusGreen,
  },
  vehicleSub: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textSecondary,
    marginTop: 1,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lotoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AURA_THEME.borderRadius.full,
    gap: 4,
  },
  lotoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.terracottaSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AURA_THEME.borderRadius.full,
    gap: 3,
  },
  logoutBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
  subNoticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.sageBadge,
    borderRadius: AURA_THEME.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  subNoticeText: {
    fontSize: 10,
    fontWeight: '600',
    color: AURA_THEME.colors.forestDark,
  },
  serverNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.statusGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  serverNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dismissNoticeBtn: {
    padding: 4,
  },
  screenContainer: {
    flex: 1,
  },
});
