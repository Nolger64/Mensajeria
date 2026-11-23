import React from 'react';
import { router } from 'expo-router';
import { CartScreen } from '../../../cliente/src/screens/CartScreen';

export default function Screen() {
  return <CartScreen
    onOrderSuccess={() => router.replace('/cliente/pedidos')}
    onExploreMore={() => router.navigate('/cliente/tienda')}
  />;
}
