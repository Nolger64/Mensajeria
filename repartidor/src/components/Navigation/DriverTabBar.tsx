import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export type TabKey = 'radar' | 'pedidos' | 'billetera' | 'perfil';

interface DriverTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  activeOrderCount?: number;
}

export const DriverTabBar: React.FC<DriverTabBarProps> = ({
  activeTab,
  onSelectTab,
  activeOrderCount = 0,
}) => {
  const tabs = [
    {
      key: 'radar' as TabKey,
      label: 'Radar & Mapa',
      renderIcon: (active: boolean) => (
        <MaterialCommunityIcons
          name="radar"
          size={24}
          color={active ? '#FF441F' : '#9E9E9E'}
        />
      ),
    },
    {
      key: 'pedidos' as TabKey,
      label: 'Entregas',
      renderIcon: (active: boolean) => (
        <Ionicons
          name={active ? 'receipt' : 'receipt-outline'}
          size={22}
          color={active ? '#FF441F' : '#9E9E9E'}
        />
      ),
    },
    {
      key: 'billetera' as TabKey,
      label: 'Billetera',
      renderIcon: (active: boolean) => (
        <Ionicons
          name={active ? 'wallet' : 'wallet-outline'}
          size={22}
          color={active ? '#FF441F' : '#9E9E9E'}
        />
      ),
    },
    {
      key: 'perfil' as TabKey,
      label: 'Mi Cuenta',
      renderIcon: (active: boolean) => (
        <Ionicons
          name={active ? 'person' : 'person-outline'}
          size={22}
          color={active ? '#FF441F' : '#9E9E9E'}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              {tab.renderIcon(isActive)}
              {tab.key === 'pedidos' && activeOrderCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeOrderCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF441F',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E9E9E',
  },
  labelActive: {
    color: '#FF441F',
    fontWeight: '800',
  },
});
