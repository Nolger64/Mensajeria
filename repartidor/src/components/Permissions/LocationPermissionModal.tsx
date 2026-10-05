import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface LocationPermissionModalProps {
  visible: boolean;
  onRequestPermission: () => void;
  onDismiss: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  visible,
  onRequestPermission,
  onDismiss,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="navigate-circle" size={54} color="#FF441F" />
          </View>

          <Text style={styles.title}>Permiso de Ubicación & Navegación</Text>
          <Text style={styles.description}>
            Para activar el radar en tiempo real, mostrar los comercios con convenio cercanos y calcular rutas de entrega precisas, FHS necesita acceso a tu ubicación GPS.
          </Text>

          {/* Feature highlights */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Ionicons name="map-outline" size={20} color="#00E676" style={styles.featureIcon} />
              <Text style={styles.featureText}>Radar y mapa con comercios y bonos activos</Text>
            </View>
            <View style={styles.featureRow}>
              <MaterialCommunityIcons name="motorbike" size={20} color="#FFB300" style={styles.featureIcon} />
              <Text style={styles.featureText}>Ubicación en vivo de tus compañeros de ruta</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="bluetooth-outline" size={20} color="#40C4FF" style={styles.featureIcon} />
              <Text style={styles.featureText}>Conexión con accesorios y datáfonos de cobro</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onRequestPermission}
            activeOpacity={0.85}
          >
            <Ionicons name="location-sharp" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryBtnText}>Activar Ubicación GPS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onDismiss} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>Continuar con Ubicación Demo (Bogotá)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#181C24',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262D3D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 68, 31, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 68, 31, 0.3)',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: '#8C96A5',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  features: {
    width: '100%',
    backgroundColor: '#12151C',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222836',
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
    flex: 1,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#FF441F',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#FF441F',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 8,
  },
  secondaryBtnText: {
    color: '#8C96A5',
    fontSize: 12,
    fontWeight: '600',
  },
});
