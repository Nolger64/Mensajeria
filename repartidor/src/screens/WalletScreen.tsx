import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AURA_THEME } from '../../../src/theme/auraTheme';

export const WalletScreen: React.FC = () => {
  const handleWithdraw = () => {
    Alert.alert(
      '🏦 Transferencia SPEI',
      '¿Deseas transferir $2,840.50 MXN a tu cuenta BBVA vinculada terminada en 8921? Dispersión inmediata sin comisiones.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Retiro',
          onPress: () => Alert.alert('Éxito', 'Transferencia enviada por SPEI en tiempo real.'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card matching Page 8 */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.walletTag}>Billetera de Embajador</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={11} color={AURA_THEME.colors.statusGreen} />
              <Text style={styles.verifiedBadgeText}>FONDOS VERIFICADOS</Text>
            </View>
          </View>

          <Text style={styles.balanceLabel}>Balance disponible para retiro</Text>
          <Text style={styles.balanceAmount}>$2,840.50 MXN</Text>

          <TouchableOpacity
            style={styles.transferBtn}
            onPress={handleWithdraw}
            activeOpacity={0.85}
          >
            <Text style={styles.transferBtnText}>
              Transferir a cuenta bancaria (SPEI Inmediato)
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.transferHelper}>
            Sin comisiones para embajadores certificados
          </Text>

          <View style={styles.divider} />

          <View style={styles.weeklySummaryRow}>
            <View>
              <Text style={styles.weekLabel}>Esta Semana</Text>
              <Text style={styles.weekAmount}>$4,620.00 MXN</Text>
            </View>
            <View style={styles.weekMetricsRight}>
              <View style={styles.metricPill}>
                <Text style={styles.metricPillVal}>38</Text>
                <Text style={styles.metricPillSub}>viajes</Text>
              </View>
              <View style={styles.metricPill}>
                <Text style={styles.metricPillVal}>42.5</Text>
                <Text style={styles.metricPillSub}>hrs</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actividad Semanal Bar Chart */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Actividad Semanal</Text>
            <View style={styles.peakPill}>
              <Text style={styles.peakPillText}>17:00 - 21:00</Text>
            </View>
          </View>
          <Text style={styles.activitySub}>
            Picos vespertinos de aromaterapia y baños botánicos
          </Text>

          <View style={styles.chartBarsRow}>
            {[
              { day: 'L', height: 40, amt: '$580' },
              { day: 'M', height: 55, amt: '$720' },
              { day: 'M', height: 48, amt: '$640' },
              { day: 'J', height: 65, amt: '$810' },
              { day: 'V', height: 85, amt: '$1,020', active: true },
              { day: 'S', height: 75, amt: '$930', active: true },
              { day: 'D', height: 35, amt: '$420' },
            ].map((bar, idx) => (
              <View key={idx} style={styles.barCol}>
                <View
                  style={[
                    styles.barFill,
                    { height: bar.height },
                    bar.active && styles.barFillActive,
                  ]}
                />
                <Text style={[styles.barDay, bar.active && styles.barDayActive]}>
                  {bar.day}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.chartFooterNote}>
            Mayor demanda terapéutica: Viernes y Sábado al atardecer.
          </Text>
        </View>

        {/* Desglose de Ingresos */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <Text style={styles.breakdownTitle}>Desglose de Ingresos</Text>
            <Text style={styles.breakdownTag}>SEMANA EN CURSO</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Tarifas por distancia</Text>
              <Text style={styles.itemSub}>Rutas botánicas y entrega segura</Text>
            </View>
            <Text style={styles.itemVal}>$2,950.00</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.itemTitle}>Propinas de clientes spa</Text>
                <View style={styles.percentPill}>
                  <Text style={styles.percentPillText}>24% total</Text>
                </View>
              </View>
              <Text style={styles.itemSub}>Gratitud por cuidado aromático</Text>
            </View>
            <Text style={[styles.itemVal, { color: AURA_THEME.colors.forestDark }]}>
              +$1,120.00
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.itemTitle}>Bonos Cero Huella</Text>
                <View style={styles.ecoPill}>
                  <Text style={styles.ecoPillText}>Eco-Impacto</Text>
                </View>
              </View>
              <Text style={styles.itemSub}>Reciclaje de envases retornables de vidrio</Text>
            </View>
            <Text style={[styles.itemVal, { color: AURA_THEME.colors.statusGreen }]}>
              +$550.00
            </Text>
          </View>
        </View>

        {/* Embajador Nivel Loto Oro */}
        <View style={styles.lotoOroCard}>
          <View style={styles.lotoHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="flower" size={20} color={AURA_THEME.colors.star} />
              <Text style={styles.lotoTitle}>Embajador Nivel Loto Oro</Text>
            </View>
            <View style={styles.lotoActiveBadge}>
              <Text style={styles.lotoActiveBadgeText}>ACTIVO</Text>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={AURA_THEME.colors.star} />
            <Text style={styles.ratingScore}>4.95</Text>
            <Text style={styles.ratingCount}>(142 valoraciones de huéspedes)</Text>
          </View>

          <Text style={styles.benefitsHeader}>BENEFICIOS EXCLUSIVOS EN VIGENCIA:</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={13} color={AURA_THEME.colors.statusGreen} />
            <Text style={styles.benefitItemText}>
              Mantenimiento integral gratuito de e-bike cada 15 días en taller aliado.
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={13} color={AURA_THEME.colors.statusGreen} />
            <Text style={styles.benefitItemText}>
              40% de descuento personal en masajes, faciales y circuito de hidroterapia.
            </Text>
          </View>
        </View>

        {/* Viajes de Hoy */}
        <View style={styles.tripsCard}>
          <View style={styles.tripsHeader}>
            <Text style={styles.tripsTitle}>Viajes de Hoy</Text>
            <TouchableOpacity onPress={() => Alert.alert('Historial', 'Cargando expediente botánico...')}>
              <Text style={styles.seeHistoryText}>Ver historial</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tripRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tripTimeRoute}>16:30 · Sede Jardines → Polanco</Text>
              <Text style={styles.tripSubDetail}>Propina incluida: +$16.00 MXN</Text>
            </View>
            <Text style={styles.tripPrice}>$82.50 MXN</Text>
          </View>

          <View style={styles.tripRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tripTimeRoute}>14:15 · Sede Providencia → Roma Nte.</Text>
              <Text style={styles.tripSubDetail}>Propina generosa: +$25.00 MXN</Text>
            </View>
            <Text style={styles.tripPrice}>$95.00 MXN</Text>
          </View>

          <View style={styles.tripRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tripTimeRoute}>11:40 · Sede Condesa → Condesa</Text>
              <Text style={styles.tripSubDetail}>Entrega en mano con kit reciclable</Text>
            </View>
            <Text style={styles.tripPrice}>$62.00 MXN</Text>
          </View>
        </View>

        {/* Cuidado Consciente Card */}
        <View style={styles.consciousCard}>
          <MaterialCommunityIcons name="spa-outline" size={20} color={AURA_THEME.colors.forestDark} />
          <View style={{ flex: 1 }}>
            <Text style={styles.consciousTitle}>Cuidado Consciente</Text>
            <Text style={styles.consciousText}>
              Cada entrega cuida el ritual y el balance del huésped con respeto absoluto al silencio urbano.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.bgPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletTag: {
    fontSize: 12,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AURA_THEME.colors.statusGreenBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.statusGreen,
  },
  balanceLabel: {
    fontSize: 11,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 12,
  },
  transferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AURA_THEME.colors.forestDark,
    paddingVertical: 10,
    borderRadius: AURA_THEME.borderRadius.md,
    gap: 6,
    marginBottom: 4,
  },
  transferBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  transferHelper: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: AURA_THEME.colors.borderLight,
    marginBottom: 12,
  },
  weeklySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  weekAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  weekMetricsRight: {
    flexDirection: 'row',
    gap: 8,
  },
  metricPill: {
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AURA_THEME.borderRadius.sm,
  },
  metricPillVal: {
    fontSize: 12,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  metricPillSub: {
    fontSize: 9,
    color: AURA_THEME.colors.textMuted,
  },
  activityCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  peakPill: {
    backgroundColor: AURA_THEME.colors.terracottaBadge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  peakPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.terracotta,
  },
  activitySub: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 14,
  },
  chartBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  barCol: {
    alignItems: 'center',
    width: 24,
  },
  barFill: {
    width: 14,
    backgroundColor: '#D6E4DA',
    borderRadius: 4,
    marginBottom: 4,
  },
  barFillActive: {
    backgroundColor: AURA_THEME.colors.forestDark,
  },
  barDay: {
    fontSize: 10,
    fontWeight: '600',
    color: AURA_THEME.colors.textMuted,
  },
  barDayActive: {
    color: AURA_THEME.colors.forestDark,
    fontWeight: '800',
  },
  chartFooterNote: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
    fontStyle: 'italic',
  },
  breakdownCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  breakdownTag: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.textMuted,
    letterSpacing: 0.8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AURA_THEME.colors.borderLight,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  itemSub: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
  },
  itemVal: {
    fontSize: 12.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  percentPill: {
    backgroundColor: '#EAF4EC',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  percentPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  ecoPill: {
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  ecoPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  lotoOroCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8DCB8',
    marginBottom: 14,
  },
  lotoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lotoTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#8B4E38',
  },
  lotoActiveBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lotoActiveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  ratingCount: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  benefitsHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#76422F',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  benefitItemText: {
    flex: 1,
    fontSize: 10.5,
    color: '#5C5449',
    lineHeight: 14,
  },
  tripsCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  tripsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  seeHistoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: AURA_THEME.colors.borderLight,
  },
  tripTimeRoute: {
    fontSize: 11.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  tripSubDetail: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
  },
  tripPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  consciousCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4EC',
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    gap: 10,
  },
  consciousTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 2,
  },
  consciousText: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textSecondary,
    lineHeight: 14,
  },
});
