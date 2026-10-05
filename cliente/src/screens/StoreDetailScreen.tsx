import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PartnerStore } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useClient } from '../context/ClientContext';

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
  const { totalCartItemCount, cartSubtotal, cartStoreId } = useClient();

  const products = store.products || [];
  const isThisStoreCart = cartStoreId === store.id && totalCartItemCount > 0;

  return (
    <View style={styles.container}>
      {/* Top Bar with Back Button */}
      <View style={[styles.headerBanner, { backgroundColor: store.bannerColor || '#1E232E' }]}>
        <View style={styles.headerNav}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.storeTierBadge}>
            <Text style={styles.storeTierText}>
              {store.partnerTier === 'diamond' ? '💎 Diamante' : '🥇 Oficial'}
            </Text>
          </View>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.logoBox}>
            <Text style={{ fontSize: 32 }}>{store.logo || '🏪'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {store.name}
            </Text>
            <Text style={styles.headerCategory}>
              {store.category.toUpperCase()} • {store.openingHours}
            </Text>
          </View>
        </View>
      </View>

      {/* Store Quick Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={14} color="#FFB300" />
          <Text style={styles.statBold}>{store.rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>({store.reviewCount})</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={14} color="#8C96A5" />
          <Text style={styles.statBold}>{store.averagePrepTimeMin} min</Text>
          <Text style={styles.statLabel}>Preparación</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="bicycle-outline" size={14} color="#00E676" />
          <Text style={styles.statBold}>{store.distanceKm} km</Text>
          <Text style={styles.statLabel}>Distancia</Text>
        </View>
      </View>

      {/* Bonus Callout if exists */}
      {store.hasBonus && (
        <View style={styles.bonusBanner}>
          <Text style={{ fontSize: 16 }}>🎁</Text>
          <Text style={styles.bonusBannerText}>
            {store.bonusDescription || `Convenio prioritario: +$${store.bonusAmount.toLocaleString('es-CO')} bono`}
          </Text>
        </View>
      )}

      {/* Product List */}
      <ScrollView style={styles.productList} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Menú y Productos Destacados</Text>
          <Text style={styles.productCountBadge}>{products.length} ítems</Text>
        </View>

        {products.map((product) => (
          <ProductCard key={product.id} product={product} store={store} />
        ))}

        {products.length === 0 && (
          <View style={styles.emptyProducts}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📦</Text>
            <Text style={styles.emptyTitle}>Catálogo en actualización</Text>
            <Text style={styles.emptySub}>
              Pronto podrás ordenar productos directos de esta tienda.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      {isThisStoreCart && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={onGoToCart}
          activeOpacity={0.9}
        >
          <View style={styles.cartLeft}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalCartItemCount}</Text>
            </View>
            <Text style={styles.cartBtnText}>Ver Canasta</Text>
          </View>
          <View style={styles.cartRight}>
            <Text style={styles.cartTotalText}>
              ${cartSubtotal.toLocaleString('es-CO')} COP
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1014',
  },
  headerBanner: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeTierBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  storeTierText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#181C24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  headerCategory: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#161A22',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222834',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statBold: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  statLabel: {
    color: '#8C96A5',
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#282E3C',
  },
  bonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16281E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E432A',
    gap: 8,
  },
  bonusBannerText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '600',
  },
  productList: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  productCountBadge: {
    fontSize: 11,
    color: '#8C96A5',
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  emptySub: {
    fontSize: 12,
    color: '#8C96A5',
    textAlign: 'center',
    marginTop: 4,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#FF441F',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#FF441F',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartBadge: {
    backgroundColor: '#FFF',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FF441F',
    fontWeight: '800',
    fontSize: 12,
  },
  cartBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  cartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartTotalText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
