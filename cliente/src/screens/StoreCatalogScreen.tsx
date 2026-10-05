import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClient } from '../context/ClientContext';
import { Header } from '../components/Header';
import { CategoryPills } from '../components/CategoryPills';
import { StoreCard } from '../components/StoreCard';
import { PartnerStore } from '../types';

interface StoreCatalogScreenProps {
  onSelectStore: (store: PartnerStore) => void;
  onGoToExpress: () => void;
  onGoToCart: () => void;
}

export const StoreCatalogScreen: React.FC<StoreCatalogScreenProps> = ({
  onSelectStore,
  onGoToExpress,
  onGoToCart,
}) => {
  const {
    stores,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    totalCartItemCount,
    cartSubtotal,
    cartStoreName,
  } = useClient();

  const filteredStores = stores.filter((store) => {
    // Category match
    const categoryMatches =
      selectedCategory === 'todos' || store.category === selectedCategory;

    // Search query match
    if (!searchQuery.trim()) return categoryMatches;

    const query = searchQuery.toLowerCase();
    const nameMatches = store.name.toLowerCase().includes(query);
    const tagMatches = store.tags.some((t) => t.toLowerCase().includes(query));
    const productMatches = store.products?.some((p) =>
      p.name.toLowerCase().includes(query)
    );

    return categoryMatches && (nameMatches || tagMatches || productMatches);
  });

  return (
    <View style={styles.container}>
      <Header onSearchChange={setSearchQuery} />
      <CategoryPills />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Express Delivery Banner */}
        <TouchableOpacity
          style={styles.expressBanner}
          onPress={onGoToExpress}
          activeOpacity={0.88}
        >
          <View style={styles.expressIconBox}>
            <Text style={{ fontSize: 26 }}>🛵</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.expressTitle}>¿Necesitas un Domicilio Express?</Text>
              <View style={styles.flashBadge}>
                <Text style={styles.flashText}>MANDADOS</Text>
              </View>
            </View>
            <Text style={styles.expressSub}>
              Enviamos llaves, paquetes o compramos lo que necesites en cualquier lugar.
            </Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={26} color="#FF6F00" />
        </TouchableOpacity>

        {/* Promo Bar */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoIcon}>⚡</Text>
          <Text style={styles.promoText}>
            <Text style={{ fontWeight: '800', color: '#FFD54F' }}>FHS Turbo 10m: </Text>
            Tus antojos y despensas en la puerta de tu casa en menos de 10 minutos.
          </Text>
        </View>

        {/* Store Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'todos'
              ? 'Tiendas y Restaurantes Afiliados'
              : `Categoría: ${selectedCategory.toUpperCase()}`}
          </Text>
          <Text style={styles.storeCount}>({filteredStores.length} disponibles)</Text>
        </View>

        {/* Store Cards */}
        {filteredStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onPress={() => onSelectStore(store)}
          />
        ))}

        {filteredStores.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
            <Text style={styles.emptyTitle}>No encontramos tiendas</Text>
            <Text style={styles.emptySub}>
              Intenta buscar por otro término o selecciona otra categoría arriba.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Cart Button if items exist */}
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
              <Text style={styles.floatingCartStore}>{cartStoreName}</Text>
              <Text style={styles.floatingCartSub}>Ver canasta de compra</Text>
            </View>
          </View>
          <View style={styles.floatingCartRight}>
            <Text style={styles.floatingCartPrice}>
              ${cartSubtotal.toLocaleString('es-CO')}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#FFF" />
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  expressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1812',
    borderWidth: 1.5,
    borderColor: '#FF6F00',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  expressIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 111, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  flashBadge: {
    backgroundColor: '#FF6F00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flashText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
  },
  expressSub: {
    fontSize: 11,
    color: '#B0BEC5',
    marginTop: 2,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A211D',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  promoIcon: {
    fontSize: 18,
  },
  promoText: {
    flex: 1,
    fontSize: 11,
    color: '#A5D6A7',
    lineHeight: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  storeCount: {
    fontSize: 12,
    color: '#8C96A5',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#8C96A5',
    textAlign: 'center',
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
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartCountCircle: {
    backgroundColor: '#FFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    color: '#FF441F',
    fontWeight: '800',
    fontSize: 13,
  },
  floatingCartStore: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  floatingCartSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  floatingCartPrice: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
