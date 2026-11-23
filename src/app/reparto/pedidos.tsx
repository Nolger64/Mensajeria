import React from 'react';
import { router } from 'expo-router';
import { OrdersHistoryScreen } from '../../../repartidor/src/screens/OrdersHistoryScreen';

export default function Screen() {
  return <OrdersHistoryScreen onGoToRadar={() => router.navigate('/reparto')} />;
}
