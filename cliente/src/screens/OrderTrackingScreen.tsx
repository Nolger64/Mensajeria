import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useClient } from '../context/ClientContext';
import { formatOrderAmount, ORDER_STATUS_LABELS } from '../../../src/services/orderDisplay';
import { useOperationStyles } from '../../../src/theme/operationStyles';

export function OrderTrackingScreen({ onGoToStores }: { onGoToStores: () => void }) {
  const styles = useOperationStyles();
  const { orders, activeOrder, setActiveOrder, workers } = useClient();
  const worker = workers.find((entry) => entry.id === activeOrder?.assignedWorkerId);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mis pedidos</Text>
      {activeOrder ? (
        <View style={styles.card}>
          <Text style={styles.heading}>{activeOrder.orderCode} · {ORDER_STATUS_LABELS[activeOrder.status]}</Text>
          <Text style={styles.text}>{activeOrder.store.name}</Text>
          <Text style={styles.text}>{activeOrder.customerAddress}</Text>
          {activeOrder.totalToPay !== undefined && <Text style={styles.heading}>Total contraentrega · {formatOrderAmount(activeOrder.totalToPay)}</Text>}
          {worker && activeOrder.status !== 'entregado' && (
            <Text style={styles.text}>Repartidor asignado · {worker.nickname}</Text>
          )}
          {activeOrder.securityPin && activeOrder.status !== 'entregado' && (
            <View style={styles.card}>
              <Text style={styles.heading}>Código de entrega</Text>
              <Text selectable style={styles.title}>{activeOrder.securityPin}</Text>
              <Text style={styles.text}>Compártelo con el repartidor al recibir el pedido.</Text>
            </View>
          )}
          {activeOrder.items.map((item) => (
            <Text key={item.id} style={styles.text}>{item.quantity} × {item.name}</Text>
          ))}
        </View>
      ) : (
        <Text style={styles.text}>Todavía no tienes pedidos.</Text>
      )}
      {orders.filter((order) => order.id !== activeOrder?.id).map((order) => (
        <TouchableOpacity key={order.id} style={styles.card} onPress={() => setActiveOrder(order)}>
          <Text style={styles.heading}>{order.orderCode}</Text>
          <Text style={styles.text}>{ORDER_STATUS_LABELS[order.status]}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.button} onPress={onGoToStores}>
        <Text style={styles.buttonText}>Ver sedes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
