import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { RoleSwitcherBar } from './src/components/RoleSwitcher/RoleSwitcherBar';
import { DriverRadarScreen } from './src/screens/DriverRadarScreen';
import { OrdersHistoryScreen } from './src/screens/OrdersHistoryScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AdminDashboardScreen } from './src/screens/Admin/AdminDashboardScreen';
import { TestLabScreen } from './src/screens/TestLab/TestLabScreen';
import { DriverTabBar, TabKey } from './src/components/Navigation/DriverTabBar';

function MainAppContent() {
  const { role, allOrders } = useApp();
  const [driverTab, setDriverTab] = useState<TabKey>('radar');

  const activeOrdersCount = allOrders.filter(
    (o) => o.status === 'rumbo_tienda' || o.status === 'en_tienda' || o.status === 'rumbo_cliente'
  ).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Top Universal Ecosystem Switcher */}
      <RoleSwitcherBar />

      {/* Role Screen Views */}
      <View style={styles.screenContainer}>
        {role === 'repartidor' && (
          <View style={styles.roleContainer}>
            <View style={styles.subScreenArea}>
              {driverTab === 'radar' && <DriverRadarScreen />}
              {driverTab === 'pedidos' && <OrdersHistoryScreen />}
              {driverTab === 'billetera' && <WalletScreen />}
              {driverTab === 'perfil' && <ProfileScreen />}
            </View>

            {/* Bottom tab bar for Repartidor */}
            <DriverTabBar
              activeTab={driverTab}
              onSelectTab={setDriverTab}
              activeOrderCount={activeOrdersCount}
            />
          </View>
        )}

        {role === 'admin' && (
          <View style={styles.roleContainer}>
            <AdminDashboardScreen />
          </View>
        )}

        {role === 'test_lab' && (
          <View style={styles.roleContainer}>
            <TestLabScreen />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1113',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  roleContainer: {
    flex: 1,
  },
  subScreenArea: {
    flex: 1,
  },
});
