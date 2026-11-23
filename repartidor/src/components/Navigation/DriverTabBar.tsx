import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { auraThemes, type AuraTheme } from '../../../../src/theme/auraTheme';
import { useAuraTheme } from '../../../../src/theme/AuraThemeProvider';

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
  const { mode, theme: { colors } } = useAuraTheme();
  const styles = stylesByMode[mode];
  const tabs = [
    {
      key: 'radar' as TabKey,
      label: 'Rutas',
      renderIcon: (active: boolean) => (
        <Ionicons
          name={active ? 'bicycle' : 'bicycle-outline'}
          size={22}
          color={active ? colors.forestDark : colors.textMuted}
        />
      ),
    },
    {
      key: 'pedidos' as TabKey,
      label: 'Navegación',
      renderIcon: (active: boolean) => (
        <Ionicons
          name={active ? 'navigate' : 'navigate-outline'}
          size={22}
          color={active ? colors.forestDark : colors.textMuted}
        />
      ),
    },
    {
      key: 'billetera' as TabKey,
      label: 'Ganancias',
      renderIcon: (active: boolean) => (
        <Ionicons
          name={active ? 'wallet' : 'wallet-outline'}
          size={22}
          color={active ? colors.forestDark : colors.textMuted}
        />
      ),
    },
    {
      key: 'perfil' as TabKey,
      label: 'Perfil',
      renderIcon: (active: boolean) => (
        <Ionicons
          name={active ? 'person' : 'person-outline'}
          size={22}
          color={active ? colors.forestDark : colors.textMuted}
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

function createStyles({ colors, font }: AuraTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      paddingVertical: 8,
      paddingBottom: 14,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapper: {
      position: 'relative',
      height: 26,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -10,
      backgroundColor: colors.terracotta,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 9.5,
      fontWeight: '800',
    },
    label: {
      fontSize: 11,
      fontFamily: font.regular,
      color: colors.textMuted,
      fontWeight: '600',
      marginTop: 2,
    },
    labelActive: {
      fontFamily: font.regular,
      color: colors.forestDark,
      fontWeight: '800',
    },
  });
}

const stylesByMode = {
  light: createStyles(auraThemes.light),
  dark: createStyles(auraThemes.dark),
};
