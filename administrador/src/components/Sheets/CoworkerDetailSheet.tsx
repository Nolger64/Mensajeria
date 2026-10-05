import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Coworker } from '../../types';

interface CoworkerDetailSheetProps {
  coworker: Coworker | null;
  visible: boolean;
  onClose: () => void;
  onOpenRadioWithCoworker?: (cw: Coworker) => void;
}

export const CoworkerDetailSheet: React.FC<CoworkerDetailSheetProps> = ({
  coworker,
  visible,
  onClose,
  onOpenRadioWithCoworker,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!coworker) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const statusLabel =
    coworker.status === 'disponible'
      ? 'Disponible para pedidos'
      : coworker.status === 'en_ruta'
      ? 'En ruta hacia cliente'
      : 'En tienda esperando pedido';

  const statusColor =
    coworker.status === 'disponible'
      ? '#00C853'
      : coworker.status === 'en_ruta'
      ? '#2979FF'
      : '#FF9100';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.handleBar} />

          {/* Toast feedback */}
          {toastMessage && (
            <View style={styles.toast}>
              <Ionicons name="checkmark-circle" size={16} color="#00C853" />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          )}

          {/* Coworker Header */}
          <View style={styles.header}>
            <View style={[styles.avatarBox, { borderColor: statusColor }]}>
              <Text style={styles.avatarEmoji}>
                {coworker.vehicle === 'moto' ? '🏍️' : coworker.vehicle === 'bici' ? '🚲' : '🚗'}
              </Text>
            </View>

            <View style={styles.headerTextCol}>
              <View style={styles.nameRow}>
                <Text style={styles.coworkerName}>{coworker.name}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color="#757575" />
                </TouchableOpacity>
              </View>
              <Text style={styles.aliasText}>"{coworker.nickname}"</Text>

              <View style={styles.statusPill}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
              </View>
            </View>
          </View>

          {/* Coworker Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{coworker.distanceMeters} m</Text>
              <Text style={styles.statLabel}>Distancia a ti</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.ratingInline}>
                <Ionicons name="star" size={14} color="#FFB300" />
                <Text style={styles.statValue}>{coworker.rating}</Text>
              </View>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{coworker.completedOrdersToday}</Text>
              <Text style={styles.statLabel}>Entregas hoy</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.ratingInline}>
                <Ionicons name="battery-charging" size={14} color="#00C853" />
                <Text style={styles.statValue}>{coworker.batteryLevel}%</Text>
              </View>
              <Text style={styles.statLabel}>Batería</Text>
            </View>
          </View>

          {/* Location & Vehicle Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoLine}>
              <MaterialCommunityIcons name="motorbike" size={18} color="#FF441F" />
              <Text style={styles.infoLineText}>
                Vehículo: <Text style={styles.bold}>{coworker.vehicleModel}</Text>
              </Text>
            </View>
            <View style={styles.infoLine}>
              <Ionicons name="location-sharp" size={18} color="#757575" />
              <Text style={styles.infoLineText}>
                Ubicación: <Text style={styles.bold}>{coworker.currentZone}</Text>
              </Text>
            </View>
            <View style={styles.infoLine}>
              <Ionicons name="time-outline" size={18} color="#757575" />
              <Text style={styles.infoLineText}>Último ping GPS: {coworker.lastUpdate}</Text>
            </View>
          </View>

          {/* Courier Interaction Buttons */}
          <Text style={styles.actionsTitle}>Comunicación Rápida entre Repartidores</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => showToast(`¡Le enviaste un saludo a ${coworker.name}! 👋`)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickActionIcon}>👋</Text>
              <Text style={styles.quickActionLabel}>Saludar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => showToast(`Alerta de tráfico enviada a ${coworker.name} ⚠️`)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickActionIcon}>⚠️</Text>
              <Text style={styles.quickActionLabel}>Alerta Tráfico</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => showToast(`Le compartiste una zona caliente a ${coworker.name} 🔥`)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickActionIcon}>🔥</Text>
              <Text style={styles.quickActionLabel}>Compartir Zona</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionBtn, styles.radioActionBtn]}
              onPress={() => {
                onClose();
                onOpenRadioWithCoworker?.(coworker);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="radio" size={20} color="#FF441F" />
              <Text style={[styles.quickActionLabel, styles.radioActionLabel]}>Canal Radio</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
  },
  toastText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarBox: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  headerTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coworkerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D20',
  },
  closeBtn: {
    padding: 4,
  },
  aliasText: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1D20',
  },
  statLabel: {
    fontSize: 10,
    color: '#757575',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLineText: {
    fontSize: 12,
    color: '#424242',
  },
  bold: {
    fontWeight: '700',
    color: '#1A1D20',
  },
  actionsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#616161',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  radioActionBtn: {
    backgroundColor: '#FFF0ED',
    borderColor: '#FFCCBC',
  },
  quickActionIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#424242',
    textAlign: 'center',
  },
  radioActionLabel: {
    color: '#FF441F',
    marginTop: 2,
  },
});
