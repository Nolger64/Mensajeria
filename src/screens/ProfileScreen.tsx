import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DriverProfile } from '../types';

import { useApp } from '../context/AppContext';

interface ProfileScreenProps {
  driver?: DriverProfile;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ driver: propDriver }) => {
  const { driver: contextDriver } = useApp();
  const driver = propDriver || contextDriver;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil de Repartidor</Text>
        <Text style={styles.subtitle}>ID Oficial Soy FHS: #DRV-99824</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBig}>
            <Text style={styles.avatarBigEmoji}>🛵</Text>
          </View>
          <Text style={styles.profileName}>{driver.name}</Text>
          <Text style={styles.profileAlias}>&quot;{driver.alias}&quot;</Text>

          <View style={styles.levelBadge}>
            <Ionicons name="sparkles" size={14} color="#FFB300" />
            <Text style={styles.levelBadgeText}>{driver.level}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.rowCenter}>
                <Ionicons name="star" size={16} color="#FFB300" />
                <Text style={styles.statValue}>{driver.rating}</Text>
              </View>
              <Text style={styles.statLabel}>842 Calificaciones</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{driver.acceptanceRate}%</Text>
              <Text style={styles.statLabel}>Tasa Aceptación</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{driver.onTimeRate}%</Text>
              <Text style={styles.statLabel}>A Tiempo</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehículo Registrado</Text>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIcon}>
              <MaterialCommunityIcons name="motorbike" size={24} color="#FF441F" />
            </View>
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleModel}>{driver.vehicleModel}</Text>
              <Text style={styles.vehiclePlate}>Placa: {driver.plate} • Cilindraje 155cc</Text>
            </View>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>Activo</Text>
            </View>
          </View>
        </View>

        {/* Verifications & Compliance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verificaciones y Seguridad</Text>

          <View style={styles.checkItem}>
            <Ionicons name="shield-checkmark" size={20} color="#00C853" />
            <View style={styles.checkInfo}>
              <Text style={styles.checkTitle}>Mochila Térmica Oficial</Text>
              <Text style={styles.checkSubtitle}>Inspeccionada y validada por FHS Hub</Text>
            </View>
            <Text style={styles.approvedText}>APROBADA</Text>
          </View>

          <View style={styles.checkItem}>
            <Ionicons name="document-text" size={20} color="#00C853" />
            <View style={styles.checkInfo}>
              <Text style={styles.checkTitle}>SOAT Vigente</Text>
              <Text style={styles.checkSubtitle}>Póliza Seguros del Estado - Vigente</Text>
            </View>
            <Text style={styles.approvedText}>VIGENTE</Text>
          </View>

          <View style={styles.checkItem}>
            <Ionicons name="card" size={20} color="#00C853" />
            <View style={styles.checkInfo}>
              <Text style={styles.checkTitle}>Licencia de Conducción</Text>
              <Text style={styles.checkSubtitle}>Categoría A2 (Motos)</Text>
            </View>
            <Text style={styles.approvedText}>ACTIVA</Text>
          </View>
        </View>

        {/* Support & SOS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Asistencia y Soporte</Text>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Alert.alert('Soporte FHS Repartidores', 'Conectando con un asesor de soporte prioritario 24/7...')}
            activeOpacity={0.8}
          >
            <Ionicons name="headset-outline" size={20} color="#1A1D20" />
            <Text style={styles.supportButtonText}>Chat con Soporte en Vivo 24/7</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => Alert.alert('Línea de Emergencia SOS', '¿Deseas llamar a la central de emergencias viales de FHS?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Llamar SOS', style: 'destructive', onPress: () => {} },
            ])}
            activeOpacity={0.8}
          >
            <Ionicons name="alert-circle" size={20} color="#D32F2F" />
            <Text style={styles.sosButtonText}>Botón de Emergencia / Asistencia Vial</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  avatarBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFE9E4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FF441F',
    marginBottom: 10,
  },
  avatarBigEmoji: {
    fontSize: 34,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1D20',
  },
  profileAlias: {
    fontSize: 13,
    color: '#757575',
    marginTop: 1,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
    marginTop: 8,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F57F17',
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1A1D20',
  },
  statLabel: {
    fontSize: 10,
    color: '#757575',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#424242',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF0ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1D20',
  },
  vehiclePlate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  activePill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D32',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  checkInfo: {
    flex: 1,
  },
  checkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D20',
  },
  checkSubtitle: {
    fontSize: 11,
    color: '#757575',
    marginTop: 1,
  },
  approvedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00C853',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 10,
  },
  supportButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D20',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  sosButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D32F2F',
  },
});
