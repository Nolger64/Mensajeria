import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DeliveryOrder } from '../../types';
import { useApp } from '../../context/AppContext';
import { auraThemes, type AuraTheme } from '../../../../src/theme/auraTheme';
import { useAuraTheme } from '../../../../src/theme/AuraThemeProvider';
import { AuraInput } from '../../../../src/components/AuraInput';

interface DeliverySuccessModalProps {
  order: DeliveryOrder | null;
  visible: boolean;
  onDismiss: () => void;
}

export const DeliverySuccessModal: React.FC<DeliverySuccessModalProps> = ({
  order,
  visible,
  onDismiss,
}) => {
  const { mode, reduceMotion, theme: { colors } } = useAuraTheme();
  const styles = stylesByMode[mode];
  const { driver, addDeliveryStar } = useApp();
  const [tipNotes, setTipNotes] = useState('');
  const [starSaved, setStarSaved] = useState(false);

  if (!order) return null;

  const formatCurrency = (val: number) => '$' + val.toLocaleString('es-CO');

  const handleSaveStarPin = async () => {
    if (!order.customerCoordinates || !tipNotes.trim()) return;
    await addDeliveryStar({
      address: order.customerAddress,
      coordinates: order.customerCoordinates,
      notes: tipNotes.trim() || 'Dirección verificada por repartidor.',
      stars: 5,
      createdBy: `${driver.name} (${driver.vehicle === 'moto' ? 'Moto' : 'Bici'})`,
    });
    setStarSaved(true);
  };

  return (
    <Modal visible={visible} transparent animationType={reduceMotion ? 'none' : 'fade'}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Confetti icon badge */}
          <View style={styles.iconCircle}>
            <Text style={styles.partyEmoji}>🎉</Text>
          </View>

          <Text style={styles.title}>¡Entrega Exitosa!</Text>
          <Text style={styles.subtitle}>Pedido {order.orderCode} entregado</Text>

          {/* Earnings box */}
          <View style={styles.earningsBox}>
            <Text style={styles.earningsLabel}>Ganancia de la entrega</Text>
            <Text style={styles.earningsValue}>+{formatCurrency(order.totalEarnings)}</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>Tarifa: {formatCurrency(order.basePay)}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.tipText}>Propina: {formatCurrency(order.customerTip)}</Text>
              {order.partnerBonus > 0 && (
                <>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.bonusText}>Bono: +{formatCurrency(order.partnerBonus)}</Text>
                </>
              )}
            </View>
          </View>

          {/* Golden Star for fellow couriers */}
          {order.customerCoordinates && (
          <View style={styles.starSection}>
            <View style={styles.starHeader}>
              <Text style={styles.starEmoji}>⭐</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.starSectionTitle}>Marcar Estrellita en el Mapa</Text>
                <Text style={styles.starSectionSubtitle}>
                  Guarda un tip para que otros domiciliarios lleguen más rápido a esta dirección.
                </Text>
              </View>
            </View>

            {!starSaved ? (
              <View style={styles.starForm}>
                <AuraInput
                  style={styles.starInput}
                  value={tipNotes}
                  onChangeText={setTipNotes}
                  placeholder="Consejo de entrega: portero, timbre, parqueadero..."
                  multiline
                  numberOfLines={2}
                />
                <TouchableOpacity
                  style={styles.saveStarBtn}
                  onPress={handleSaveStarPin}
                  activeOpacity={0.85}
                >
                  <Ionicons name="star-outline" size={16} color={colors.textPrimary} />
                  <Text style={styles.saveStarBtnText}>Guardar Estrellita en Mapa</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.starSuccessRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                <Text style={styles.starSuccessText}>
                  ¡Estrellita guardada! Tus compañeros verán este punto dorado en su mapa.
                </Text>
              </View>
            )}
          </View>
          )}

          {/* Continue button */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => {
              setStarSaved(false);
              onDismiss();
            }}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="radar" size={20} color={colors.onAccent} />
            <Text style={styles.continueBtnText}>Volver al Radar de Pedidos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

function createStyles({ colors, font, borderRadius }: AuraTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.backdrop,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderLight,
      width: '100%',
      maxWidth: 440,
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 20,
    },
    iconCircle: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: colors.accentWash,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.borderMedium,
    },
    partyEmoji: {
      fontSize: 34,
    },
    title: {
      fontSize: 20,
      fontFamily: font.regular,
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
      marginBottom: 12,
    },
    earningsBox: {
      width: '100%',
      backgroundColor: colors.surfaceSubtle,
      borderRadius: 16,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderLight,
      marginBottom: 12,
    },
    earningsLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: font.regular,
    },
    earningsValue: {
      fontSize: 28,
      fontFamily: font.regular,
      color: colors.accent,
      marginVertical: 2,
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
    detailText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: font.regular,
    },
    tipText: {
      fontSize: 11,
      color: colors.accent,
      fontFamily: font.regular,
    },
    bonusText: {
      fontSize: 11,
      color: colors.accent,
      fontFamily: font.regular,
    },
    dot: {
      color: colors.textSecondary,
    },
    starSection: {
      width: '100%',
      backgroundColor: colors.surfaceSubtle,
      borderRadius: 14,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.alertBorder,
    },
    starHeader: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      marginBottom: 8,
    },
    starEmoji: {
      fontSize: 22,
    },
    starSectionTitle: {
      fontSize: 12,
      fontFamily: font.regular,
      color: colors.alertText,
    },
    starSectionSubtitle: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 1,
    },
    starForm: {
      gap: 8,
    },
    starInput: {
      fontSize: 13,
      backgroundColor: colors.surface,
    },
    saveStarBtn: {
      backgroundColor: colors.accentMuted,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      paddingVertical: 8,
      borderRadius: borderRadius.full,
      gap: 6,
    },
    saveStarBtnText: {
      color: colors.textPrimary,
      fontSize: 11,
      fontFamily: font.regular,
    },
    starSuccessRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
    },
    starSuccessText: {
      fontSize: 11,
      color: colors.accent,
      fontFamily: font.regular,
      flex: 1,
    },
    continueBtn: {
      width: '100%',
      backgroundColor: colors.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: borderRadius.full,
      gap: 8,
    },
    continueBtnText: {
      color: colors.onAccent,
      fontSize: 14,
      fontFamily: font.regular,
    },
  });
}

const stylesByMode = {
  light: createStyles(auraThemes.light),
  dark: createStyles(auraThemes.dark),
};
