import React, { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { useAuraTheme } from '../theme/AuraThemeProvider';
import { useOperationStyles } from '../theme/operationStyles';

export function AuraInput({ style, onFocus, onBlur, multiline, ...props }: TextInputProps) {
  const styles = useOperationStyles();
  const { theme: { colors } } = useAuraTheme();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      selectionColor={colors.accent}
      multiline={multiline}
      {...props}
      style={[styles.input, multiline && styles.inputMultiline, style, focused && styles.inputFocused]}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
    />
  );
}
