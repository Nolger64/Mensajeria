import React from 'react';
import { Stack } from 'expo-router';
import { useAuraTheme } from '../../../theme/AuraThemeProvider';

export default function Layout() {
  const { reduceMotion, theme: { colors } } = useAuraTheme();
  return <Stack screenOptions={{
    headerShown: false,
    animation: reduceMotion ? 'none' : 'fade',
    contentStyle: { backgroundColor: colors.bgPrimary },
  }} />;
}
