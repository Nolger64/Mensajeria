import React from 'react';
import { Tabs } from 'expo-router';
import { AppProvider } from './src/context/AppContext';
import { tabIcon, useRoleTabOptions } from '../src/components/RoleNavigation';
import { useSession } from '../src/context/SessionContext';

export default function RepartoLayout() {
  const options = useRoleTabOptions();
  const { session } = useSession();
  return (
    <AppProvider currentUser={session?.user}>
      <Tabs screenOptions={options} initialRouteName="index">
        <Tabs.Screen name="index" options={{ title: 'Entregas Aura Spa', tabBarLabel: 'Entregas', tabBarIcon: tabIcon('bicycle-outline') }} />
        <Tabs.Screen name="pedidos" options={{ title: 'Mis pedidos', tabBarLabel: 'Pedidos', tabBarIcon: tabIcon('receipt-outline') }} />
        <Tabs.Screen name="ganancias" options={{ title: 'Ganancias', tabBarIcon: tabIcon('wallet-outline') }} />
        <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: tabIcon('person-outline') }} />
      </Tabs>
    </AppProvider>
  );
}
