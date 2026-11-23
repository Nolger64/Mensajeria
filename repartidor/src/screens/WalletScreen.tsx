import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatOrderAmount } from '../../../src/services/orderDisplay';
import { useOperationStyles } from '../../../src/theme/operationStyles';

export function WalletScreen() {
  const styles = useOperationStyles();
  const { allOrders } = useApp();
  const delivered = allOrders.filter((order) => order.status === 'entregado');
  const earnings = delivered.reduce((sum, order) => sum + order.totalEarnings, 0);
  const tips = delivered.reduce((sum, order) => sum + order.customerTip, 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Ganancias</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>Total por entregas</Text>
        <Text style={styles.title}>{formatOrderAmount(earnings)}</Text>
        <Text style={styles.text}>{delivered.length} entregas completadas</Text>
        <Text style={styles.text}>Propinas incluidas · {formatOrderAmount(tips)}</Text>
      </View>
    </ScrollView>
  );
}
