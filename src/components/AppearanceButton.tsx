import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuraTheme } from '../theme/AuraThemeProvider';

export function AppearanceButton({ showLabel = false }: { showLabel?: boolean }) {
  const { mode, theme: { colors, font }, toggleMode } = useAuraTheme();
  const nextMode = mode === 'light' ? 'oscuro' : 'claro';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Activar modo ${nextMode}`}
      onPress={toggleMode}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? colors.accentWash : colors.surfaceSubtle, borderColor: colors.borderLight },
      ]}
    >
      <Ionicons name={mode === 'light' ? 'moon-outline' : 'sunny-outline'} size={18} color={colors.accent} />
      {showLabel && <Text style={{ color: colors.textPrimary, fontFamily: font.medium, fontSize: 13 }}>
        Modo {nextMode}
      </Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    borderWidth: 1,
  },
});
