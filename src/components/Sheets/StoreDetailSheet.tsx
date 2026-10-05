import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PartnerStore } from '../../types';

interface StoreDetailSheetProps {
  store: PartnerStore | null;
  visible: boolean;
  onClose: () => void;
  onRequestOrderFromStore: (store: PartnerStore) => void;
}

export const StoreDetailSheet: React.FC<StoreDetailSheetProps> = ({
  store,
  visible,
  onClose,
  onRequestOrderFromStore,
}) => {
  if (!store) return null;

  const isDiamond = store.partnerTier === 'diamond';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.storeIconBox}>
              <Text style={styles.storeEmoji}>{store.logo}</Text>
            </View>
            <View style={styles.storeTitleArea}>
              <View style={styles.tierBadgeRow}>
                <View style={[styles.tierBadge, isDiamond ? styles.diamondBadge : styles.goldBadge]}>
                  <Ionicons name="ribbon" size={12} color="#FFFFFF" />
                  <Text style={styles.tierBadgeText}>
                    {isDiamond ? 'CONVENIO DIAMANTE' : 'CONVENIO OFICIAL'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color="#757575" />
                </TouchableOpacity>
              </View>
              <Text style={styles.storeName}>{store.name}</Text>
              <View style={styles.subInfoRow}>
                <Ionicons name="star" size={14} color="#FFB300" />
                <Text style={styles.ratingText}>{store.rating}</Text>
                <Text style={styles.reviewCountText}>({store.reviewCount} opiniones)</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.distanceText}>A {store.distanceKm} km</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Bonus Alert Banner if active */}
            {store.hasBonus && (
              <View style={styles.bonusBanner}>
                <Ionicons name="flame" size={20} color="#FF441F" />
                <View style={styles.bonusBannerTextCol}>
                  <Text style={styles.bonusBannerTitle}>¡Bonificación Especial Activa!</Text>
                  <Text style={styles.bonusBannerDesc}>{store.bonusDescription}</Text>
                </View>
              </View>
            )}

            {/* Quick Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Ionicons name="time-outline" size={22} color="#00C853" />
                <Text style={styles.metricValue}>{store.averagePrepTimeMin} min</Text>
                <Text style={styles.metricLabel}>Tiempo de empaque</Text>
              </View>

              <View style={styles.metricCard}>
                <MaterialCommunityIcons name="package-variant-closed" size={22} color="#2979FF" />
                <Text style={styles.metricValue}>{store.activeOrdersWaiting} listos</Text>
                <Text style={styles.metricLabel}>Esperando repartidor</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="storefront-outline" size={22} color="#FF9100" />
                <Text style={styles.metricValue}>Prioritario</Text>
                <Text style={styles.metricLabel}>Acceso sin fila</Text>
              </View>
            </View>

            {/* Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información del Aliado</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color="#FF441F" />
                <Text style={styles.infoText}>{store.address}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color="#757575" />
                <Text style={styles.infoText}>Horario: {store.openingHours}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color="#757575" />
                <Text style={styles.infoText}>Mostrador FHS: {store.phone}</Text>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {store.tags.map((tag, idx) => (
                <View key={idx} style={styles.tagBadge}>
                  <Text style={styles.tagText}>✓ {tag}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.requestOrderBtn}
              onPress={() => {
                onClose();
                onRequestOrderFromStore(store);
              }}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="moped" size={20} color="#FFFFFF" />
              <Text style={styles.requestOrderBtnText}>Aceptar Pedido de Esta Tienda</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
    gap: 14,
  },
  storeIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFF0ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF441F',
  },
  storeEmoji: {
    fontSize: 28,
  },
  storeTitleArea: {
    flex: 1,
  },
  tierBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  diamondBadge: {
    backgroundColor: '#00C853',
  },
  goldBadge: {
    backgroundColor: '#FF9100',
  },
  tierBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  closeBtn: {
    padding: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D20',
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  reviewCountText: {
    fontSize: 11,
    color: '#757575',
  },
  dot: {
    color: '#BDBDBD',
  },
  distanceText: {
    fontSize: 11,
    color: '#FF441F',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  bonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF441F',
  },
  bonusBannerTextCol: {
    flex: 1,
  },
  bonusBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D84315',
  },
  bonusBannerDesc: {
    fontSize: 11,
    color: '#5D4037',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1D20',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 9,
    color: '#757575',
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#424242',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#424242',
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tagBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  requestOrderBtn: {
    backgroundColor: '#FF441F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#FF441F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  requestOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
