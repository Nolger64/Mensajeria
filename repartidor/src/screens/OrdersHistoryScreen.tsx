import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatOrderAmount, ORDER_STATUS_LABELS } from '../../../src/services/orderDisplay';
import { useOperationStyles } from '../../../src/theme/operationStyles';

export function OrdersHistoryScreen({ onGoToRadar }: { onGoToRadar: () => void }) {
  const styles = useOperationStyles();
  const { allOrders } = useApp();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mis pedidos</Text>
      {allOrders.length === 0 && <Text style={styles.text}>Todavía no tienes pedidos.</Text>}
      {allOrders.map((order) => (
        <View key={order.id} style={styles.card}>
          <Text style={styles.heading}>{order.orderCode} · {order.store.name}</Text>
          <Text style={styles.text}>{ORDER_STATUS_LABELS[order.status]}</Text>
          <Text style={styles.text}>{formatOrderAmount(order.totalEarnings)}</Text>
          {order.status !== 'entregado' && (
            <TouchableOpacity style={styles.button} onPress={onGoToRadar}>
              <Text style={styles.buttonText}>Abrir en radar</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
