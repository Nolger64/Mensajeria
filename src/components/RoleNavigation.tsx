import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/SessionContext';
import { auraThemes, type AuraTheme } from '../theme/auraTheme';
import { useAuraTheme } from '../theme/AuraThemeProvider';
import { AppearanceButton } from './AppearanceButton';
import { Appear } from './Appear';

function HeaderActions() {
  const { signOut } = useSession();
  const { mode } = useAuraTheme();
  const styles = stylesByMode[mode];

  return (
    <View style={styles.actions}>
      <AppearanceButton />
      <TouchableOpacity onPress={signOut} accessibilityRole="button" style={styles.exit}>
        <Text style={styles.exitText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}

export function useRoleHeaderOptions() {
  const { theme: { colors, font } } = useAuraTheme();

  return useMemo(() => ({
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: { fontFamily: font.medium, color: colors.textPrimary, fontSize: 19 },
    headerShadowVisible: false,
    headerRight: () => <HeaderActions />,
  }), [colors, font]);
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function tabIcon(name: IconName) {
  const filled = name.replace(/-outline$/, '') as IconName;
  return function RoleTabIcon({ focused, size }: { focused: boolean; color: ColorValue; size: number }) {
    const { mode, theme: { colors } } = useAuraTheme();
    const styles = stylesByMode[mode];
    const icon = <Ionicons name={focused ? filled : name} size={Math.min(size, 21)}
      color={focused ? colors.accent : colors.iconMuted} />;

    return (
      focused
        ? <Appear style={[styles.icon, styles.iconActive]}>{icon}</Appear>
        : <View style={styles.icon}>{icon}</View>
    );
  };
}

function createStyles({ colors, font, borderRadius, surfaceShadow }: AuraTheme) {
  return StyleSheet.create({
    actions: { flexDirection: 'row', alignItems: 'center', gap: 7, marginRight: 12 },
    exit: {
      minHeight: 44,
      paddingHorizontal: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.borderMedium,
      backgroundColor: colors.buttonPrimary,
    },
    exitText: { fontFamily: font.regular, fontSize: 12, color: colors.textPrimary },
    bar: {
      width: '94%',
      maxWidth: 640,
      alignSelf: 'center',
      marginBottom: 10,
      marginTop: 5,
      minHeight: 65,
      paddingTop: 4,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surface,
      boxShadow: surfaceShadow,
      elevation: 0,
    },
    label: { fontFamily: font.regular, fontSize: 11 },
    icon: { width: 37, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.full },
    iconActive: { backgroundColor: colors.accentWash },
  });
}

const stylesByMode = {
  light: createStyles(auraThemes.light),
  dark: createStyles(auraThemes.dark),
};

export function useRoleTabOptions() {
  const headerOptions = useRoleHeaderOptions();
  const { mode, reduceMotion, theme: { colors } } = useAuraTheme();
  const styles = stylesByMode[mode];

  return useMemo(() => ({
    ...headerOptions,
    animation: reduceMotion ? 'none' as const : 'fade' as const,
    tabBarStyle: styles.bar,
    tabBarLabelStyle: styles.label,
    tabBarLabelPosition: 'below-icon' as const,
    tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: colors.textSecondary,
  }), [headerOptions, reduceMotion, styles, colors]);
}
