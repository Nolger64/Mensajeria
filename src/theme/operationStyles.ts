import { Platform, StyleSheet, type ViewStyle } from 'react-native';
import { auraThemes, type AuraTheme } from './auraTheme';
import { useAuraTheme } from './AuraThemeProvider';

function createStyles({ colors, font, borderRadius, surfaceShadow }: AuraTheme) {
  const webScrollbar = Platform.OS === 'web'
    ? { scrollbarColor: `${colors.borderMedium} ${colors.bgPrimary}`, scrollbarWidth: 'thin' } as ViewStyle
    : undefined;

  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bgPrimary, ...webScrollbar },
    content: { padding: 18, gap: 14, alignSelf: 'center', width: '100%', maxWidth: 780, paddingBottom: 28 },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: borderRadius.xl,
      boxShadow: surfaceShadow,
      padding: 18,
      gap: 10,
    },
    title: {
      fontFamily: font.light,
      fontSize: 24,
      letterSpacing: 1.9,
      textTransform: 'uppercase',
      color: colors.textPrimary,
    },
    heading: { fontFamily: font.regular, fontSize: 16, lineHeight: 22, color: colors.textPrimary },
    text: { fontFamily: font.regular, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
    button: {
      alignSelf: 'flex-start',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 48,
      backgroundColor: colors.accent,
      borderRadius: borderRadius.full,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    buttonText: { fontFamily: font.medium, fontSize: 14, color: colors.onAccent },
    primaryButton: {
      minHeight: 48,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.buttonOutline,
      backgroundColor: colors.buttonPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },
    primaryText: {
      fontFamily: font.regular,
      fontSize: 13,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.textPrimary,
    },
    input: {
      minHeight: 48,
      borderColor: 'transparent',
      borderWidth: 1,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceSubtle,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: colors.textPrimary,
      fontFamily: font.regular,
      fontSize: 14,
    },
    inputFocused: { borderColor: colors.borderMedium },
    inputMultiline: { minHeight: 76, borderRadius: borderRadius.lg, textAlignVertical: 'top' },
    error: {
      alignSelf: 'flex-start',
      fontFamily: font.regular,
      color: colors.alertText,
      backgroundColor: colors.surface,
      borderColor: colors.alertBorder,
      borderWidth: 1,
      borderRadius: borderRadius.lg,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
  });
}

const stylesByMode = {
  light: createStyles(auraThemes.light),
  dark: createStyles(auraThemes.dark),
};

export function useOperationStyles() {
  return stylesByMode[useAuraTheme().mode];
}
