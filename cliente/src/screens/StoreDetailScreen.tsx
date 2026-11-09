import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useClient } from '../context/ClientContext';
import { PartnerStore } from '../types';
import { AURA_THEME } from '../../../src/theme/auraTheme';

interface StoreDetailScreenProps {
  store: PartnerStore;
  onBack: () => void;
  onGoToCart: () => void;
}

export const StoreDetailScreen: React.FC<StoreDetailScreenProps> = ({
  store,
  onBack,
  onGoToCart,
}) => {
  const { stores, addToCart, totalCartItemCount } = useClient();
  const [selectedPickupMode, setSelectedPickupMode] = useState<'domicilio' | 'sede'>('sede');
  const [activeStoreId, setActiveStoreId] = useState<string>(store.id);

  const currentStore = stores.find((s) => s.id === activeStoreId) || store;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery / Pickup tab toggle */}
        <View style={styles.pickupModeToggle}>
          <TouchableOpacity
            style={[styles.pickupBtn, selectedPickupMode === 'domicilio' && styles.pickupBtnActive]}
            onPress={() => setSelectedPickupMode('domicilio')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.pickupBtnText,
                selectedPickupMode === 'domicilio' && styles.pickupBtnTextActive,
              ]}
            >
              Entrega a Domicilio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pickupBtn, selectedPickupMode === 'sede' && styles.pickupBtnActive]}
            onPress={() => setSelectedPickupMode('sede')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.pickupBtnText,
                selectedPickupMode === 'sede' && styles.pickupBtnTextActive,
              ]}
            >
              Recoger en Sede
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location Indicator Banner */}
        <View style={styles.locationCard}>
          <View style={styles.locationPinBox}>
            <Ionicons name="location" size={18} color={AURA_THEME.colors.forestDark} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.locationTitle}>Tú estás aquí · Jardines · 1.8km</Text>
            </View>
            <Text style={styles.locationSub}>3 santuarios con despacho activo en tu zona</Text>
          </View>
          <View style={styles.filterPill}>
            <Text style={styles.filterPillText}>DISPONIBILIDAD</Text>
          </View>
        </View>

        {/* Sanctuary Cards matching Page 7 */}
        <Text style={styles.sectionHeaderTitle}>Santuarios por cercanía</Text>

        {stores.map((s) => {
          const isSelected = s.id === activeStoreId;
          return (
            <View
              key={s.id}
              style={[
                styles.sanctuaryCard,
                isSelected && styles.sanctuaryCardActive,
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.tierTag}>
                  <Text style={styles.tierTagText}>
                    {s.id === 'store-1' ? 'SEDE PRINCIPAL' : s.id === 'store-2' ? 'BOUTIQUE ESPECIALIZADA' : 'SANTUARIO URBANO'}
                  </Text>
                </View>
                <Text style={styles.distanceBadge}>{s.distanceKm} km</Text>
              </View>

              <Text style={styles.sanctuaryTitle}>{s.name}</Text>
              <Text style={styles.sanctuaryAddress}>{s.address}</Text>

              {/* Stats Grid */}
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Distancia</Text>
                  <Text style={styles.statVal}>{s.distanceKm} km</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Entrega</Text>
                  <Text style={styles.statVal}>{s.averagePrepTimeMin + 15} min</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Horario</Text>
                  <Text style={styles.statVal}>{s.openingHours}</Text>
                </View>
              </View>

              {/* Features Pill */}
              <View style={styles.tagsRow}>
                {s.tags.map((tag, idx) => (
                  <View key={idx} style={styles.featurePill}>
                    <Text style={styles.featurePillText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Products in this sanctuary */}
              <View style={styles.storeProductsSection}>
                <Text style={styles.storeProductsTitle}>Fórmulas disponibles hoy:</Text>
                {s.products?.slice(0, 3).map((prod) => (
                  <View key={prod.id} style={styles.productRow}>
                    <Text style={{ fontSize: 16 }}>{prod.emoji}</Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <Text style={styles.productRowName}>{prod.name}</Text>
                      <Text style={styles.productRowDesc}>{prod.description}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addFormulaBtn}
                      onPress={() => addToCart(prod, s)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.addFormulaPrice}>${prod.price.toFixed(2)}</Text>
                      <Ionicons name="add" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.selectSedeBtn,
                  isSelected ? styles.selectSedeBtnActive : styles.selectSedeBtnNormal,
                ]}
                onPress={() => setActiveStoreId(s.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.selectSedeBtnText,
                    isSelected && styles.selectSedeBtnTextActive,
                  ]}
                >
                  {isSelected ? 'Comprar de esta sede' : 'Ver catálogo de sede'}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={isSelected ? '#FFFFFF' : AURA_THEME.colors.forestDark}
                />
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Sustainable packaging card */}
        <View style={styles.ecoBanner}>
          <MaterialCommunityIcons name="leaf" size={24} color={AURA_THEME.colors.forestDark} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ecoBannerTitle}>Empaque Botánico Sostenible</Text>
            <Text style={styles.ecoBannerDesc}>
              Todos los pedidos se entregan en cajas de lino reutilizable con ramillete de lavanda fresca y sello térmico de cera vegetal.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating cart bar */}
      {totalCartItemCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={onGoToCart}
          activeOpacity={0.9}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="bag-check" size={20} color="#FFFFFF" />
            <Text style={styles.floatingCartText}>
              Ver Canasta ({totalCartItemCount} productos)
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
  pickupModeToggle: {
    flexDirection: 'row',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderRadius: AURA_THEME.borderRadius.full,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
  },
  pickupBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: AURA_THEME.borderRadius.full,
  },
  pickupBtnActive: {
    backgroundColor: AURA_THEME.colors.forestDark,
  },
  pickupBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: AURA_THEME.colors.textSecondary,
  },
  pickupBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 16,
    gap: 10,
  },
  locationPinBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AURA_THEME.colors.sageBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  locationSub: {
    fontSize: 11,
    color: AURA_THEME.colors.textMuted,
  },
  filterPill: {
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: AURA_THEME.borderRadius.sm,
  },
  filterPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  sectionHeaderTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 12,
  },
  sanctuaryCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 16,
  },
  sanctuaryCardActive: {
    borderColor: AURA_THEME.colors.forestDark,
    backgroundColor: '#FAFDFB',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tierTag: {
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tierTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 0.8,
  },
  distanceBadge: {
    fontSize: 11.5,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
  sanctuaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 2,
  },
  sanctuaryAddress: {
    fontSize: 11.5,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderRadius: AURA_THEME.borderRadius.md,
    padding: 10,
    marginBottom: 12,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9.5,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 2,
  },
  statVal: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  featurePill: {
    backgroundColor: '#EEF5F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featurePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: AURA_THEME.colors.forestMedium,
  },
  storeProductsSection: {
    borderTopWidth: 1,
    borderTopColor: AURA_THEME.colors.borderLight,
    paddingTop: 12,
    marginBottom: 14,
  },
  storeProductsTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 8,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productRowName: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  productRowDesc: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  addFormulaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.forestDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AURA_THEME.borderRadius.sm,
    gap: 4,
  },
  addFormulaPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectSedeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: AURA_THEME.borderRadius.md,
    gap: 6,
  },
  selectSedeBtnActive: {
    backgroundColor: AURA_THEME.colors.forestDark,
  },
  selectSedeBtnNormal: {
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
  },
  selectSedeBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  selectSedeBtnTextActive: {
    color: '#FFFFFF',
  },
  ecoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4EC',
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 14,
    gap: 12,
    marginTop: 6,
  },
  ecoBannerTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 2,
  },
  ecoBannerDesc: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
    lineHeight: 15,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: AURA_THEME.colors.forestDark,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
