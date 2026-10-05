import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DeliveryOrder } from '../../types';
import { useApp } from '../../context/AppContext';

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
  const { driver, addDeliveryStar } = useApp();
  const [tipNotes, setTipNotes] = useState('⭐ Don Pedro en recepción recibe. Dejar moto en bahía derecha con candado.');
  const [starSaved, setStarSaved] = useState(false);

  if (!order) return null;

  const formatCurrency = (val: number) => '$' + val.toLocaleString('es-CO');

  const handleSaveStarPin = async () => {
    if (!order) return;
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

          {/* Golden Star for fellow couriers */}
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
                <TextInput
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
                  <Ionicons name="star" size={16} color="#FFFFFF" />
                  <Text style={styles.saveStarBtnText}>Guardar Estrellita en Mapa</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.starSuccessRow}>
                <Ionicons name="checkmark-circle" size={18} color="#00C853" />
                <Text style={styles.starSuccessText}>
                  ¡Estrellita guardada! Tus compañeros verán este punto dorado en su mapa.
                </Text>
              </View>
            )}
          </View>

          {/* Continue button */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => {
              setStarSaved(false);
              onDismiss();
            }}
            activeOpacity={0.85}
          >
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
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#00C853',
  },
  partyEmoji: {
    fontSize: 34,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1D20',
  },
  subtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
    marginBottom: 12,
  },
  earningsBox: {
    width: '100%',
    backgroundColor: '#F1F8E9',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    marginBottom: 12,
  },
  earningsLabel: {
    fontSize: 11,
    color: '#33691E',
    fontWeight: '700',
  },
  earningsValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00C853',
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
  starSection: {
    width: '100%',
    backgroundColor: '#FFFDE7',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFF176',
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
    fontWeight: '800',
    color: '#F57F17',
  },
  starSectionSubtitle: {
    fontSize: 10,
    color: '#757575',
    marginTop: 1,
  },
  starForm: {
    gap: 8,
  },
  starInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FBC02D',
    padding: 8,
    fontSize: 11,
    color: '#333333',
  },
  saveStarBtn: {
    backgroundColor: '#FBC02D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  saveStarBtnText: {
    color: '#1A1D20',
    fontSize: 11,
    fontWeight: '800',
  },
  starSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  starSuccessText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '700',
    flex: 1,
  },
  continueBtn: {
    width: '100%',
    backgroundColor: '#FF441F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
