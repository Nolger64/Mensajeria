import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DeliveryOrder } from '../../types';

interface IncomingOrderModalProps {
  order: DeliveryOrder | null;
  visible: boolean;
  onAccept: (order: DeliveryOrder) => void;
  onReject: () => void;
}

export const IncomingOrderModal: React.FC<IncomingOrderModalProps> = ({
  order,
  visible,
  onAccept,
  onReject,
}) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!visible || !order) {
      setTimeLeft(30);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, order, onReject]);

  if (!order) return null;

  const formatCurrency = (val: number) => '$' + val.toLocaleString('es-CO');
  const timerPercentage = (timeLeft / 30) * 100;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Progress Timer Bar */}
          <View style={styles.timerTrack}>
            <View style={[styles.timerProgress, { width: `${timerPercentage}%` }]} />
          </View>

          {/* Top Alert Header */}
          <View style={styles.header}>
            <View style={styles.alertTag}>
              <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFFFFF" />
              <Text style={styles.alertTagText}>NUEVO PEDIDO FHS</Text>
            </View>
            <View style={styles.countdownBadge}>
              <Ionicons name="timer-outline" size={14} color="#FF441F" />
              <Text style={styles.countdownText}>{timeLeft}s</Text>
            </View>
          </View>

          {/* Big Earnings Amount */}
          <View style={styles.earningsSection}>
            <Text style={styles.earningsLabel}>Ganancia Estimada</Text>
            <Text style={styles.earningsAmount}>{formatCurrency(order.totalEarnings)}</Text>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownItem}>Base: {formatCurrency(order.basePay)}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.breakdownTip}>Propina: {formatCurrency(order.customerTip)}</Text>
              {order.partnerBonus > 0 && (
                <>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.breakdownBonus}>Bono: +{formatCurrency(order.partnerBonus)}</Text>
                </>
              )}
            </View>
          </View>

          {/* Trip Details: Store -> Customer */}
          <View style={styles.routeCard}>
            {/* Store (Pickup) */}
            <View style={styles.routeStep}>
              <View style={styles.iconCircleStore}>
                <Text style={styles.storeEmoji}>{order.store.logo}</Text>
              </View>
              <View style={styles.routeStepContent}>
                <View style={styles.rowBetween}>
                  <Text style={styles.stepTitle}>Recoger en:</Text>
                  <Text style={styles.distBadge}>A {order.distanceToStoreKm} km</Text>
                </View>
                <Text style={styles.placeName}>{order.store.name}</Text>
                <Text style={styles.placeAddress}>{order.store.address}</Text>
              </View>
            </View>

            {/* Connecting line */}
            <View style={styles.connectingLine} />

            {/* Customer (Delivery) */}
            <View style={styles.routeStep}>
              <View style={styles.iconCircleCustomer}>
                <Ionicons name="location" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.routeStepContent}>
                <View style={styles.rowBetween}>
                  <Text style={styles.stepTitle}>Entregar a:</Text>
                  <Text style={styles.distBadge}>+{order.distanceToCustomerKm} km</Text>
                </View>
                <Text style={styles.placeName}>{order.customerName}</Text>
                <Text style={styles.placeAddress}>{order.customerAddress}</Text>
              </View>
            </View>
          </View>

          {/* Items Summary & Payment Info */}
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <MaterialCommunityIcons name="shopping-outline" size={14} color="#616161" />
              <Text style={styles.metaPillText}>{order.items.length} productos</Text>
            </View>

            <View style={styles.metaPill}>
              <MaterialCommunityIcons name="credit-card-check-outline" size={14} color="#00C853" />
              <Text style={[styles.metaPillText, { color: '#00C853' }]}>{order.paymentMethod}</Text>
            </View>

            <View style={styles.metaPill}>
              <Ionicons name="time-outline" size={14} color="#616161" />
              <Text style={styles.metaPillText}>~{order.estimatedMinutes} min</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={onReject}
              activeOpacity={0.7}
            >
              <Text style={styles.rejectBtnText}>Rechazar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => onAccept(order)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="check-bold" size={20} color="#FFFFFF" />
              <Text style={styles.acceptBtnText}>Aceptar Pedido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 440,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  timerTrack: {
    height: 6,
    backgroundColor: '#F0F0F0',
    width: '100%',
  },
  timerProgress: {
    height: 6,
    backgroundColor: '#FF441F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  alertTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF441F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  alertTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  countdownText: {
    color: '#FF441F',
    fontSize: 12,
    fontWeight: '800',
  },
  earningsSection: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  earningsLabel: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '600',
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1D20',
    marginVertical: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  breakdownItem: {
    fontSize: 11,
    color: '#616161',
    fontWeight: '600',
  },
  breakdownTip: {
    fontSize: 11,
    color: '#00C853',
    fontWeight: '700',
  },
  breakdownBonus: {
    fontSize: 11,
    color: '#FF441F',
    fontWeight: '800',
  },
  dot: {
    color: '#BDBDBD',
  },
  routeCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  routeStep: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircleStore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE8E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeEmoji: {
    fontSize: 18,
  },
  iconCircleCustomer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1D20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectingLine: {
    width: 2,
    height: 18,
    backgroundColor: '#E0E0E0',
    marginLeft: 17,
    marginVertical: 4,
  },
  routeStepContent: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  distBadge: {
    fontSize: 11,
    color: '#FF441F',
    fontWeight: '800',
  },
  placeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1D20',
    marginTop: 2,
  },
  placeAddress: {
    fontSize: 12,
    color: '#616161',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#616161',
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#616161',
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: '#FF441F',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF441F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  acceptBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
