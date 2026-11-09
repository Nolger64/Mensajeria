import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AURA_THEME } from '../../../src/theme/auraTheme';

interface ProfileScreenProps {
  onLogout?: () => void;
  currentUser?: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout, currentUser }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBig}>
            <MaterialCommunityIcons name="spa" size={32} color={AURA_THEME.colors.forestDark} />
          </View>
          <Text style={styles.profileName}>{currentUser?.name || 'Mateo Silva'}</Text>
          <Text style={styles.profileRole}>Embajador Eco-Aura Spa • Eco-Bike #08</Text>

          <View style={styles.levelBadge}>
            <Ionicons name="star" size={13} color="#92400E" />
            <Text style={styles.levelBadgeText}>Nivel Loto Oro · Certificado</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.rowCenter}>
                <Ionicons name="star" size={14} color={AURA_THEME.colors.star} />
                <Text style={styles.statValue}>4.98</Text>
              </View>
              <Text style={styles.statLabel}>142 Rituales</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>99.4%</Text>
              <Text style={styles.statLabel}>Puntualidad</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: AURA_THEME.colors.statusGreen }]}>0g</Text>
              <Text style={styles.statLabel}>CO₂ Emitido</Text>
            </View>
          </View>
        </View>

        {/* Vehicle & Equipment */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Equipamiento Asignado</Text>
          <View style={styles.infoRow}>
            <Ionicons name="bicycle" size={18} color={AURA_THEME.colors.forestDark} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoTitle}>Bicicleta Eléctrica Aura #08</Text>
              <Text style={styles.infoSub}>Batería: 84% de carga · Autonomía 38 km</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="thermometer-outline" size={18} color={AURA_THEME.colors.forestDark} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoTitle}>Cofre Térmico Presurizado</Text>
              <Text style={styles.infoSub}>Temperatura interna estable: 21.2°C (Óptimo)</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="ribbon-outline" size={18} color={AURA_THEME.colors.forestDark} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoTitle}>Acreditación en Aromaterapia</Text>
              <Text style={styles.infoSub}>Manejo de elixires y protocolo de silencio</Text>
            </View>
          </View>
        </View>

        {/* Environmental impact */}
        <View style={styles.ecoCard}>
          <MaterialCommunityIcons name="leaf" size={24} color={AURA_THEME.colors.forestDark} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ecoTitle}>Compromiso Cero Emisiones</Text>
            <Text style={styles.ecoDesc}>
              Has evitado 42.8 kg de CO₂ este mes transportando fórmulas en trayectos sostenibles y recuperando 48 frascos de vidrio para economía circular.
            </Text>
          </View>
        </View>

        {/* Logout action */}
        {onLogout && (
          <TouchableOpacity style={styles.logoutFullBtn} onPress={onLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={AURA_THEME.colors.terracotta} />
            <Text style={styles.logoutFullBtnText}>Cerrar Sesión del Embajador</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.bgPrimary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  avatarBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AURA_THEME.colors.sageBadge,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    color: AURA_THEME.colors.textSecondary,
    marginBottom: 10,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AURA_THEME.borderRadius.full,
    gap: 4,
    marginBottom: 16,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AURA_THEME.colors.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  statLabel: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: AURA_THEME.colors.borderLight,
  },
  sectionCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 13.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AURA_THEME.colors.borderLight,
  },
  infoTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  infoSub: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  ecoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4EC',
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  ecoTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 2,
  },
  ecoDesc: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
    lineHeight: 15,
  },
  logoutFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AURA_THEME.colors.terracottaSoft,
    paddingVertical: 12,
    borderRadius: AURA_THEME.borderRadius.md,
    gap: 8,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.terracottaBadge,
  },
  logoutFullBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
});
