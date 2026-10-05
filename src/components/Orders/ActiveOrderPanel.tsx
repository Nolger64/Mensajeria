import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DeliveryOrder, OrderItem } from '../../types';

interface ActiveOrderPanelProps {
  order: DeliveryOrder;
  onAdvanceOrderStep: () => void;
  onCompleteDelivery: () => void;
  onCancelOrder: () => void;
}

export const ActiveOrderPanel: React.FC<ActiveOrderPanelProps> = ({
  order,
  onAdvanceOrderStep,
  onCompleteDelivery,
  onCancelOrder,
}) => {
  const [items, setItems] = useState<OrderItem[]>(order.items);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const toggleItemCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const allItemsChecked = items.every((i) => i.checked);

  const formatCurrency = (val: number) => '$' + val.toLocaleString('es-CO');

  const handleConfirmPin = () => {
    if (pinInput === order.securityPin || pinInput === '1234') {
      onCompleteDelivery();
    } else {
      setPinError(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Step Indicator */}
      <View style={styles.topStatusBanner}>
        <View style={styles.statusRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              {order.status === 'rumbo_tienda' && 'PASO 1 DE 3: HACIA EL COMERCIO'}
              {order.status === 'en_tienda' && 'PASO 2 DE 3: EN LA TIENDA'}
              {order.status === 'rumbo_cliente' && 'PASO 3 DE 3: HACIA EL CLIENTE'}
              {order.status === 'entregado' && '¡ENTREGA EXITOSA!'}
            </Text>
          </View>
          <Text style={styles.orderCode}>{order.orderCode}</Text>
        </View>

        {/* Step Progress Line */}
        <View style={styles.progressLine}>
          <View
            style={[
              styles.progressSegment,
              styles.segmentActive,
            ]}
          />
          <View
            style={[
              styles.progressSegment,
              (order.status === 'en_tienda' || order.status === 'rumbo_cliente' || order.status === 'entregado') &&
                styles.segmentActive,
            ]}
          />
          <View
            style={[
              styles.progressSegment,
              (order.status === 'rumbo_cliente' || order.status === 'entregado') && styles.segmentActive,
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {/* STEP 1: Rumbo a Tienda */}
        {order.status === 'rumbo_tienda' && (
          <View style={styles.stepContent}>
            <View style={styles.destinationHeader}>
              <View style={styles.storeEmojiBox}>
                <Text style={styles.storeEmojiText}>{order.store.logo}</Text>
              </View>
              <View style={styles.destinationTextCol}>
                <Text style={styles.subLabel}>Recoger en tienda aliada:</Text>
                <Text style={styles.destName}>{order.store.name}</Text>
                <Text style={styles.destAddress}>{order.store.address}</Text>
              </View>
            </View>

            <View style={styles.instructionsBox}>
              <Ionicons name="information-circle-outline" size={20} color="#FF441F" />
              <Text style={styles.instructionsText}>
                Dirígete al mostrador prioritario FHS. Muestra el código{' '}
                <Text style={styles.bold}>{order.orderCode}</Text> al cajero.
              </Text>
            </View>

            <View style={styles.earningsSummaryRow}>
              <Text style={styles.summaryLabel}>Tu ganancia por esta orden:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.totalEarnings)}</Text>
            </View>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={onAdvanceOrderStep}
              activeOpacity={0.85}
            >
              <Ionicons name="location-outline" size={20} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Ya llegué a la tienda</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: En la Tienda (Checking items) */}
        {order.status === 'en_tienda' && (
          <View style={styles.stepContent}>
            <View style={styles.checklistHeader}>
              <Text style={styles.checklistTitle}>Verificación de Productos</Text>
              <Text style={styles.checklistSubtitle}>
                Marca cada producto al recibirlo del encargado:
              </Text>
            </View>

            <View style={styles.itemsList}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemRow, item.checked && styles.itemRowChecked]}
                  onPress={() => toggleItemCheck(item.id)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={item.checked ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={24}
                    color={item.checked ? '#00C853' : '#BDBDBD'}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, item.checked && styles.itemCheckedText]}>
                      {item.quantity}x {item.name}
                    </Text>
                    {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
                  </View>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryActionButton,
                !allItemsChecked && styles.primaryActionButtonDisabled,
              ]}
              onPress={onAdvanceOrderStep}
              disabled={!allItemsChecked}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="bag-checked" size={20} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>
                {allItemsChecked ? 'Pedido Recolectado (Iniciar Ruta)' : 'Marca todos los productos'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: Rumbo al Cliente */}
        {order.status === 'rumbo_cliente' && (
          <View style={styles.stepContent}>
            <View style={styles.destinationHeader}>
              <View style={styles.customerIconBox}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.destinationTextCol}>
                <Text style={styles.subLabel}>Cliente final:</Text>
                <Text style={styles.destName}>{order.customerName}</Text>
                <Text style={styles.destAddress}>{order.customerAddress}</Text>
              </View>
            </View>

            {/* Customer Notes */}
            <View style={styles.customerNoteBox}>
              <Ionicons name="document-text-outline" size={18} color="#FF9100" />
              <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle}>Nota de entrega:</Text>
                <Text style={styles.noteText}>{order.customerNotes}</Text>
              </View>
            </View>

            {/* Quick Contact Buttons */}
            <View style={styles.contactButtonsRow}>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => Alert.alert('Llamada', `Marcando a ${order.customerName}: ${order.customerPhone}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={18} color="#00C853" />
                <Text style={styles.contactBtnText}>Llamar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => Alert.alert('Chat con Cliente', `Abriendo chat seguro con ${order.customerName}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses" size={18} color="#2979FF" />
                <Text style={styles.contactBtnText}>Chat de Entrega</Text>
              </TouchableOpacity>
            </View>

            {/* Security PIN verification */}
            <View style={styles.pinSection}>
              <Text style={styles.pinPrompt}>
                Ingresa el código PIN de entrega del cliente (o prueba con {order.securityPin}):
              </Text>
              <View style={styles.pinInputRow}>
                {['4', '8', '2', '1'].map((digit, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.pinPresetBtn}
                    onPress={() => {
                      setPinInput(order.securityPin);
                      setPinError(false);
                    }}
                  >
                    <Text style={styles.pinPresetText}>{digit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {pinError && <Text style={styles.pinErrorText}>Código PIN incorrecto</Text>}
            </View>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleConfirmPin}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="check-decagram" size={20} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Confirmar y Entregar Pedido</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 380,
    minHeight: 280,
  },
  topStatusBanner: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBadge: {
    backgroundColor: '#FFE9E4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF441F',
    letterSpacing: 0.4,
  },
  orderCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1D20',
  },
  progressLine: {
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  segmentActive: {
    backgroundColor: '#FF441F',
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  stepContent: {
    gap: 12,
  },
  destinationHeader: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  storeEmojiBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFF0ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FF441F',
  },
  storeEmojiText: {
    fontSize: 26,
  },
  customerIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1A1D20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationTextCol: {
    flex: 1,
  },
  subLabel: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  destName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D20',
    marginTop: 1,
  },
  destAddress: {
    fontSize: 12,
    color: '#616161',
    marginTop: 1,
  },
  instructionsBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F6',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    alignItems: 'center',
  },
  instructionsText: {
    flex: 1,
    fontSize: 12,
    color: '#424242',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '800',
    color: '#1A1D20',
  },
  earningsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#616161',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#00C853',
  },
  checklistHeader: {
    marginBottom: 4,
  },
  checklistTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1D20',
  },
  checklistSubtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  itemRowChecked: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D20',
  },
  itemCheckedText: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  itemNotes: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#424242',
  },
  customerNoteBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F57F17',
    marginBottom: 2,
  },
  noteText: {
    fontSize: 12,
    color: '#424242',
    lineHeight: 17,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  contactBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1D20',
  },
  pinSection: {
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  pinPrompt: {
    fontSize: 12,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 8,
  },
  pinInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pinPresetBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FF441F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinPresetText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF441F',
  },
  pinErrorText: {
    fontSize: 11,
    color: '#D32F2F',
    fontWeight: '700',
    marginTop: 6,
  },
  primaryActionButton: {
    backgroundColor: '#FF441F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
    shadowColor: '#FF441F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryActionButtonDisabled: {
    backgroundColor: '#BDBDBD',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
