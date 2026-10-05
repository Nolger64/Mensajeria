import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DriverProfile } from '../../types';

interface DriverHeaderProps {
  driver: DriverProfile;
  onToggleOnline: (val: boolean) => void;
  onOpenRadio: () => void;
  onSimulateOrder: () => void;
}

export const DriverHeader: React.FC<DriverHeaderProps> = ({
  driver,
  onToggleOnline,
  onOpenRadio,
  onSimulateOrder,
}) => {
  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString('es-CO');
  };

  return (
    <View style={styles.header}>
      {/* Top row: Avatar, Info, Online Switch */}
      <View style={styles.topRow}>
        <View style={styles.driverInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🛵</Text>
            </View>
            <View style={[styles.statusDot, driver.isOnline ? styles.onlineDot : styles.offlineDot]} />
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.driverName}>{driver.alias}</Text>
              <View style={styles.levelBadge}>
                <Ionicons name="sparkles" size={10} color="#FFB300" />
                <Text style={styles.levelText}>Diamante</Text>
              </View>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFB300" />
              <Text style={styles.ratingText}>{driver.rating.toFixed(2)}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.ordersCountText}>{driver.totalOrdersToday} pedidos hoy</Text>
            </View>
          </View>
        </View>

        <View style={styles.onlineToggleContainer}>
          <Text style={[styles.onlineStatusText, driver.isOnline ? styles.textOnline : styles.textOffline]}>
            {driver.isOnline ? 'EN LÍNEA' : 'OFFLINE'}
          </Text>
          <Switch
            value={driver.isOnline}
            onValueChange={onToggleOnline}
            trackColor={{ false: '#757575', true: '#FF8A65' }}
            thumbColor={driver.isOnline ? '#FF441F' : '#F5F5F5'}
          />
        </View>
      </View>

      {/* Bottom row: Daily Earnings & Quick Actions */}
      <View style={styles.bottomRow}>
        <View style={styles.earningsPill}>
          <Text style={styles.earningsLabel}>Ganancias hoy:</Text>
          <Text style={styles.earningsValue}>{formatCurrency(driver.todayEarnings)}</Text>
        </View>

        <View style={styles.actionsGroup}>
          {/* Radio / Intercom between couriers */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onOpenRadio}
            activeOpacity={0.8}
          >
            <Ionicons name="radio" size={16} color="#FF441F" />
            <Text style={styles.actionBtnText}>Radio (4)</Text>
          </TouchableOpacity>

          {/* Simulate New Order trigger */}
          <TouchableOpacity
            style={styles.testOrderBtn}
            onPress={onSimulateOrder}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="bell-ring" size={16} color="#FFFFFF" />
            <Text style={styles.testOrderBtnText}>Simular Pedido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE9E4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FF441F',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineDot: {
    backgroundColor: '#00C853',
  },
  offlineDot: {
    backgroundColor: '#9E9E9E',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D20',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F57F17',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#424242',
  },
  separator: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  ordersCountText: {
    fontSize: 12,
    color: '#616161',
  },
  onlineToggleContainer: {
    alignItems: 'flex-end',
  },
  onlineStatusText: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  textOnline: {
    color: '#00C853',
  },
  textOffline: {
    color: '#9E9E9E',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  earningsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00C853',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF441F',
  },
  testOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF441F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
    shadowColor: '#FF441F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  testOrderBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
