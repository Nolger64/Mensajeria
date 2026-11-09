import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { AURA_THEME } from '../../../src/theme/auraTheme';

export const DriverRadarScreen: React.FC = () => {
  const { allOrders, acceptIncomingOrder } = useApp();
  const [acceptedPriority, setAcceptedPriority] = useState(false);

  const handleAcceptPriority = () => {
    setAcceptedPriority(true);
    Alert.alert(
      '🚴 Envío Sereno Aceptado',
      'Dirígete a Sede Jardines del Valle para recoger el pedido #AUR-8921. Caja térmica regulada a 21°C.',
      [{ text: 'Ver Navegación' }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Row matching Page 11 */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>COMPLETADAS</Text>
            <Text style={styles.kpiValue}>4 rituales</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>GANANCIA HOY</Text>
            <Text style={[styles.kpiValue, { color: AURA_THEME.colors.forestDark }]}>$385 MXN</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>ARMONÍA</Text>
            <Text style={[styles.kpiValue, { color: AURA_THEME.colors.statusGreen }]}>98%</Text>
            <Text style={styles.kpiSubText}>satisfacción</Text>
          </View>
        </View>

        {/* High Demand Botanical Banner */}
        <View style={styles.demandBanner}>
          <View style={styles.demandBadge}>
            <Ionicons name="flame" size={12} color="#FFFFFF" />
            <Text style={styles.demandBadgeText}>ALTA DEMANDA BOTÁNICA</Text>
          </View>
          <Text style={styles.demandTitle}>Sede Jardines del Valle & Providencia</Text>
          <Text style={styles.demandDesc}>
            Recibe +$35 MXN extra por cada entrega serena en esta franja.
          </Text>
        </View>

        {/* Available Immediate Orders List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Envíos Inmediatos</Text>
          <View style={styles.availableBadge}>
            <Text style={styles.availableBadgeText}>3 disponibles</Text>
          </View>
        </View>

        {/* Card 1: Prioritario AUR-8921 */}
        <View style={[styles.orderCard, styles.orderCardPriority]}>
          <View style={styles.orderCardHeader}>
            <View style={styles.priorityPill}>
              <Text style={styles.priorityPillText}>PRIORITARIO</Text>
            </View>
            <Text style={styles.timerCountdown}>44s para expirar</Text>
          </View>

          <Text style={styles.orderRouteTitle}>Ritual Express - Jardines</Text>
          <Text style={styles.orderDestination}>Hacia Polanco V Secc</Text>

          <View style={styles.orderMetricsRow}>
            <View>
              <Text style={styles.orderPriceHighlight}>$82.50 MXN</Text>
              <Text style={styles.orderTipIncluded}>Propina incluida</Text>
            </View>
            <View style={styles.metaDivider} />
            <View>
              <Text style={styles.metaVal}>18 min</Text>
              <Text style={styles.metaLabel}>estimados</Text>
            </View>
            <View style={styles.metaDivider} />
            <View>
              <Text style={styles.metaVal}>3.2 km</Text>
              <Text style={styles.metaLabel}>totales</Text>
            </View>
          </View>

          <View style={styles.fragileNotice}>
            <Ionicons name="alert-circle" size={14} color={AURA_THEME.colors.terracotta} />
            <Text style={styles.fragileText}>
              2 frascos de esencias delicadas. Requiere soporte vertical en compartimento acolchado.
            </Text>
          </View>

          <View style={styles.orderActionsRow}>
            <TouchableOpacity
              style={styles.pauseBtn}
              onPress={() => Alert.alert('Pausar', 'Envío pausado temporalmente.')}
            >
              <Text style={styles.pauseBtnText}>Pausar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptBtn, acceptedPriority && styles.acceptBtnDisabled]}
              onPress={handleAcceptPriority}
              activeOpacity={0.85}
              disabled={acceptedPriority}
            >
              <Text style={styles.acceptBtnText}>
                {acceptedPriority ? 'Asignado a tu Eco-Bike' : 'Aceptar Envío Sereno'}
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 2: Kit Spa Bienestar */}
        <View style={styles.orderCard}>
          <View style={styles.orderCardHeader}>
            <Text style={styles.normalTag}>KIT SPA BIENESTAR</Text>
            <Text style={styles.timeAgo}>Hace 3 min</Text>
          </View>

          <Text style={styles.orderRouteTitle}>Boutique Providencia → Condesa</Text>
          <Text style={styles.orderDetailSub}>Kit Baño de Inmersión (3.1 kg)</Text>

          <View style={styles.orderMetricsRow}>
            <Text style={styles.orderPriceNormal}>$115.00 MXN</Text>
            <Text style={styles.distanceNormal}>4.5 km • 26 min</Text>
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => Alert.alert('Revisar', 'Boutique Providencia → Condesa ($115.00 MXN)')}
            >
              <Text style={styles.reviewBtnText}>Revisar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 3: Insumos Botánicos */}
        <View style={styles.orderCard}>
          <View style={styles.orderCardHeader}>
            <Text style={styles.normalTag}>INSUMOS BOTÁNICOS</Text>
            <Text style={styles.timeAgo}>Hace 6 min</Text>
          </View>

          <Text style={styles.orderRouteTitle}>Santuario Financiero → Juárez</Text>
          <Text style={styles.orderDetailSub}>Infusiones y Ceras de Soja (0.8 kg)</Text>

          <View style={styles.orderMetricsRow}>
            <Text style={styles.orderPriceNormal}>$68.00 MXN</Text>
            <Text style={styles.distanceNormal}>2.1 km • 12 min</Text>
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => Alert.alert('Revisar', 'Santuario Financiero → Juárez ($68.00 MXN)')}
            >
              <Text style={styles.reviewBtnText}>Revisar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Guía de Entrega Consciente matching Page 11 */}
        <View style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={AURA_THEME.colors.forestDark} />
            <Text style={styles.guideTitle}>Guía de Entrega Consciente</Text>
          </View>

          <View style={styles.guideItem}>
            <View style={styles.guideDot} />
            <Text style={styles.guideItemText}>
              Mantén la caja térmica siempre a 21°C para preservar las propiedades de los aceites prensados en frío.
            </Text>
          </View>

          <View style={styles.guideItem}>
            <View style={styles.guideDot} />
            <Text style={styles.guideItemText}>
              Evita frenados bruscos con los ungüentos de cera de abeja y sérums florales en envase ámbar.
            </Text>
          </View>

          <View style={styles.guideItem}>
            <View style={styles.guideDot} />
            <Text style={styles.guideItemText}>
              Al entregar en el domicilio, saluda en tono sereno y ofrece la tarjeta de aromaterapia personalizada.
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
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.md,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 13,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  kpiSubText: {
    fontSize: 9,
    color: AURA_THEME.colors.textMuted,
  },
  demandBanner: {
    backgroundColor: '#FAF5EE',
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8DCB8',
    marginBottom: 16,
  },
  demandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: AURA_THEME.colors.terracotta,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
    marginBottom: 6,
  },
  demandBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  demandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 2,
  },
  demandDesc: {
    fontSize: 11.5,
    color: '#675E4F',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  availableBadge: {
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: AURA_THEME.borderRadius.full,
  },
  availableBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  orderCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 12,
  },
  orderCardPriority: {
    borderWidth: 1.5,
    borderColor: AURA_THEME.colors.terracottaBadge,
    backgroundColor: '#FFFAF8',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priorityPill: {
    backgroundColor: AURA_THEME.colors.terracotta,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timerCountdown: {
    fontSize: 11,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
  normalTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestMedium,
    letterSpacing: 0.5,
  },
  timeAgo: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  orderRouteTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 2,
  },
  orderDestination: {
    fontSize: 12,
    color: AURA_THEME.colors.textSecondary,
    marginBottom: 10,
  },
  orderDetailSub: {
    fontSize: 11.5,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 10,
  },
  orderMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderRadius: AURA_THEME.borderRadius.md,
    padding: 10,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  orderPriceHighlight: {
    fontSize: 14.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  orderTipIncluded: {
    fontSize: 10,
    color: AURA_THEME.colors.statusGreen,
    fontWeight: '600',
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: AURA_THEME.colors.borderLight,
  },
  metaVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
    textAlign: 'center',
  },
  metaLabel: {
    fontSize: 9.5,
    color: AURA_THEME.colors.textMuted,
    textAlign: 'center',
  },
  orderPriceNormal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  distanceNormal: {
    fontSize: 11.5,
    color: AURA_THEME.colors.textSecondary,
  },
  reviewBtn: {
    backgroundColor: AURA_THEME.colors.forestDark,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: AURA_THEME.borderRadius.sm,
  },
  reviewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fragileNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBECE5',
    borderRadius: AURA_THEME.borderRadius.sm,
    padding: 8,
    gap: 6,
    marginBottom: 12,
  },
  fragileText: {
    flex: 1,
    fontSize: 10.5,
    color: '#76422F',
    lineHeight: 14,
  },
  orderActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pauseBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: AURA_THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
    backgroundColor: AURA_THEME.colors.surface,
  },
  pauseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.textSecondary,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AURA_THEME.colors.terracotta,
    paddingVertical: 10,
    borderRadius: AURA_THEME.borderRadius.md,
    gap: 6,
  },
  acceptBtnDisabled: {
    backgroundColor: AURA_THEME.colors.forestDark,
  },
  acceptBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guideCard: {
    backgroundColor: '#F3F7F4',
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginTop: 6,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  guideDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AURA_THEME.colors.forestMedium,
    marginTop: 5,
  },
  guideItemText: {
    flex: 1,
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
    lineHeight: 15,
  },
});
