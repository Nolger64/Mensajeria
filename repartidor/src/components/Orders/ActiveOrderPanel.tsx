import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DeliveryOrder, OrderItem } from '../../types';
import { auraThemes, type AuraTheme } from '../../../../src/theme/auraTheme';
import { useAuraTheme } from '../../../../src/theme/AuraThemeProvider';
import { AuraInput } from '../../../../src/components/AuraInput';

interface ActiveOrderPanelProps {
  order: DeliveryOrder;
  onAdvanceOrderStep: () => Promise<boolean>;
  onCompleteDelivery: (pin: string) => Promise<boolean>;
}

export const ActiveOrderPanel: React.FC<ActiveOrderPanelProps> = ({
  order,
  onAdvanceOrderStep,
  onCompleteDelivery,
}) => {
  const { mode, theme: { colors } } = useAuraTheme();
  const styles = stylesByMode[mode];
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

  const [saving, setSaving] = useState(false);

  const handleAdvance = async () => {
    if (saving) return;
    setSaving(true);
    if (!await onAdvanceOrderStep()) {
      Alert.alert('No se pudo actualizar el pedido', 'Inténtalo de nuevo.');
    }
    setSaving(false);
  };

  const handleConfirmPin = async () => {
    if (saving || pinInput.length !== 4) return;
    setSaving(true);
    setPinError(!await onCompleteDelivery(pinInput));
    setSaving(false);
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
              <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
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
              onPress={handleAdvance}
                disabled={saving}
              activeOpacity={0.85}
            >
              <Ionicons name="location-outline" size={20} color={colors.onAccent} />
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
                    color={item.checked ? colors.textPrimary : colors.iconMuted}
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
              onPress={handleAdvance}
              disabled={saving || !allItemsChecked}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="bag-checked" size={20} color={colors.onAccent} />
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
                <Ionicons name="person-outline" size={24} color={colors.textPrimary} />
              </View>
              <View style={styles.destinationTextCol}>
                <Text style={styles.subLabel}>Cliente final:</Text>
                <Text style={styles.destName}>{order.customerName}</Text>
                <Text style={styles.destAddress}>{order.customerAddress}</Text>
              </View>
            </View>

            {/* Customer Notes */}
            <View style={styles.customerNoteBox}>
              <Ionicons name="document-text-outline" size={18} color={colors.alertText} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle}>Nota de entrega:</Text>
                <Text style={styles.noteText}>{order.customerNotes}</Text>
              </View>
            </View>

            {/* Quick Contact Buttons */}
            {!!order.customerPhone && (
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => Linking.openURL(`tel:${order.customerPhone}`).catch(() =>
                  Alert.alert('No se pudo abrir el teléfono', order.customerPhone))}
              >
                <Ionicons name="call" size={18} color={colors.iconMuted} />
                <Text style={styles.contactBtnText}>Llamar al cliente</Text>
              </TouchableOpacity>
            )}

            {order.totalToPay !== undefined && (
              <Text style={styles.pinPrompt}>Cobrar contraentrega: {formatCurrency(order.totalToPay)}</Text>
            )}

            <View style={styles.pinSection}>
              <Text style={styles.pinPrompt}>Ingresa el código que te indique el cliente.</Text>
              <AuraInput
                style={styles.pinInput}
                value={pinInput}
                onChangeText={(value) => {
                  setPinInput(value.replace(/[^0-9]/g, ''));
                  setPinError(false);
                }}
                accessibilityLabel="Código de entrega"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                editable={!saving}
              />
              {pinError && <Text style={styles.pinErrorText}>No se pudo validar el código. Revisa el número e inténtalo de nuevo.</Text>}
            </View>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleConfirmPin}
              disabled={saving || pinInput.length !== 4}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="check-decagram" size={20} color={colors.onAccent} />
              <Text style={styles.primaryActionText}>Confirmar y Entregar Pedido</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

function createStyles({ colors, font, borderRadius }: AuraTheme) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderColor: colors.borderLight,
      width: '100%',
      maxWidth: 780,
      alignSelf: 'center',
      flex: 1,
    },
    topStatusBanner: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    stepBadge: {
      backgroundColor: colors.support,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    stepBadgeText: {
      fontSize: 11,
      fontFamily: font.regular,
      color: colors.accent,
      letterSpacing: 0.4,
    },
    orderCode: {
      fontSize: 13,
      fontFamily: font.regular,
      color: colors.textPrimary,
    },
    progressLine: {
      flexDirection: 'row',
      gap: 6,
    },
    progressSegment: {
      flex: 1,
      height: 3,
      backgroundColor: colors.support,
      borderRadius: 2,
    },
    segmentActive: {
      backgroundColor: colors.accent,
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
      backgroundColor: colors.accentWash,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderMedium,
    },
    storeEmojiText: {
      fontSize: 26,
    },
    customerIconBox: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    destinationTextCol: {
      flex: 1,
    },
    subLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: font.regular,
      textTransform: 'uppercase',
    },
    destName: {
      fontSize: 16,
      fontFamily: font.regular,
      color: colors.textPrimary,
      marginTop: 1,
    },
    destAddress: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 1,
    },
    instructionsBox: {
      flexDirection: 'row',
      backgroundColor: colors.support,
      padding: 12,
      borderRadius: 12,
      gap: 10,
      alignItems: 'center',
    },
    instructionsText: {
      flex: 1,
      fontSize: 12,
      color: colors.textPrimary,
      lineHeight: 18,
    },
    bold: {
      fontFamily: font.regular,
      color: colors.textPrimary,
    },
    earningsSummaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surfaceSubtle,
      padding: 12,
      borderRadius: 12,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: font.regular,
    },
    summaryValue: {
      fontSize: 17,
      fontFamily: font.regular,
      color: colors.accent,
    },
    checklistHeader: {
      marginBottom: 4,
    },
    checklistTitle: {
      fontSize: 15,
      fontFamily: font.regular,
      color: colors.textPrimary,
    },
    checklistSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    itemsList: {
      gap: 8,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSubtle,
      padding: 12,
      borderRadius: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    itemRowChecked: {
      backgroundColor: colors.accentWash,
      borderColor: colors.borderMedium,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 13,
      fontFamily: font.regular,
      color: colors.textPrimary,
    },
    itemCheckedText: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    itemNotes: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    itemPrice: {
      fontSize: 12,
      fontFamily: font.regular,
      color: colors.textPrimary,
    },
    customerNoteBox: {
      borderWidth: 1,
      borderColor: colors.alertBorder,
      flexDirection: 'row',
      backgroundColor: colors.surfaceSubtle,
      padding: 12,
      borderRadius: 12,
      gap: 10,
    },
    noteTitle: {
      fontSize: 11,
      fontFamily: font.regular,
      color: colors.alertText,
      marginBottom: 2,
    },
    noteText: {
      fontSize: 12,
      color: colors.textPrimary,
      lineHeight: 17,
    },
    contactBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.support,
      paddingVertical: 10,
      borderRadius: borderRadius.full,
      gap: 8,
    },
    contactBtnText: {
      fontSize: 12,
      fontFamily: font.regular,
      color: colors.textPrimary,
    },
    pinSection: {
      backgroundColor: colors.surfaceSubtle,
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    pinPrompt: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    pinInput: {
      minWidth: 138,
      textAlign: 'center',
      fontSize: 18,
      letterSpacing: 6,
    },
    pinErrorText: {
      fontSize: 11,
      color: colors.alertText,
      fontFamily: font.regular,
      marginTop: 6,
    },
    primaryActionButton: {
      backgroundColor: colors.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 15,
      borderRadius: borderRadius.full,
      gap: 8,
      marginTop: 4,
      marginBottom: 16,
    },
    primaryActionButtonDisabled: {
      backgroundColor: colors.support,
    },
    primaryActionText: {
      fontSize: 15,
      fontFamily: font.regular,
      color: colors.onAccent,
    },
  });
}

const stylesByMode = {
  light: createStyles(auraThemes.light),
  dark: createStyles(auraThemes.dark),
};
