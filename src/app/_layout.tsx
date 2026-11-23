import React, { useEffect, useMemo } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { Roboto_300Light } from '@expo-google-fonts/roboto/300Light';
import { Roboto_400Regular } from '@expo-google-fonts/roboto/400Regular';
import { Roboto_500Medium } from '@expo-google-fonts/roboto/500Medium';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { SessionProvider, useSession } from '../context/SessionContext';
import { AuraThemeProvider, useAuraTheme } from '../theme/AuraThemeProvider';
import { useOperationStyles } from '../theme/operationStyles';

function Routes() {
  const { session } = useSession();
  const { reduceMotion, theme: { colors } } = useAuraTheme();
  const role = session?.user.role;
  return (
    <Stack screenOptions={{
      headerShown: false, animation: reduceMotion ? 'none' : 'fade',
      contentStyle: { backgroundColor: colors.bgPrimary },
    }}>
      <Stack.Protected guard={!role}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'cliente'}>
        <Stack.Screen name="cliente" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'administrador'}>
        <Stack.Screen name="administracion" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'especialista'}>
        <Stack.Screen name="especialista" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'repartidor'}>
        <Stack.Screen name="reparto" />
      </Stack.Protected>
    </Stack>
  );
}

function AppContent() {
  const [fontsLoaded, fontError] = useFonts({ Roboto_300Light, Roboto_400Regular, Roboto_500Medium });
  const { mode, ready, theme: { colors, font } } = useAuraTheme();
  const styles = useOperationStyles();
  const navigationTheme = useMemo<Theme>(() => {
    const base = mode === 'dark' ? DarkTheme : DefaultTheme;
    const medium = { fontFamily: font.medium, fontWeight: 'normal' as const };
    return {
      ...base,
      fonts: {
        regular: { fontFamily: font.regular, fontWeight: 'normal' },
        medium,
        bold: medium,
        heavy: medium,
      },
      colors: {
        ...base.colors,
        background: colors.bgPrimary,
        card: colors.surface,
        text: colors.textPrimary,
        primary: colors.accent,
        border: colors.borderLight,
        notification: colors.alertBorder,
      },
    };
  }, [mode, colors, font]);

  useEffect(() => {
    if (ready) void SystemUI.setBackgroundColorAsync(colors.bgPrimary).catch(() => {});
  }, [ready, colors.bgPrimary]);

  if (!ready || (!fontsLoaded && !fontError)) return <View style={styles.screen} />;

  return (
    <ThemeProvider value={navigationTheme}>
      <SessionProvider>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <Routes />
      </SessionProvider>
    </ThemeProvider>
  );
}

export default function Layout() {
  return <AuraThemeProvider><AppContent /></AuraThemeProvider>;
}
