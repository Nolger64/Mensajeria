import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { StoreDetailScreen } from '../../../../cliente/src/screens/StoreDetailScreen';
import { useClient } from '../../../../cliente/src/context/ClientContext';
import { useOperationStyles } from '../../../theme/operationStyles';

export default function Screen() {
  const styles = useOperationStyles();
  const { sede } = useLocalSearchParams<{ sede: string }>();
  const { stores, isServerConnected } = useClient();
  const store = stores.find((entry) => entry.id === sede);
  if (!store) {
    return <View style={[styles.screen, styles.content]}><Text style={styles.text}>
      {isServerConnected ? 'Esta sede ya no está disponible.' : 'Consultando la sede…'}
    </Text></View>;
  }
  return <StoreDetailScreen
    store={store}
    onBack={() => router.replace('/cliente/tienda')}
    onGoToCart={() => router.navigate('/cliente/carrito')}
  />;
}
