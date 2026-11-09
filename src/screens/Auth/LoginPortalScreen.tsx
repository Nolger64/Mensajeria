import React, { useState, useEffect } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { authService, AuthUser, DEMO_USERS, UserRole } from '../../services/authService';
import { AURA_THEME } from '../../theme/auraTheme';

interface LoginPortalScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPortalScreen: React.FC<LoginPortalScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [activeQuickTab, setActiveQuickTab] = useState<UserRole>('repartidor');

  useEffect(() => {
    authService.checkHealth().then((isOnline) => {
      setServerOnline(isOnline);
    });

    const def = DEMO_USERS['repartidor'];
    setEmail(def.email);
    setPassword(def.defaultPass);
  }, []);

  const handleSelectQuickRole = (roleKey: UserRole) => {
    setActiveQuickTab(roleKey);
    const demo = DEMO_USERS[roleKey];
    setEmail(demo.email);
    setPassword(demo.defaultPass);
    setErrorMessage(null);
  };

  const handleLogin = async (overrideEmail?: string, overridePass?: string) => {
    const targetEmail = overrideEmail || email;
    const targetPass = overridePass || password;

    if (!targetEmail.trim() || !targetPass.trim()) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await authService.login(targetEmail, targetPass);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.message || 'No se pudo iniciar sesión. Verifica tus datos.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocurrió un error inesperado al conectar.');
    } finally {
      setLoading(false);
    }
  };

  const quickRoles: UserRole[] = ['repartidor', 'administrador', 'cliente'];

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
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.badgeTop}>
            <Ionicons name="leaf" size={13} color={AURA_THEME.colors.forestDark} />
            <Text style={styles.badgeTopText}>SANTUARIOS & BOTICA</Text>
          </View>

          <Text style={styles.mainTitle}>AURA BOTANICALS</Text>
          <Text style={styles.portalTagText}>PORTAL UNIFICADO DE ACCESO</Text>
          <Text style={styles.subtitle}>
            Inicia sesión según tu rol asignado para ingresar a tu santuario operativo: Aura Courier Pro, Aura Central o Aura Botanicals.
          </Text>

          {/* Server Connection Pill */}
          <View
            style={[
              styles.serverPill,
              serverOnline ? styles.serverOnlinePill : styles.serverOfflinePill,
            ]}
          >
            <View
              style={[
                styles.serverDot,
                serverOnline ? styles.serverDotOnline : styles.serverDotOffline,
              ]}
            />
            <Text
              style={[
                styles.serverText,
                serverOnline ? styles.serverTextOnline : styles.serverTextOffline,
              ]}
            >
              {serverOnline === null
                ? 'Comprobando conexión botánica...'
                : serverOnline
                ? 'Red de Sedes Activa · Backend Conectado'
                : 'Modo Autónomo Local Activo (Credenciales Listas)'}
            </Text>
          </View>
        </View>

        {/* Roles Cards */}
        <View style={styles.quickAccessSection}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="flower-tulip-outline" size={18} color={AURA_THEME.colors.terracotta} />
            <Text style={styles.sectionTitle}>Acceso por Rol (1 Toque)</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Selecciona tu perfil botánico para autocompletar credenciales o ingresar de inmediato:
          </Text>

          <View style={styles.cardsRow}>
            {quickRoles.map((roleKey) => {
              const demo = DEMO_USERS[roleKey];
              const isSelected = activeQuickTab === roleKey;
              return (
                <TouchableOpacity
                  key={roleKey}
                  style={[
                    styles.roleCard,
                    isSelected && styles.roleCardSelected,
                  ]}
                  onPress={() => handleSelectQuickRole(roleKey)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.cardIconBox, { backgroundColor: isSelected ? AURA_THEME.colors.terracottaBadge : AURA_THEME.colors.sageBadge }]}>
                    <Ionicons name={demo.icon as any} size={20} color={isSelected ? AURA_THEME.colors.terracotta : AURA_THEME.colors.forestDark} />
                  </View>
                  <Text style={[styles.cardRoleLabel, { color: isSelected ? AURA_THEME.colors.terracotta : AURA_THEME.colors.forestDark }]}>
                    {demo.roleLabel}
                  </Text>
                  <Text style={styles.cardUserName} numberOfLines={1}>
                    {demo.name}
                  </Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {demo.roleDescription}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.directEntryBtn,
                      { backgroundColor: isSelected ? AURA_THEME.colors.terracotta : AURA_THEME.colors.forestDark },
                    ]}
                    onPress={() => handleLogin(demo.email, demo.defaultPass)}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.directEntryBtnText}>Entrar directo</Text>
                    <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Formulario de Login Tradicional */}
        <View style={styles.formCard}>
          <View style={styles.formHeaderRow}>
            <Ionicons name="lock-closed-outline" size={18} color={AURA_THEME.colors.forestDark} />
            <Text style={styles.formTitle}>Credenciales de Acceso</Text>
          </View>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={AURA_THEME.colors.statusRed} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Email Input */}
          <Text style={styles.inputLabel}>Correo Institucional o Usuario</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={AURA_THEME.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="ejemplo@fhs.com"
              placeholderTextColor={AURA_THEME.colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {email.length > 0 && (
              <TouchableOpacity onPress={() => setEmail('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={16} color={AURA_THEME.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Password Input */}
          <Text style={styles.inputLabel}>Contraseña de Seguridad</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="key-outline" size={18} color={AURA_THEME.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={AURA_THEME.colors.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.clearBtn}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={AURA_THEME.colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={() => handleLogin()}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.loginBtnContent}>
                <Text style={styles.loginBtnText}>Ingresar al Santuario</Text>
                <Ionicons name="log-in-outline" size={19} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Roles Details Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Ecosistema de Aplicaciones Aura</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: AURA_THEME.colors.terracotta }]} />
            <Text style={styles.legendText}>
              <Text style={{ fontWeight: '700', color: AURA_THEME.colors.forestDark }}>Aura Courier Pro: </Text>
              Rutas con alta demanda, navegación en tiempo real hacia el cliente, validación de código PIN y billetera de ganancias.
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: AURA_THEME.colors.forestDark }]} />
            <Text style={styles.legendText}>
              <Text style={{ fontWeight: '700', color: AURA_THEME.colors.forestDark }}>Aura Central: </Text>
              Operaciones de red de boticas, control de sedes & stock con reciclaje de vidrio, flota activa y panel ejecutivo financiero.
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: AURA_THEME.colors.forestLight }]} />
            <Text style={styles.legendText}>
              <Text style={{ fontWeight: '700', color: AURA_THEME.colors.forestDark }}>Aura Botanicals: </Text>
              Catálogo de fórmulas de bienestar, canasta de serenidad con despacho ecológico y rastreo con código PIN de entrega.
            </Text>
          </View>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>Aura Botanicals • Cuidado Holístico & Entrega Consciente</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.bgPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 22,
  },
  badgeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: AURA_THEME.borderRadius.full,
    marginBottom: 10,
  },
  badgeTopText: {
    fontSize: 11,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 1.2,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  portalTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: AURA_THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: AURA_THEME.borderRadius.full,
    borderWidth: 1,
    gap: 8,
  },
  serverOnlinePill: {
    backgroundColor: AURA_THEME.colors.statusGreenBg,
    borderColor: '#C3E6CB',
  },
  serverOfflinePill: {
    backgroundColor: AURA_THEME.colors.statusYellowBg,
    borderColor: '#FFE8A1',
  },
  serverDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serverDotOnline: {
    backgroundColor: AURA_THEME.colors.statusGreen,
  },
  serverDotOffline: {
    backgroundColor: AURA_THEME.colors.statusYellow,
  },
  serverText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  serverTextOnline: {
    color: AURA_THEME.colors.statusGreen,
  },
  serverTextOffline: {
    color: AURA_THEME.colors.statusYellow,
  },
  quickAccessSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: AURA_THEME.colors.textSecondary,
    marginBottom: 12,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleCard: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1.5,
    borderColor: AURA_THEME.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 185,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  roleCardSelected: {
    borderColor: AURA_THEME.colors.terracotta,
    backgroundColor: '#FFFAF8',
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardRoleLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 3,
  },
  cardUserName: {
    fontSize: 12,
    fontWeight: '600',
    color: AURA_THEME.colors.forestDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 13,
    marginBottom: 8,
  },
  directEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
    paddingVertical: 7,
    borderRadius: AURA_THEME.borderRadius.sm,
  },
  directEntryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.statusRedBg,
    borderRadius: AURA_THEME.borderRadius.sm,
    padding: 10,
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F8B4B4',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: AURA_THEME.colors.statusRed,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderRadius: AURA_THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
    paddingHorizontal: 12,
    marginBottom: 14,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: AURA_THEME.colors.textPrimary,
  },
  clearBtn: {
    padding: 4,
  },
  loginBtn: {
    backgroundColor: AURA_THEME.colors.terracotta,
    borderRadius: AURA_THEME.borderRadius.md,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: AURA_THEME.colors.terracotta,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  legendContainer: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 18,
  },
  legendTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  legendText: {
    flex: 1,
    fontSize: 12,
    color: AURA_THEME.colors.textSecondary,
    lineHeight: 17,
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 11,
    color: AURA_THEME.colors.textMuted,
    fontStyle: 'italic',
  },
});
