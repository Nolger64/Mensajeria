import React from 'react';
import { Tabs } from 'expo-router';
import { AppProvider } from './src/context/AppContext';
import { tabIcon, useRoleTabOptions } from '../src/components/RoleNavigation';
import { useSession } from '../src/context/SessionContext';

export type AdminCentralTab = 'operaciones' | 'flota';

export default function AdministracionLayout() {
  const options = useRoleTabOptions();
  const { session } = useSession();
  return (
    <AppProvider currentUser={session?.user}>
      <Tabs screenOptions={options} initialRouteName="index">
        <Tabs.Screen name="index" options={{ title: 'Agenda Aura Spa', tabBarLabel: 'Agenda', tabBarIcon: tabIcon('calendar-outline') }} />
        <Tabs.Screen name="catalogo" options={{ title: 'Sedes y tienda', tabBarLabel: 'Catálogo', tabBarIcon: tabIcon('leaf-outline') }} />
        <Tabs.Screen name="pedidos" options={{ title: 'Pedidos de la tienda', tabBarLabel: 'Pedidos', tabBarIcon: tabIcon('receipt-outline') }} />
        <Tabs.Screen name="flota" options={{ title: 'Equipo de reparto', tabBarLabel: 'Reparto', tabBarIcon: tabIcon('bicycle-outline') }} />
      </Tabs>
    </AppProvider>
  );
}
