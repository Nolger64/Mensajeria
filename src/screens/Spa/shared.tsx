import React, { type PropsWithChildren } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, type TextInputProps } from 'react-native';
import { AuraInput } from '../../components/AuraInput';
import { auraThemes, type AuraTheme } from '../../theme/auraTheme';
import { useAuraTheme } from '../../theme/AuraThemeProvider';
import { useOperationStyles } from '../../theme/operationStyles';
import { formatOrderAmount } from '../../services/orderDisplay';
import { spaDate, spaTime, type Appointment } from '../../services/spaApi';

export function SpaPage({ children }: PropsWithChildren) {
  const styles = useOperationStyles();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, layoutStyles.content]}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const styles = useOperationStyles();
  return (
    <View style={layoutStyles.field}>
      <Text style={styles.text}>{label}</Text>
      <AuraInput {...props} accessibilityLabel={label} />
    </View>
  );
}

export function Action({ label, onPress, disabled, secondary }: {
  label: string; onPress: () => void; disabled?: boolean; secondary?: boolean;
}) {
  const styles = useOperationStyles();
  const pageStyles = stylesByMode[useAuraTheme().mode];
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }} onPress={onPress}
      disabled={disabled} style={[styles.button, secondary && pageStyles.secondary, disabled && pageStyles.disabled]}>
      <Text style={[styles.buttonText, secondary && pageStyles.secondaryText]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Choice({ children, selected, onPress, disabled }: PropsWithChildren<{
  selected: boolean; onPress: () => void; disabled?: boolean;
}>) {
  const pageStyles = stylesByMode[useAuraTheme().mode];
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected, disabled }} onPress={onPress}
      disabled={disabled} style={[pageStyles.choice, selected && pageStyles.selected, disabled && pageStyles.disabled]}>
      <Text style={[pageStyles.choiceText, selected && pageStyles.choiceTextSelected]}>{children}</Text>
    </TouchableOpacity>
  );
}

export function Feedback({ error, notice, loading }: { error?: string; notice?: string; loading?: boolean }) {
  const styles = useOperationStyles();
  const { theme: { colors } } = useAuraTheme();
  return (
    <>
      {loading && <ActivityIndicator color={colors.accent} accessibilityLabel="Cargando" />}
      {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
      {!!notice && <Text style={styles.text} accessibilityRole="alert">{notice}</Text>}
    </>
  );
}

const statuses = {
  confirmada: 'Confirmada', cancelada: 'Cancelada', atendida: 'Atendida', no_asistio: 'No asistió',
};

export function AppointmentCard({ appointment, children }: PropsWithChildren<{ appointment: Appointment }>) {
  const styles = useOperationStyles();
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{appointment.serviceName} · {statuses[appointment.status]}</Text>
      <Text style={styles.text}>{spaDate(appointment.startsAt)} · {spaTime(appointment.startsAt)} a {spaTime(appointment.endsAt)}</Text>
      <Text style={styles.text}>{appointment.branchName} · {appointment.branchAddress}</Text>
      <Text style={styles.text}>{appointment.customerName
        ? `${appointment.customerName} · Especialista: ${appointment.specialistName}`
        : appointment.specialistName}
      </Text>
      {!!appointment.sessionName && <Text style={styles.text}>Horario · {appointment.sessionName}</Text>}
      <Text style={styles.text}>{appointment.price == null ? 'Precio por consultar en la sede' : formatOrderAmount(appointment.price)} · {appointment.durationMinutes} min</Text>
      {children}
    </View>
  );
}

export const rowStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

const layoutStyles = StyleSheet.create({
  content: { paddingTop: 20, paddingBottom: 32 },
  field: { gap: 6 },
});

function createStyles({ colors, font, borderRadius }: AuraTheme) {
  return StyleSheet.create({
    secondary: {
      backgroundColor: colors.accentMuted,
      borderColor: colors.buttonSecondaryOutline,
      borderWidth: 1,
      borderRadius: borderRadius.full,
    },
    secondaryText: {
      color: colors.textPrimary,
      fontFamily: font.regular,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    disabled: { opacity: 0.5 },
    choice: {
      minHeight: 39,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'transparent',
      borderRadius: 9,
      paddingHorizontal: 13,
      paddingVertical: 8,
      backgroundColor: colors.support,
    },
    selected: { backgroundColor: colors.accentWash, borderColor: colors.accent },
    choiceText: { fontFamily: font.regular, color: colors.textSecondary, fontSize: 13 },
    choiceTextSelected: { color: colors.textPrimary },
  });
}

const stylesByMode = {
  light: createStyles(auraThemes.light),
  dark: createStyles(auraThemes.dark),
};
