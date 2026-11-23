import React from 'react';
import { router } from 'expo-router';
import { OrderTrackingScreen } from '../../../cliente/src/screens/OrderTrackingScreen';

export default function Screen() {
  return <OrderTrackingScreen onGoToStores={() => router.navigate('/cliente/tienda')} />;
}
