import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import { DriverRadarScreen } from './src/screens/DriverRadarScreen';
import { OrdersHistoryScreen } from './src/screens/OrdersHistoryScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { DriverTabBar, TabKey } from './src/components/Navigation/DriverTabBar';

function RepartidorMain() {
  const { allOrders, serverConnected, serverOnlineNotice, dismissServerOnlineNotice } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('radar');

  const activeOrdersCount = allOrders.filter(
    (o) => o.status === 'rumbo_tienda' || o.status === 'en_tienda' || o.status === 'rumbo_cliente'
  ).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Top Bar with Fixed Server Status Indicator */}
      <View style={styles.serverBar}>
        <View style={styles.brandRow}>
          <Text style={styles.appTitle}>SOY FHS</Text>
          <View style={styles.repartidorTag}>
            <Text style={styles.repartidorTagText}>REPARTIDOR</Text>
          </View>
        </View>

        {/* Indicador no modificable de estado del servidor */}
        <View style={[styles.connectionPill, serverConnected ? styles.pillOnline : styles.pillOffline]}>
          <View style={[styles.dot, serverConnected ? styles.dotOnline : styles.dotOffline]} />
          <Text style={[styles.connectionText, serverConnected ? styles.textOnline : styles.textOffline]}>
            {serverConnected ? 'Servidor en Línea' : 'Servidor Desconectado'}
          </Text>
        </View>
      </View>

      {/* Aviso de Servidor en Línea */}
      {serverOnlineNotice && (
        <View style={styles.serverNoticeBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.serverNoticeText}>{serverOnlineNotice}</Text>
          <TouchableOpacity onPress={dismissServerOnlineNotice} style={styles.dismissNoticeBtn}>
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Screens */}
      <View style={styles.screenContainer}>
        {activeTab === 'radar' && <DriverRadarScreen />}
        {activeTab === 'pedidos' && <OrdersHistoryScreen />}
        {activeTab === 'billetera' && <WalletScreen />}
        {activeTab === 'perfil' && <ProfileScreen />}
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

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RepartidorMain />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  serverBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FF441F',
    letterSpacing: 0.5,
  },
  repartidorTag: {
    backgroundColor: '#FFF0ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  repartidorTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF441F',
  },
  connectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  pillOnline: {
    backgroundColor: '#E8F5E9',
  },
  pillOffline: {
    backgroundColor: '#FFF8E1',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOnline: {
    backgroundColor: '#00C853',
  },
  dotOffline: {
    backgroundColor: '#FF9100',
  },
  connectionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textOnline: {
    color: '#2E7D32',
  },
  textOffline: {
    color: '#F57F17',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  configCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 420,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D20',
  },
  configSubtitle: {
    fontSize: 12,
    color: '#757575',
    marginVertical: 8,
    lineHeight: 17,
  },
  serverNoticeBanner: {
    backgroundColor: '#00C853',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  serverNoticeText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  dismissNoticeBtn: {
    padding: 4,
  },
});
