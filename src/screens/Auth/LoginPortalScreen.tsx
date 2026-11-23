import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService, AuthUser, UserRole } from '../../services/authService';
import { auraThemes, type AuraTheme } from '../../theme/auraTheme';
import { useAuraTheme } from '../../theme/AuraThemeProvider';
import { AppearanceButton } from '../../components/AppearanceButton';
import { Appear } from '../../components/Appear';

interface LoginPortalScreenProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
  requiredRole?: UserRole;
}

export const LoginPortalScreen: React.FC<LoginPortalScreenProps> = ({ onLoginSuccess, requiredRole }) => {
  const { mode, theme: { colors } } = useAuraTheme();
  const styles = stylesByMode[mode];
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (loading) return;
    if (registering && !name.trim()) {
      setErrorMessage('Ingresa tu nombre.');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMessage('Ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const { user, token } = registering
        ? await authService.register({ name, email, password })
        : await authService.login(email, password);
      if (requiredRole && user.role !== requiredRole) {
        setErrorMessage('Esta cuenta no tiene acceso a esta aplicación.');
        return;
      }
      setPassword('');
      onLoginSuccess(user, token);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.appearanceRow}>
          <AppearanceButton showLabel />
        </View>
        {/* Brand Header */}
        <Appear style={styles.brandHeader}>
          <View style={styles.badgeTop}>
            <Ionicons name="leaf" size={13} color={colors.accent} />
            <Text style={styles.badgeTopText}>TIENDA Y TRATAMIENTOS</Text>
          </View>

          <Text style={styles.mainTitle}>AURA SPA</Text>
        </Appear>

        {/* Formulario de Login Tradicional */}
        <Appear style={styles.formCard}>
          <View style={styles.formHeaderRow}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.accent} />
            <Text style={styles.formTitle}>{registering ? 'Crea tu cuenta' : 'Inicia sesión'}</Text>
          </View>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.alertText} />
              <Text style={styles.errorText} accessibilityRole="alert">{errorMessage}</Text>
            </View>
          )}

          {registering && (
            <>
              <Text style={styles.inputLabel}>Nombre</Text>
              <View style={[styles.inputWrapper, focusedField === 'name' && styles.inputFocused]}>
                <TextInput style={styles.textInput} accessibilityLabel="Nombre" autoComplete="name"
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                  value={name} onChangeText={setName} editable={!loading} />
              </View>
            </>
          )}

          <Text style={styles.inputLabel}>Correo electrónico</Text>
          <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputFocused]}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.accent}
              accessibilityLabel="Correo electrónico"
              keyboardType="email-address"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {email.length > 0 && (
              <TouchableOpacity onPress={() => setEmail('')} style={styles.clearBtn} accessibilityLabel="Borrar correo">
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Password Input */}
          <Text style={styles.inputLabel}>Contraseña</Text>
          <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputFocused]}>
            <Ionicons name="key-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.accent}
              secureTextEntry={!showPassword}
              accessibilityLabel="Contraseña"
              autoComplete={registering ? 'new-password' : 'current-password'}
              onSubmitEditing={handleLogin}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              style={styles.clearBtn}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.onAccent} size="small" />
            ) : (
              <View style={styles.loginBtnContent}>
                <Text style={styles.loginBtnText}>{registering ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
                <Ionicons name="log-in-outline" size={19} color={colors.onAccent} />
              </View>
            )}
          </TouchableOpacity>
          {(!requiredRole || requiredRole === 'cliente') && (
            <TouchableOpacity disabled={loading} onPress={() => {
              setRegistering(!registering);
              setErrorMessage(null);
            }} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{registering ? 'Ya tengo cuenta' : 'Crear cuenta de cliente'}</Text>
            </TouchableOpacity>
          )}
        </Appear>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

function createStyles({ colors, font, borderRadius, surfaceShadow }: AuraTheme) {
  return StyleSheet.create({
    keyboardContainer: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 22,
      paddingVertical: 36,
    },
    appearanceRow: {
      width: '100%',
      maxWidth: 430,
      alignItems: 'flex-end',
      marginBottom: 16,
    },
    brandHeader: {
      alignItems: 'center',
      gap: 10,
      marginBottom: 28,
    },
    badgeTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.support,
      borderColor: colors.borderLight,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: borderRadius.full,
    },
    badgeTopText: {
      fontSize: 10,
      fontFamily: font.regular,
      color: colors.textPrimary,
      letterSpacing: 1.15,
    },
    mainTitle: {
      fontSize: 48,
      fontFamily: font.light,
      color: colors.textPrimary,
      letterSpacing: 5,
      textAlign: 'center',
    },
    formCard: {
      width: '100%',
      maxWidth: 430,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: surfaceShadow,
    },
    formHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 20,
    },
    formTitle: {
      fontSize: 15,
      fontFamily: font.regular,
      color: colors.textPrimary,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSubtle,
      borderRadius: borderRadius.md,
      padding: 10,
      gap: 8,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.alertBorder,
    },
    errorText: {
      flex: 1,
      fontSize: 13,
      color: colors.alertText,
      fontFamily: font.regular,
    },
    inputLabel: {
      fontSize: 13,
      fontFamily: font.regular,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSubtle,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: 'transparent',
      paddingHorizontal: 14,
      marginBottom: 15,
      minHeight: 49,
    },
    inputFocused: { borderColor: colors.borderMedium },
    inputIcon: { marginRight: 8 },
    textInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: font.regular,
      color: colors.textPrimary,
    },
    clearBtn: { padding: 7 },
    loginBtn: {
      backgroundColor: colors.accent,
      borderRadius: borderRadius.full,
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 7,
    },
    loginBtnDisabled: { opacity: 0.55 },
    loginBtnContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    loginBtnText: {
      color: colors.onAccent,
      fontSize: 15,
      fontFamily: font.medium,
    },
    secondaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.borderMedium,
      marginTop: 12,
      paddingHorizontal: 12,
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: font.regular,
    },
  });
}

const stylesByMode = {
  light: createStyles(auraThemes.light),
  dark: createStyles(auraThemes.dark),
};
