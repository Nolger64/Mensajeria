import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import { AdminDashboardScreen } from './src/screens/Admin/AdminDashboardScreen';
import { AURA_THEME } from '../src/theme/auraTheme';

export interface AdministradorAppProps {
  onLogout?: () => void;
  currentUser?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  [key: string]: any;
}

export type AdminCentralTab = 'operaciones' | 'sedes_stock' | 'flota' | 'metricas';

function AdministradorMain({ onLogout, currentUser }: AdministradorAppProps) {
  const { serverConnected } = useApp();
  const [activeTab, setActiveTab] = useState<AdminCentralTab>('operaciones');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Top Header matching estilo.pdf */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.adminIconBox}>
            <MaterialCommunityIcons name="shield-crown-outline" size={18} color={AURA_THEME.colors.forestDark} />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.appTitle}>AURA CENTRAL</Text>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>3/3 SEDES 100%</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Red de Boticas Activa · Supervisión Holística</Text>
          </View>
        </View>

        <View style={styles.rightActionsRow}>
          {currentUser && (
            <View style={styles.userInfoPill}>
              <Ionicons name="person-circle-outline" size={13} color={AURA_THEME.colors.forestDark} />
              <Text style={styles.userNameText} numberOfLines={1}>
                {currentUser.name}
              </Text>
            </View>
          )}

          {onLogout && (
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={onLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={14} color={AURA_THEME.colors.terracotta} />
              <Text style={styles.logoutBtnText}>Salir</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Admin Dashboard Screen with Active Tab Prop */}
      <View style={styles.content}>
        <AdminDashboardScreen activeCentralTab={activeTab} onSelectTab={setActiveTab} />
      </View>

      {/* Bottom Tab Bar matching estilo.pdf Pages 1, 4, 9, 12 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('operaciones')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'operaciones' ? 'grid' : 'grid-outline'}
            size={20}
            color={activeTab === 'operaciones' ? AURA_THEME.colors.forestDark : AURA_THEME.colors.textMuted}
          />
          <Text style={[styles.navLabel, activeTab === 'operaciones' && styles.navLabelActive]}>
            Operaciones
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('sedes_stock')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'sedes_stock' ? 'business' : 'business-outline'}
            size={20}
            color={activeTab === 'sedes_stock' ? AURA_THEME.colors.forestDark : AURA_THEME.colors.textMuted}
          />
          <Text style={[styles.navLabel, activeTab === 'sedes_stock' && styles.navLabelActive]}>
            Sedes & Stock
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('flota')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'flota' ? 'bicycle' : 'bicycle-outline'}
            size={20}
            color={activeTab === 'flota' ? AURA_THEME.colors.forestDark : AURA_THEME.colors.textMuted}
          />
          <Text style={[styles.navLabel, activeTab === 'flota' && styles.navLabelActive]}>
            Flota
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('metricas')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'metricas' ? 'bar-chart' : 'bar-chart-outline'}
            size={20}
            color={activeTab === 'metricas' ? AURA_THEME.colors.forestDark : AURA_THEME.colors.textMuted}
          />
          <Text style={[styles.navLabel, activeTab === 'metricas' && styles.navLabelActive]}>
            Métricas
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App({ onLogout, currentUser }: AdministradorAppProps = {}) {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AdministradorMain onLogout={onLogout} currentUser={currentUser} />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.bgPrimary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: AURA_THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AURA_THEME.colors.borderLight,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AURA_THEME.colors.sageBadge,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 1,
  },
  activePill: {
    backgroundColor: AURA_THEME.colors.statusGreenBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: AURA_THEME.colors.statusGreen,
  },
  subtitle: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textSecondary,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AURA_THEME.borderRadius.full,
    gap: 4,
  },
  userNameText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: AURA_THEME.colors.forestDark,
    maxWidth: 80,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.terracottaSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AURA_THEME.borderRadius.full,
    gap: 4,
  },
  logoutBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: AURA_THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: AURA_THEME.colors.borderLight,
    paddingVertical: 8,
    paddingBottom: 14,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: AURA_THEME.colors.textMuted,
    marginTop: 2,
  },
  navLabelActive: {
    color: AURA_THEME.colors.forestDark,
    fontWeight: '800',
  },
});
