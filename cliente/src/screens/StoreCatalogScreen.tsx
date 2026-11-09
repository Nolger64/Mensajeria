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
import { PartnerStore, Product } from '../types';
import { AURA_THEME } from '../../../src/theme/auraTheme';

interface StoreCatalogScreenProps {
  onSelectStore: (store: PartnerStore) => void;
  onGoToExpress: () => void;
  onGoToCart: () => void;
}

const WELLNESS_CATEGORIES = [
  { id: 'aceites', name: 'Aceites Esenciales', icon: 'water-outline', count: '6 RITUALES' },
  { id: 'facial', name: 'Cuidado Facial', icon: 'sparkles-outline', count: '4 FÓRMULAS' },
  { id: 'sales', name: 'Sales & Baño', icon: 'cube-outline', count: '5 MEZCLAS' },
  { id: 'velas', name: 'Velas & Aromas', icon: 'flame-outline', count: '8 AROMAS' },
  { id: 'kits', name: 'Kits de Regalo', icon: 'gift-outline', count: '3 COFRES' },
];

export const StoreCatalogScreen: React.FC<StoreCatalogScreenProps> = ({
  onSelectStore,
  onGoToExpress,
  onGoToCart,
}) => {
  const {
    stores,
    searchQuery,
    setSearchQuery,
    addToCart,
    totalCartItemCount,
    cartSubtotal,
  } = useClient();

  const [deliveryMode, setDeliveryMode] = useState<'domicilio' | 'recoger'>('domicilio');
  const [selectedCategory, setSelectedCategory] = useState<string>('aceites');

  const mainStore = stores[0];

  const recommendedProducts = [
    {
      id: 'rec-1',
      name: 'Aceite Lavanda & Cedro Silvestre',
      storeName: 'Zona Rosa',
      format: 'Gotero 30ml • 100% Orgánico',
      price: 34.0,
      rating: 4.9,
      emoji: '🌿',
    },
    {
      id: 'rec-2',
      name: 'Bruma Facial con Rosa Mosqueta',
      storeName: 'Zona Rosa',
      format: 'Spray 120ml • Hidratante',
      price: 28.5,
      rating: 4.9,
      emoji: '🌸',
    },
    {
      id: 'rec-3',
      name: 'Vela de Soya y Bergamota',
      storeName: 'Providencia',
      format: '240g • 50 hrs de combustión',
      price: 38.0,
      rating: 4.9,
      emoji: '🕯️',
    },
    {
      id: 'rec-4',
      name: 'Exfoliante Sales del Mar Muerto',
      storeName: 'Zona Rosa',
      format: 'Frasco 450g • Detox corporal',
      price: 32.0,
      rating: 4.9,
      emoji: '🧂',
    },
  ];

  const handleQuickAdd = (p: typeof recommendedProducts[0]) => {
    const prod: Product = {
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.format,
      emoji: p.emoji,
      available: true,
    };
    addToCart(prod, mainStore);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery / Pick-up mode selector */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeBtn, deliveryMode === 'domicilio' && styles.modeBtnActive]}
            onPress={() => setDeliveryMode('domicilio')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="bicycle-outline"
              size={15}
              color={deliveryMode === 'domicilio' ? '#FFFFFF' : AURA_THEME.colors.textSecondary}
            />
            <Text style={[styles.modeBtnText, deliveryMode === 'domicilio' && styles.modeBtnTextActive]}>
              A Domicilio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, deliveryMode === 'recoger' && styles.modeBtnActive]}
            onPress={() => setDeliveryMode('recoger')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="business-outline"
              size={15}
              color={deliveryMode === 'recoger' ? '#FFFFFF' : AURA_THEME.colors.textSecondary}
            />
            <Text style={[styles.modeBtnText, deliveryMode === 'recoger' && styles.modeBtnTextActive]}>
              Recoger en Spa
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={AURA_THEME.colors.forestMedium} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar esencias, aceites, velas, sales..."
            placeholderTextColor={AURA_THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={AURA_THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorías de Bienestar</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {WELLNESS_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.catIconCircle, isSelected && styles.catIconCircleSelected]}>
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={isSelected ? '#FFFFFF' : AURA_THEME.colors.forestDark}
                  />
                </View>
                <Text style={[styles.catTitle, isSelected && styles.catTitleSelected]} numberOfLines={2}>
                  {cat.name}
                </Text>
                <Text style={styles.catCount}>{cat.count}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Benefit Exclusive Banner */}
        <View style={styles.benefitCard}>
          <View style={styles.benefitBadge}>
            <Text style={styles.benefitBadgeText}>BENEFICIO EXCLUSIVO</Text>
          </View>
          <Text style={styles.benefitTitle}>Ritual de Relajación Nocturna</Text>
          <Text style={styles.benefitDesc}>
            20% OFF en tu primera compra express. Incluye bruma de almohada botánica de regalo.
          </Text>

          <View style={styles.benefitFooter}>
            <View style={styles.codePill}>
              <Text style={styles.codeLabel}>Código:</Text>
              <Text style={styles.codeText}>AURAEXPRESS</Text>
            </View>

            <TouchableOpacity style={styles.benefitBtn} onPress={onGoToExpress} activeOpacity={0.85}>
              <Text style={styles.benefitBtnText}>Comprar Ritual</Text>
              <Ionicons name="sparkles" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended Products Grid */}
        <View style={styles.sectionHeaderBetween}>
          <View>
            <Text style={styles.sectionTitle}>Recomendados para ti</Text>
            <Text style={styles.sectionSubtitle}>
              Elaborados con botánicos puros y cosechas sostenibles
            </Text>
          </View>
          <TouchableOpacity onPress={() => onSelectStore(mainStore)}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {recommendedProducts.map((p) => (
            <View key={p.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color={AURA_THEME.colors.star} />
                  <Text style={styles.ratingText}>{p.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.storeMiniText}>{p.storeName}</Text>
              </View>

              <View style={styles.productIconBox}>
                <Text style={{ fontSize: 32 }}>{p.emoji}</Text>
              </View>

              <Text style={styles.productName} numberOfLines={2}>
                {p.name}
              </Text>
              <Text style={styles.productFormat} numberOfLines={1}>
                {p.format}
              </Text>

              <View style={styles.productFooter}>
                <View>
                  <Text style={styles.priceLabel}>PRECIO</Text>
                  <Text style={styles.priceValue}>${p.price.toFixed(2)} MXN</Text>
                </View>

                <TouchableOpacity
                  style={styles.addSmallBtn}
                  onPress={() => handleQuickAdd(p)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Nearby Sanctuaries with Immediate Stock */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sedes Cercanas con Stock Inmediato</Text>
          <Text style={styles.sectionSubtitle}>
            Recoge o recibe sin demoras de almacén central
          </Text>
        </View>

        {stores.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={styles.sanctuaryCard}
            onPress={() => onSelectStore(store)}
            activeOpacity={0.85}
          >
            <View style={styles.sanctuaryIconBox}>
              <Text style={{ fontSize: 22 }}>{store.logo}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.sanctuaryTopRow}>
                <Text style={styles.sanctuaryName}>{store.name}</Text>
                <View style={styles.openBadge}>
                  <Text style={styles.openBadgeText}>ABIERTO</Text>
                </View>
              </View>
              <Text style={styles.sanctuaryMeta}>
                {store.distanceKm} km • Envío ~{store.averagePrepTimeMin + 15} min • {store.openingHours}
              </Text>
              <Text style={styles.sanctuaryAddress} numberOfLines={1}>
                {store.address}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={AURA_THEME.colors.forestMedium} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating cart bar */}
      {totalCartItemCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={onGoToCart}
          activeOpacity={0.9}
        >
          <View style={styles.floatingCartLeft}>
            <View style={styles.cartCountCircle}>
              <Text style={styles.cartCountText}>{totalCartItemCount}</Text>
            </View>
            <View>
              <Text style={styles.floatingCartTitle}>Canasta de Serenidad</Text>
              <Text style={styles.floatingCartSub}>Revisar y finalizar pedido express</Text>
            </View>
          </View>
          <View style={styles.floatingCartRight}>
            <Text style={styles.floatingCartPrice}>${cartSubtotal.toFixed(2)} MXN</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </View>
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
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderRadius: AURA_THEME.borderRadius.full,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: AURA_THEME.borderRadius.full,
  },
  modeBtnActive: {
    backgroundColor: AURA_THEME.colors.forestDark,
  },
  modeBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: AURA_THEME.colors.textSecondary,
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.md,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: AURA_THEME.colors.textPrimary,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: AURA_THEME.colors.textMuted,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
  categoriesScroll: {
    marginBottom: 18,
  },
  categoryCard: {
    width: 105,
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
  },
  categoryCardSelected: {
    borderColor: AURA_THEME.colors.forestDark,
    backgroundColor: '#FAFDFB',
  },
  catIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AURA_THEME.colors.sageBadge,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catIconCircleSelected: {
    backgroundColor: AURA_THEME.colors.forestDark,
  },
  catTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
    textAlign: 'center',
    marginBottom: 4,
    height: 28,
  },
  catTitleSelected: {
    color: AURA_THEME.colors.forestDark,
  },
  catCount: {
    fontSize: 9,
    fontWeight: '700',
    color: AURA_THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  benefitCard: {
    backgroundColor: '#F5EEE5',
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8DCCF',
    marginBottom: 20,
  },
  benefitBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5D6C5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: AURA_THEME.borderRadius.sm,
    marginBottom: 6,
  },
  benefitBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 0.8,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 12,
    color: '#675E4F',
    lineHeight: 16,
    marginBottom: 12,
  },
  benefitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  codeLabel: {
    fontSize: 11,
    color: '#675E4F',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 1,
  },
  benefitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AURA_THEME.colors.terracotta,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: AURA_THEME.borderRadius.md,
  },
  benefitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22,
  },
  productCard: {
    width: '48%',
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  storeMiniText: {
    fontSize: 10,
    color: AURA_THEME.colors.textMuted,
  },
  productIconBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  productName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 3,
    height: 34,
  },
  productFormat: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: AURA_THEME.colors.borderLight,
    paddingTop: 8,
  },
  priceLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: AURA_THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  addSmallBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AURA_THEME.colors.forestDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sanctuaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 10,
    gap: 12,
  },
  sanctuaryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AURA_THEME.colors.sageBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sanctuaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sanctuaryName: {
    fontSize: 13,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  openBadge: {
    backgroundColor: AURA_THEME.colors.statusGreenBg,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  openBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.statusGreen,
  },
  sanctuaryMeta: {
    fontSize: 11,
    color: AURA_THEME.colors.textSecondary,
    marginBottom: 2,
  },
  sanctuaryAddress: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: AURA_THEME.colors.forestDark,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartCountCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AURA_THEME.colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  floatingCartTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  floatingCartSub: {
    color: '#A3B8A8',
    fontSize: 10.5,
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  floatingCartPrice: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
