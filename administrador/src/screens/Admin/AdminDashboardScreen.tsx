import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import type { AdminCentralTab } from '../../../App';
import { useApp } from '../../context/AppContext';
import { ORDER_STATUS_LABELS } from '../../../../src/services/orderDisplay';
import { useAuraTheme } from '../../../../src/theme/AuraThemeProvider';
import { useOperationStyles } from '../../../../src/theme/operationStyles';

const FLEET_STATUS = {
  disponible: 'Disponible',
  en_ruta: 'En ruta',
  en_tienda: 'En la sede',
  descanso: 'Fuera de servicio',
};

export function AdminDashboardScreen({ activeCentralTab = 'operaciones' }: { activeCentralTab?: AdminCentralTab }) {
  const styles = useOperationStyles();
  const { theme: { colors } } = useAuraTheme();
  const { allOrders, coworkers, serverConnected, dispatchMode, setDispatchMode, assignOrderToCoworker } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const pending = allOrders.filter((order) => order.status !== 'entregado');
  const available = coworkers.filter((worker) => worker.status === 'disponible');

  const assign = async (orderId: string, workerId: string) => {
    if (saving) return;
    setSaving(true);
    if (await assignOrderToCoworker(orderId, workerId)) setSelectedOrder(null);
    else Alert.alert('No se pudo asignar el pedido', 'Revisa que el repartidor siga disponible.');
    setSaving(false);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {!serverConnected && <Text style={styles.text}>Conectando con el servicio…</Text>}
      {activeCentralTab === 'operaciones' && (
        <>
          <Text style={styles.title}>Operaciones</Text>
          <View style={styles.card}>
            <Text style={styles.heading}>Despacho {dispatchMode === 'automatic' ? 'automático' : 'manual'}</Text>
            <Switch
              trackColor={{ false: colors.toggleTrack, true: colors.accent }}
              thumbColor={colors.toggleThumb}
              ios_backgroundColor={colors.toggleTrack}
              accessibilityLabel="Despacho automático"
              value={dispatchMode === 'automatic'}
              disabled={!serverConnected}
              onValueChange={(enabled) => setDispatchMode(enabled ? 'automatic' : 'manual')}
            />
          </View>
          {pending.length === 0 && <Text style={styles.text}>No hay pedidos activos.</Text>}
          {pending.map((order) => (
            <View key={order.id} style={styles.card}>
              <Text style={styles.heading}>{order.orderCode} · {order.store.name}</Text>
              <Text style={styles.text}>{ORDER_STATUS_LABELS[order.status]}</Text>
              <Text style={styles.text}>{order.customerAddress}</Text>
              {['pendiente', 'ofertado'].includes(order.status) && (
                <TouchableOpacity style={styles.button} onPress={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}>
                  <Text style={styles.buttonText}>{order.status === 'ofertado' ? 'Reasignar' : 'Asignar repartidor'}</Text>
                </TouchableOpacity>
              )}
              {selectedOrder === order.id && ['pendiente', 'ofertado'].includes(order.status) && (
                available.length ? available.map((worker) => (
                  <TouchableOpacity key={worker.id} style={styles.card} disabled={saving} onPress={() => assign(order.id, worker.id)}>
                    <Text style={styles.heading}>{worker.name}</Text>
                  </TouchableOpacity>
                )) : <Text style={styles.text}>No hay repartidores disponibles.</Text>
              )}
            </View>
          ))}
        </>
      )}
      {activeCentralTab === 'flota' && (
        <>
          <Text style={styles.title}>Flota</Text>
          <Link href={{ pathname: '/administracion', params: { seccion: 'Equipo' } }} style={styles.heading}>
            Gestionar repartidores
          </Link>
          {coworkers.length === 0 && <Text style={styles.text}>Todavía no hay repartidores registrados.</Text>}
          {coworkers.map((worker) => (
            <View key={worker.id} style={styles.card}>
              <Text style={styles.heading}>{worker.name}</Text>
              <Text style={styles.text}>{FLEET_STATUS[worker.status]} · {worker.vehicle}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
