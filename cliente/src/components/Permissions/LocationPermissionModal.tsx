import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { auraThemes, type AuraTheme } from '../../../../src/theme/auraTheme';
import { useAuraTheme } from '../../../../src/theme/AuraThemeProvider';

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
  const { mode, reduceMotion, theme: { colors } } = useAuraTheme();
  const styles = stylesByMode[mode];
  return (
    <Modal visible={visible} transparent animationType={reduceMotion ? 'none' : 'fade'}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="navigate-outline" size={34} color={colors.textPrimary} />
          </View>

          <Text style={styles.title}>Permiso de Ubicación & Navegación</Text>
          <Text style={styles.description}>
            Para activar el radar en tiempo real, mostrar los comercios con convenio cercanos y calcular rutas de entrega precisas, FHS necesita acceso a tu ubicación GPS.
          </Text>

          {/* Feature highlights */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Ionicons name="map-outline" size={20} color={colors.accent} style={styles.featureIcon} />
              <Text style={styles.featureText}>Radar y mapa con comercios y bonos activos</Text>
            </View>
            <View style={styles.featureRow}>
              <MaterialCommunityIcons name="motorbike" size={20} color={colors.accent} style={styles.featureIcon} />
              <Text style={styles.featureText}>Ubicación en vivo de tus compañeros de ruta</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="bluetooth-outline" size={20} color={colors.accent} style={styles.featureIcon} />
              <Text style={styles.featureText}>Conexión con accesorios y datáfonos de cobro</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onRequestPermission}
            activeOpacity={0.85}
          >
            <Ionicons name="location-sharp" size={18} color={colors.onAccent} style={{ marginRight: 6 }} />
            <Text style={styles.primaryBtnText}>Activar Ubicación GPS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onDismiss} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>Continuar sin compartir ubicación</Text>
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
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderMedium,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.accentMuted,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderMedium,
    },
    title: {
      fontSize: 19,
      fontFamily: font.regular,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 10,
    },
    description: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 18,
    },
    features: {
      width: '100%',
      backgroundColor: colors.surfaceSubtle,
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.borderLight,
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
      color: colors.textSecondary,
      fontFamily: font.regular,
      flex: 1,
    },
    primaryBtn: {
      width: '100%',
      backgroundColor: colors.accent,
      borderRadius: borderRadius.full,
      paddingVertical: 14,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    primaryBtnText: {
      color: colors.onAccent,
      fontSize: 15,
      fontFamily: font.regular,
    },
    secondaryBtn: {
      paddingVertical: 8,
    },
    secondaryBtnText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: font.regular,
    },
  });
}

const stylesByMode = {
  light: createStyles(auraThemes.light),
  dark: createStyles(auraThemes.dark),
};
