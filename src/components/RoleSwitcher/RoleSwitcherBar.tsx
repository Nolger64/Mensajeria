import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { UserRole, useApp } from '../../context/AppContext';

export const RoleSwitcherBar: React.FC = () => {
  const { role, setRole, coworkers, stores, allOrders } = useApp();

  const activeOrdersCount = allOrders.filter(
    (o) => o.status === 'rumbo_tienda' || o.status === 'en_tienda' || o.status === 'rumbo_cliente'
  ).length;

  const roles: {
    key: UserRole;
    label: string;
    subLabel: string;
    icon: (active: boolean) => React.ReactNode;
    color: string;
  }[] = [
    {
      key: 'repartidor',
      label: 'Repartidor',
      subLabel: 'Soy FHS',
      color: '#FF441F',
      icon: (active) => (
        <MaterialCommunityIcons
          name="moped"
          size={18}
          color={active ? '#FFFFFF' : '#FF441F'}
        />
      ),
    },
    {
      key: 'admin',
      label: 'Administrador',
      subLabel: `${coworkers.length} en flota`,
      color: '#1A1D20',
      icon: (active) => (
        <MaterialCommunityIcons
          name="shield-account"
          size={18}
          color={active ? '#FFFFFF' : '#1A1D20'}
        />
      ),
    },
    {
      key: 'test_lab',
      label: 'Test Lab',
      subLabel: 'Pruebas & Datos',
      color: '#7B1FA2',
      icon: (active) => (
        <Ionicons
          name="flask"
          size={17}
          color={active ? '#FFFFFF' : '#7B1FA2'}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topInfo}>
        <View style={styles.logoRow}>
          <Text style={styles.brandTitle}>FHS</Text>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>MULTI-APP ECOSYSTEM</Text>
          </View>
        </View>

        <View style={styles.quickMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricDot}>●</Text>
            <Text style={styles.metricText}>{coworkers.length + 1} Couriers</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricDotStore}>●</Text>
            <Text style={styles.metricText}>{stores.length} Tiendas</Text>
          </View>
          {activeOrdersCount > 0 && (
            <View style={styles.activeOrdersBadge}>
              <Text style={styles.activeOrdersBadgeText}>{activeOrdersCount} en curso</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.switcherRow}>
        {roles.map((r) => {
          const isActive = role === r.key;
          return (
            <TouchableOpacity
              key={r.key}
              style={[
                styles.roleBtn,
                isActive && { backgroundColor: r.color, borderColor: r.color },
              ]}
              onPress={() => setRole(r.key)}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                {r.icon(isActive)}
              </View>
              <View style={styles.textCol}>
                <Text style={[styles.roleTitle, isActive && styles.roleTitleActive]}>
                  {r.label}
                </Text>
                <Text style={[styles.roleSub, isActive && styles.roleSubActive]}>
                  {r.subLabel}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F1113',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#24282D',
  },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    color: '#FF441F',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  brandBadge: {
    backgroundColor: '#1E232A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brandBadgeText: {
    color: '#A0AAB5',
    fontSize: 9,
    fontWeight: '800',
  },
  quickMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricDot: {
    fontSize: 8,
    color: '#00C853',
  },
  metricDotStore: {
    fontSize: 8,
    color: '#FF9100',
  },
  metricText: {
    fontSize: 10,
    color: '#D1D7E0',
    fontWeight: '600',
  },
  activeOrdersBadge: {
    backgroundColor: '#FF441F',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  activeOrdersBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  switcherRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181C21',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#292E36',
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F0F2F5',
  },
  roleTitleActive: {
    color: '#FFFFFF',
  },
  roleSub: {
    fontSize: 9,
    color: '#8B949E',
    marginTop: 0.5,
  },
  roleSubActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
