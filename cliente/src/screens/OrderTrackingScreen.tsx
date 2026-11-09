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
import { useClient } from '../context/ClientContext';
import { AURA_THEME } from '../../../src/theme/auraTheme';

interface OrderTrackingScreenProps {
  onGoToStores: () => void;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  onGoToStores,
}) => {
  const { orders } = useClient();
  const [currentStep, setCurrentStep] = useState<number>(3); // 1: Confirmado, 2: Empacado, 3: En Camino, 4: En Puerta

  const orderCode = orders.length > 0 ? orders[0].orderCode : '#AUR-8921';
  const securityPin = orders.length > 0 && orders[0].securityPin ? orders[0].securityPin : '4921';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Highlight Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.badgeRow}>
            <View style={styles.enCaminoBadge}>
              <Text style={styles.enCaminoBadgeText}>EN CAMINO</Text>
            </View>
            <View style={styles.co2Badge}>
              <Ionicons name="leaf" size={11} color={AURA_THEME.colors.forestDark} />
              <Text style={styles.co2BadgeText}>0% Huella de Carbono</Text>
            </View>
          </View>

          <Text style={styles.statusTitle}>¡Tu ritual está en camino!</Text>
          <Text style={styles.statusSubtitle}>
            Entrega silenciosa y sostenible estimada en 14 min
          </Text>

          {/* Route Visual Diagram */}
          <View style={styles.routeVisual}>
            <View style={styles.routePoint}>
              <View style={styles.pointCircle}>
                <Ionicons name="business" size={14} color={AURA_THEME.colors.forestDark} />
              </View>
              <Text style={styles.pointLabel}>Sede Jardines</Text>
            </View>

            <View style={styles.routeLineActive}>
              <View style={styles.bikeIconFloating}>
                <Ionicons name="bicycle" size={16} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.routePoint}>
              <View style={[styles.pointCircle, styles.pointCircleDestination]}>
                <Ionicons name="home" size={14} color={AURA_THEME.colors.terracotta} />
              </View>
              <Text style={styles.pointLabel}>Tu Santuario</Text>
            </View>
          </View>

          <Text style={styles.routeThermalNote}>
            Caja térmica sellada con cera vegetal a 21°C
          </Text>
        </View>

        {/* Preparation Steps 1-4 */}
        <View style={styles.stepsCard}>
          <View style={styles.stepsHeader}>
            <Text style={styles.stepsTitle}>ETAPAS DE PREPARACIÓN</Text>
            <Text style={styles.stepCounterText}>Paso {currentStep} de 4</Text>
          </View>

          <View style={styles.stepsProgressRow}>
            {[
              { id: 1, label: 'Confirmado' },
              { id: 2, label: 'Empacado' },
              { id: 3, label: 'En Camino' },
              { id: 4, label: 'En Puerta' },
            ].map((st) => {
              const isPast = st.id < currentStep;
              const isCurrent = st.id === currentStep;
              return (
                <TouchableOpacity
                  key={st.id}
                  style={styles.stepItem}
                  onPress={() => setCurrentStep(st.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.stepCircle,
                      isPast && styles.stepCirclePast,
                      isCurrent && styles.stepCircleCurrent,
                    ]}
                  >
                    {isPast ? (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    ) : (
                      <Text
                        style={[
                          styles.stepNum,
                          isCurrent && { color: '#FFFFFF', fontWeight: '800' },
                        ]}
                      >
                        {st.id}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      (isCurrent || isPast) && styles.stepLabelActive,
                    ]}
                  >
                    {st.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.stepExplanationBox}>
            <Ionicons name="information-circle-outline" size={16} color={AURA_THEME.colors.forestDark} />
            <Text style={styles.stepExplanationText}>
              Mateo circula por vialidades bajas en ruido para preservar las esencias florales intactas.
            </Text>
          </View>
        </View>

        {/* Courier Info Card */}
        <View style={styles.courierCard}>
          <View style={styles.courierAvatarBox}>
            <MaterialCommunityIcons name="face-man-profile" size={26} color={AURA_THEME.colors.forestDark} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.courierName}>Mateo R.</Text>
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={10} color={AURA_THEME.colors.star} />
                <Text style={styles.ratingPillText}>4.95</Text>
              </View>
            </View>
            <Text style={styles.courierRole}>Embajador Eco-Aura Spa</Text>
            <Text style={styles.courierVehicle}>Bicicleta Eléctrica Aura #08</Text>
          </View>

          <View style={styles.courierActions}>
            <TouchableOpacity
              style={styles.iconActionBtn}
              onPress={() => Alert.alert('Llamar', 'Conectando con Mateo Silva (Eco-Bike #08)...')}
            >
              <Ionicons name="call" size={16} color={AURA_THEME.colors.forestDark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconActionBtn}
              onPress={() => Alert.alert('Mensaje', 'Abriendo canal sereno de mensajes con Mateo...')}
            >
              <Ionicons name="chatbubble" size={16} color={AURA_THEME.colors.forestDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security PIN Card matching Page 10 */}
        <View style={styles.pinCard}>
          <Text style={styles.pinCardLabel}>ENTREGA SEGURA</Text>
          <Text style={styles.pinCodeText}>{securityPin}</Text>
          <Text style={styles.pinHelperText}>Díselo a Mateo al recibir</Text>
        </View>

        {/* Order Details Preview */}
        <View style={styles.orderSummaryCard}>
          <View style={styles.orderSummaryHeader}>
            <Text style={styles.orderCode}>{orderCode}</Text>
            <Text style={styles.orderPrice}>$1,420 MXN</Text>
          </View>
          <Text style={styles.orderItemsPreview}>
            2 elixires aromáticos (Elixir Nocturno Ciprés & Lavanda 100ml, Bruma Áurea Romero)
          </Text>
        </View>

        {/* Support & Explore Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => Alert.alert('Ayuda', 'Sede Jardines del Valle: +52 55 4001 2233')}
          >
            <Ionicons name="help-buoy-outline" size={16} color={AURA_THEME.colors.forestDark} />
            <Text style={styles.helpBtnText}>Ayuda / Soporte Sede Jardines</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exploreMoreBtn} onPress={onGoToStores}>
            <Text style={styles.exploreMoreText}>Explorar más Rituales Aura</Text>
          </TouchableOpacity>
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
    paddingBottom: 90,
  },
  statusBanner: {
    backgroundColor: '#EAF4EC',
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D4E8D8',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  enCaminoBadge: {
    backgroundColor: AURA_THEME.colors.terracotta,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  enCaminoBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  co2Badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: AURA_THEME.borderRadius.full,
  },
  co2BadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 12.5,
    color: AURA_THEME.colors.textSecondary,
    marginBottom: 16,
  },
  routeVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  routePoint: {
    alignItems: 'center',
    width: 80,
  },
  pointCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AURA_THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
    marginBottom: 4,
  },
  pointCircleDestination: {
    backgroundColor: AURA_THEME.colors.terracottaSoft,
    borderColor: AURA_THEME.colors.terracottaBadge,
  },
  pointLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  routeLineActive: {
    flex: 1,
    height: 2,
    backgroundColor: AURA_THEME.colors.forestDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    position: 'relative',
  },
  bikeIconFloating: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AURA_THEME.colors.forestDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeThermalNote: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  stepsCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: AURA_THEME.colors.textMuted,
    letterSpacing: 0.8,
  },
  stepCounterText: {
    fontSize: 11,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  stepsProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  stepItem: {
    alignItems: 'center',
    width: 65,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCirclePast: {
    backgroundColor: AURA_THEME.colors.forestDark,
    borderColor: AURA_THEME.colors.forestDark,
  },
  stepCircleCurrent: {
    backgroundColor: AURA_THEME.colors.terracotta,
    borderColor: AURA_THEME.colors.terracotta,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: AURA_THEME.colors.textSecondary,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: AURA_THEME.colors.textMuted,
  },
  stepLabelActive: {
    color: AURA_THEME.colors.forestDark,
    fontWeight: '700',
  },
  stepExplanationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderRadius: AURA_THEME.borderRadius.sm,
    padding: 8,
    gap: 6,
  },
  stepExplanationText: {
    flex: 1,
    fontSize: 10.5,
    color: AURA_THEME.colors.textSecondary,
    lineHeight: 14,
  },
  courierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
    gap: 12,
  },
  courierAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AURA_THEME.colors.sageBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierName: {
    fontSize: 14,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  ratingPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#92400E',
  },
  courierRole: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
  },
  courierVehicle: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
  },
  courierActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
  },
  pinCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8DCB8',
    marginBottom: 14,
  },
  pinCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  pinCodeText: {
    fontSize: 32,
    fontWeight: '900',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 8,
    marginVertical: 4,
  },
  pinHelperText: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
    fontWeight: '600',
  },
  orderSummaryCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 16,
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderCode: {
    fontSize: 12,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  orderPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  orderItemsPreview: {
    fontSize: 11,
    color: AURA_THEME.colors.textMuted,
  },
  bottomActions: {
    gap: 8,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AURA_THEME.colors.surface,
    paddingVertical: 10,
    borderRadius: AURA_THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    gap: 6,
  },
  helpBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  exploreMoreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  exploreMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
});
