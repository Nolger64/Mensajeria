import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PartnerStore } from '../types';

interface StoreCardProps {
  store: PartnerStore;
  onPress: () => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onPress }) => {
  const isTurbo = store.category === 'turbo';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Banner / Header Bar */}
      <View style={[styles.banner, { backgroundColor: store.bannerColor || '#222834' }]}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>{store.logo || '🏪'}</Text>
        </View>

        <View style={styles.badgeRow}>
          {isTurbo && (
            <View style={styles.turboTag}>
              <Text style={styles.turboText}>⚡ 10 MIN</Text>
            </View>
          )}

          {store.partnerTier === 'diamond' && (
            <View style={styles.diamondTag}>
              <Text style={styles.diamondText}>💎 Diamante</Text>
            </View>
          )}

          {store.hasBonus && (
            <View style={styles.bonusTag}>
              <Text style={styles.bonusText}>+{store.bonusAmount.toLocaleString('es-CO')} Bono</Text>
            </View>
          )}
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.storeName} numberOfLines={1}>
            {store.name}
          </Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color="#FFB300" />
            <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.addressText} numberOfLines={1}>
          {store.address}
        </Text>

        {/* Info Badges */}
        <View style={styles.infoRow}>
          <View style={styles.infoPill}>
            <Ionicons name="time-outline" size={13} color="#8C96A5" />
            <Text style={styles.infoText}>{store.averagePrepTimeMin} - {store.averagePrepTimeMin + 10} min</Text>
          </View>
          <View style={styles.infoPill}>
            <Ionicons name="navigate-outline" size={13} color="#8C96A5" />
            <Text style={styles.infoText}>{store.distanceKm} km</Text>
          </View>
          <View style={styles.infoPill}>
            <Ionicons name="cube-outline" size={13} color="#8C96A5" />
            <Text style={styles.infoText}>{(store.products || []).length} productos</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#181C24',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#262D3B',
  },
  banner: {
    height: 70,
    paddingHorizontal: 14,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#181C24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoEmoji: {
    fontSize: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  turboTag: {
    backgroundColor: '#FF441F',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  turboText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  diamondTag: {
    backgroundColor: 'rgba(0, 229, 255, 0.25)',
    borderColor: '#00E5FF',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diamondText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00E5FF',
  },
  bonusTag: {
    backgroundColor: '#00C853',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bonusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  content: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252B37',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFB300',
  },
  addressText: {
    fontSize: 12,
    color: '#8C96A5',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202632',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  infoText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '500',
  },
});
