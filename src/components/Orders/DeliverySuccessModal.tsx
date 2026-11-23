import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DeliveryOrder } from '../../types';

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
  if (!order) return null;

  const formatCurrency = (val: number) => '$' + val.toLocaleString('es-CO');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Confetti icon badge */}
          <View style={styles.iconCircle}>
            <Text style={styles.partyEmoji}>🎉</Text>
          </View>

          <Text style={styles.title}>¡Entrega Exitosa!</Text>
          <Text style={styles.subtitle}>Pedido {order.orderCode} completado a tiempo</Text>

          {/* Earnings box */}
          <View style={styles.earningsBox}>
            <Text style={styles.earningsLabel}>Acreditado a tu billetera FHS:</Text>
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

          {/* Customer Feedback Snippet */}
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons key={s} name="star" size={16} color="#FFB300" />
                ))}
              </View>
              <Text style={styles.customerName}>{order.customerName}</Text>
            </View>
            <Text style={styles.feedbackQuote}>
              &quot;¡Súper rápido y la comida llegó en perfecto estado! Gracias por la entrega.&quot;
            </Text>
          </View>

          {/* Continue button */}
          <TouchableOpacity style={styles.continueBtn} onPress={onDismiss} activeOpacity={0.85}>
            <MaterialCommunityIcons name="radar" size={20} color="#FFFFFF" />
            <Text style={styles.continueBtnText}>Volver al Radar de Pedidos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#00C853',
  },
  partyEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1D20',
  },
  subtitle: {
    fontSize: 13,
    color: '#757575',
    marginTop: 4,
    marginBottom: 16,
  },
  earningsBox: {
    width: '100%',
    backgroundColor: '#F1F8E9',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    marginBottom: 16,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#33691E',
    fontWeight: '700',
  },
  earningsValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#00C853',
    marginVertical: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  detailText: {
    fontSize: 11,
    color: '#558B2F',
    fontWeight: '600',
  },
  tipText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '800',
  },
  bonusText: {
    fontSize: 11,
    color: '#FF441F',
    fontWeight: '800',
  },
  dot: {
    color: '#9CCC65',
  },
  feedbackCard: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  customerName: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '600',
  },
  feedbackQuote: {
    fontSize: 12,
    color: '#424242',
    fontStyle: 'italic',
    lineHeight: 17,
  },
  continueBtn: {
    width: '100%',
    backgroundColor: '#FF441F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#FF441F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
