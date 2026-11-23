import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { ActiveOrderPanel } from '../components/Orders/ActiveOrderPanel';
import { DeliverySuccessModal } from '../components/Orders/DeliverySuccessModal';
import { useApp } from '../context/AppContext';
import { FHSApiService } from '../services/api';
import { formatOrderAmount } from '../../../src/services/orderDisplay';
import { useAuraTheme } from '../../../src/theme/AuraThemeProvider';
import { useOperationStyles } from '../../../src/theme/operationStyles';

export function DriverRadarScreen() {
  const styles = useOperationStyles();
  const { theme: { colors } } = useAuraTheme();
  const {
    driver, serverConnected, updateDriver, incomingOrder, acceptIncomingOrder,
    activeOrder, advanceActiveOrderStep, completeActiveOrder, completedOrder, dismissCompletedOrder,
  } = useApp();
  const [saving, setSaving] = useState(false);

  const setAvailability = async (online: boolean) => {
    setSaving(true);
    const worker = await FHSApiService.updateWorker(driver.id, {
      status: online ? 'disponible' : 'descanso',
    });
    if (worker) updateDriver({ isOnline: online });
    else Alert.alert('No se pudo cambiar la disponibilidad');
    setSaving(false);
  };

  const acceptOrder = async () => {
    if (!incomingOrder || saving) return;
    setSaving(true);
    if (!await acceptIncomingOrder(incomingOrder)) {
      Alert.alert('No se pudo aceptar el pedido', 'Inténtalo de nuevo.');
    }
    setSaving(false);
  };

  return (
    <View style={styles.screen}>
      {activeOrder ? (
        <ActiveOrderPanel
          key={activeOrder.id}
          order={activeOrder}
          onAdvanceOrderStep={advanceActiveOrderStep}
          onCompleteDelivery={completeActiveOrder}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Radar de pedidos</Text>
          <View style={styles.card}>
            <Text style={styles.heading}>{driver.isOnline ? 'Disponible' : 'Fuera de servicio'}</Text>
            <Switch
              trackColor={{ false: colors.toggleTrack, true: colors.accent }}
              thumbColor={colors.toggleThumb}
              ios_backgroundColor={colors.toggleTrack}
              accessibilityLabel="Disponibilidad para recibir pedidos"
              value={driver.isOnline}
              disabled={saving || !serverConnected || !!incomingOrder}
              onValueChange={setAvailability}
            />
          </View>
          {!serverConnected && <Text style={styles.text}>Sin conexión con el servicio.</Text>}
          <View style={styles.card}>
            {incomingOrder ? (
              <>
                <Text style={styles.heading}>{incomingOrder.orderCode}</Text>
                <Text style={styles.text}>{incomingOrder.store.name} · {incomingOrder.customerAddress}</Text>
                <Text style={styles.text}>{formatOrderAmount(incomingOrder.totalEarnings)}</Text>
                <TouchableOpacity style={styles.button} onPress={acceptOrder} disabled={saving}>
                  <Text style={styles.buttonText}>Aceptar pedido</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.text}>No tienes pedidos asignados.</Text>
            )}
          </View>
        </ScrollView>
      )}
      <DeliverySuccessModal
        key={completedOrder?.id}
        order={completedOrder}
        visible={!!completedOrder}
        onDismiss={dismissCompletedOrder}
      />
    </View>
  );
}
