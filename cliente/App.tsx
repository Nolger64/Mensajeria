import React from 'react';
import { Tabs } from 'expo-router';
import { ClientProvider } from './src/context/ClientContext';
import { tabIcon, useRoleTabOptions } from '../src/components/RoleNavigation';

export default function ClienteLayout() {
  const options = useRoleTabOptions();
  return (
    <ClientProvider>
      <Tabs screenOptions={options} initialRouteName="tienda">
        <Tabs.Screen name="tienda" options={{ title: 'Tienda Aura Spa', tabBarLabel: 'Tienda', tabBarIcon: tabIcon('leaf-outline') }} />
        <Tabs.Screen name="citas" options={{ title: 'Citas', tabBarIcon: tabIcon('calendar-outline') }} />
        <Tabs.Screen name="carrito" options={{ title: 'Carrito', tabBarIcon: tabIcon('bag-outline') }} />
        <Tabs.Screen name="pedidos" options={{ title: 'Mis pedidos', tabBarLabel: 'Pedidos', tabBarIcon: tabIcon('receipt-outline') }} />
      </Tabs>
    </ClientProvider>
  );
}
