import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useClient } from '../context/ClientContext';
import { AURA_THEME } from '../../../src/theme/auraTheme';

interface CartScreenProps {
  onOrderSuccess: () => void;
  onExploreMore: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onOrderSuccess,
  onExploreMore,
}) => {
  const {
    cart,
    cartSubtotal,
    updateQuantity,
    clearCart,
    deliveryAddress,
    deliveryNotes,
    placeStoreOrder,
    addToCart,
    stores,
  } = useClient();

  const [selectedTip, setSelectedTip] = useState<number>(2.5);
  const [addedInfusion, setAddedInfusion] = useState(false);
  const [addedLinenBag, setAddedLinenBag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mainStore = stores[0];

  const handleAddComplement = (type: 'infusion' | 'bag') => {
    if (type === 'infusion') {
      if (!addedInfusion) {
        setAddedInfusion(true);
        addToCart(
          {
            id: 'p-comp-1',
            name: 'Infusión Herbal Relax (Melisa & Azahar)',
            price: 4.0,
            description: 'Toque botánico de bienvenida',
            emoji: '🍵',
            available: true,
          },
          mainStore
        );
      }
    } else {
      if (!addedLinenBag) {
        setAddedLinenBag(true);
        addToCart(
          {
            id: 'p-comp-2',
            name: 'Bolsa de Lino Biodegradable',
            price: 2.5,
            description: '100% fibra natural reutilizable',
            emoji: '👜',
            available: true,
          },
          mainStore
        );
      }
    }
  };

  const deliveryFee = 3.0;
  const totalToPay = cartSubtotal + deliveryFee + selectedTip;

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      await placeStoreOrder(selectedTip, 'Tarjeta (Pagado)');
      Alert.alert(
        '🌿 ¡Ritual Confirmado!',
        'Tu pedido #AUR-8921 ha sido asignado a Mateo Silva (Eco-Bike #08). Tu código PIN de seguridad es 4921.',
        [{ text: 'Ver Seguimiento', onPress: onOrderSuccess }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo conectar con la red de botica.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <MaterialCommunityIcons name="flower-tulip-outline" size={40} color={AURA_THEME.colors.forestDark} />
        </View>
        <Text style={styles.emptyTitle}>Tu Canasta de Serenidad está vacía</Text>
        <Text style={styles.emptySub}>
          Explora los santuarios botánicos y añade fórmulas artesanales para iniciar tu ritual a domicilio.
        </Text>
        <TouchableOpacity style={styles.exploreBtn} onPress={onExploreMore}>
          <Text style={styles.exploreBtnText}>Explorar Fórmulas</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Despacho de Cercanía Banner */}
        <View style={styles.cercaniaBanner}>
          <View style={styles.cercaniaIconBox}>
            <Ionicons name="bicycle" size={20} color={AURA_THEME.colors.forestDark} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.cercaniaTag}>DESPACHO DE CERCANÍA</Text>
              <Text style={styles.cercaniaSubTag}>Bicicleta Express</Text>
            </View>
            <Text style={styles.cercaniaStore}>Sede Jardines del Valle</Text>
            <Text style={styles.cercaniaDesc}>
              A 1.8 km de tu ubicación • Preparación artesanal en curso
            </Text>
          </View>
        </View>

        {/* Canasta header */}
        <View style={styles.basketHeader}>
          <Text style={styles.basketTitle}>
            Tu Canasta de Serenidad ({cart.reduce((acc, i) => acc + i.quantity, 0)} ítems)
          </Text>
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearBtnText}>Vaciar</Text>
          </TouchableOpacity>
        </View>

        {/* Items List */}
        <View style={styles.itemsCard}>
          {cart.map((item) => (
            <View key={item.product.id} style={styles.itemRow}>
              <View style={styles.itemEmojiBox}>
                <Text style={{ fontSize: 22 }}>{item.product.emoji || '🌿'}</Text>
              </View>

              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={styles.itemBadgeRow}>
                  <Text style={styles.itemBadge}>COSECHA BIO</Text>
                </View>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemFormat}>{item.product.description}</Text>
                <Text style={styles.itemPrice}>${item.product.price.toFixed(2)} MXN</Text>
              </View>

              {/* Quantity Controls */}
              <View style={styles.qtyContainer}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.product.id, -1)}
                >
                  <Ionicons name="remove" size={14} color={AURA_THEME.colors.forestDark} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.product.id, 1)}
                >
                  <Ionicons name="add" size={14} color={AURA_THEME.colors.forestDark} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Complements Section */}
        <View style={styles.complementsCard}>
          <View style={styles.complementsHeader}>
            <Text style={styles.complementsTag}>COMPLEMENTOS</Text>
            <Text style={styles.complementsTitle}>¿Deseas agregar un detalle de spa?</Text>
            <Text style={styles.complementsSub}>
              Pequeños toques botánicos para enriquecer tu entrega.
            </Text>
          </View>

          <View style={styles.complementsRow}>
            <View style={styles.complementBox}>
              <Text style={{ fontSize: 20, marginBottom: 4 }}>🍵</Text>
              <Text style={styles.complementName}>Infusión Herbal Relax</Text>
              <Text style={styles.complementDesc}>Melisa • Flor de Azahar</Text>
              <Text style={styles.complementPrice}>+$4.00 MXN</Text>
              <TouchableOpacity
                style={[styles.addComplementBtn, addedInfusion && styles.addComplementBtnAdded]}
                onPress={() => handleAddComplement('infusion')}
              >
                <Text style={[styles.addComplementText, addedInfusion && styles.addComplementTextAdded]}>
                  {addedInfusion ? 'Agregado' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.complementBox}>
              <Text style={{ fontSize: 20, marginBottom: 4 }}>👜</Text>
              <Text style={styles.complementName}>Bolsa de Lino</Text>
              <Text style={styles.complementDesc}>100% fibra natural</Text>
              <Text style={styles.complementPrice}>+$2.50 MXN</Text>
              <TouchableOpacity
                style={[styles.addComplementBtn, addedLinenBag && styles.addComplementBtnAdded]}
                onPress={() => handleAddComplement('bag')}
              >
                <Text style={[styles.addComplementText, addedLinenBag && styles.addComplementTextAdded]}>
                  {addedLinenBag ? 'Agregado' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Punto de Entrega */}
        <View style={styles.infoBlock}>
          <View style={styles.infoBlockHeader}>
            <Text style={styles.infoBlockLabel}>PUNTO DE ENTREGA</Text>
            <TouchableOpacity>
              <Text style={styles.editActionText}>Cambiar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.infoBlockTitle}>{deliveryAddress}</Text>
          <Text style={styles.infoBlockSub}>
            Instrucciones: {deliveryNotes} • Entrega sin contacto sanitizada con esencias
          </Text>
        </View>

        {/* Método de Pago */}
        <View style={styles.infoBlock}>
          <View style={styles.infoBlockHeader}>
            <Text style={styles.infoBlockLabel}>MÉTODO DE PAGO</Text>
            <TouchableOpacity>
              <Text style={styles.editActionText}>Editar</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="card-outline" size={18} color={AURA_THEME.colors.forestDark} />
            <Text style={styles.infoBlockTitle}>Visa •••• 4821</Text>
            <Text style={styles.cardExp}>Expira 09/27</Text>
          </View>
        </View>

        {/* Tip Selector */}
        <View style={styles.tipBlock}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipTitle}>Agradecimiento al Ciclista</Text>
            <Text style={styles.tipSub}>
              Tu repartidor viaja en bicicleta eléctrica para mantener cero emisiones.
            </Text>
          </View>

          <View style={styles.tipButtonsRow}>
            {[1.5, 2.5, 4.0].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[styles.tipBtn, selectedTip === amount && styles.tipBtnActive]}
                onPress={() => setSelectedTip(amount)}
              >
                <Text style={[styles.tipBtnText, selectedTip === amount && styles.tipBtnTextActive]}>
                  ${amount.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resumen de Cuenta */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeader}>Resumen de Cuenta</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal productos</Text>
            <Text style={styles.summaryVal}>${cartSubtotal.toFixed(2)} MXN</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío express e-bike</Text>
            <Text style={styles.summaryVal}>${deliveryFee.toFixed(2)} MXN</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Empaque de lino biodegradable</Text>
            <Text style={[styles.summaryVal, { color: AURA_THEME.colors.statusGreen }]}>GRATIS</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Propina seleccionada</Text>
            <Text style={styles.summaryVal}>${selectedTip.toFixed(2)} MXN</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total a Pagar</Text>
              <Text style={styles.totalSub}>Impuestos y tasas ecológicas incluidas</Text>
            </View>
            <Text style={styles.totalVal}>${totalToPay.toFixed(2)} MXN</Text>
          </View>
        </View>

        {/* Garantía de Frescura & Calma */}
        <View style={styles.guaranteeCard}>
          <Ionicons name="sparkles" size={16} color={AURA_THEME.colors.forestDark} />
          <Text style={styles.guaranteeText}>
            <Text style={{ fontWeight: '700' }}>Garantía de Frescura & Calma: </Text>
            Si tu pedido se retrasa más de 10 min, tu siguiente ritual incluye aromaterapia de cortesía.
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.checkoutBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={handleCheckout}
          disabled={isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.checkoutBtnContent}>
              <View>
                <Text style={styles.checkoutBtnTitle}>Confirmar Pedido Express</Text>
                <Text style={styles.checkoutBtnSub}>Llega en ~30 min</Text>
              </View>
              <Text style={styles.checkoutBtnPrice}>${totalToPay.toFixed(2)} MXN</Text>
            </View>
          )}
        </TouchableOpacity>
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
  emptyContainer: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AURA_THEME.colors.sageBadge,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: AURA_THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: AURA_THEME.colors.forestDark,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: AURA_THEME.borderRadius.md,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cercaniaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
    gap: 12,
  },
  cercaniaIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AURA_THEME.colors.sageBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cercaniaTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
    letterSpacing: 0.5,
  },
  cercaniaSubTag: {
    fontSize: 9.5,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
  cercaniaStore: {
    fontSize: 13,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  cercaniaDesc: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  basketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  basketTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
  itemsCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AURA_THEME.colors.borderLight,
  },
  itemEmojiBox: {
    width: 40,
    alignItems: 'center',
  },
  itemBadgeRow: {
    alignSelf: 'flex-start',
    backgroundColor: AURA_THEME.colors.sageBadge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 3,
  },
  itemBadge: {
    fontSize: 8.5,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  itemFormat: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
    borderRadius: AURA_THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
    padding: 2,
    gap: 8,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  complementsCard: {
    backgroundColor: '#F7FAF7',
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  complementsHeader: {
    marginBottom: 10,
  },
  complementsTag: {
    fontSize: 9,
    fontWeight: '800',
    color: AURA_THEME.colors.terracotta,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  complementsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 2,
  },
  complementsSub: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
  },
  complementsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  complementBox: {
    flex: 1,
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    alignItems: 'center',
  },
  complementName: {
    fontSize: 11,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
    textAlign: 'center',
  },
  complementDesc: {
    fontSize: 9.5,
    color: AURA_THEME.colors.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  complementPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 6,
  },
  addComplementBtn: {
    backgroundColor: AURA_THEME.colors.forestDark,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: AURA_THEME.borderRadius.sm,
  },
  addComplementBtnAdded: {
    backgroundColor: AURA_THEME.colors.sageBadge,
  },
  addComplementText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addComplementTextAdded: {
    color: AURA_THEME.colors.forestDark,
  },
  infoBlock: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 10,
  },
  infoBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoBlockLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AURA_THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  editActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: AURA_THEME.colors.terracotta,
  },
  infoBlockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  infoBlockSub: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
    marginTop: 2,
  },
  cardExp: {
    fontSize: 11,
    color: AURA_THEME.colors.textMuted,
  },
  tipBlock: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 14,
  },
  tipHeader: {
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  tipSub: {
    fontSize: 10.5,
    color: AURA_THEME.colors.textMuted,
    marginTop: 2,
  },
  tipButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: AURA_THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderMedium,
    backgroundColor: AURA_THEME.colors.surfaceSubtle,
  },
  tipBtnActive: {
    borderColor: AURA_THEME.colors.forestDark,
    backgroundColor: AURA_THEME.colors.forestDark,
  },
  tipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
  },
  tipBtnTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: AURA_THEME.colors.surface,
    borderRadius: AURA_THEME.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: AURA_THEME.colors.borderLight,
    marginBottom: 12,
  },
  summaryHeader: {
    fontSize: 13.5,
    fontWeight: '700',
    color: AURA_THEME.colors.forestDark,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: AURA_THEME.colors.textSecondary,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '600',
    color: AURA_THEME.colors.forestDark,
  },
  divider: {
    height: 1,
    backgroundColor: AURA_THEME.colors.borderLight,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  totalSub: {
    fontSize: 9.5,
    color: AURA_THEME.colors.textMuted,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: AURA_THEME.colors.forestDark,
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4EC',
    borderRadius: AURA_THEME.borderRadius.md,
    padding: 10,
    gap: 8,
    marginBottom: 16,
  },
  guaranteeText: {
    flex: 1,
    fontSize: 10.5,
    color: AURA_THEME.colors.forestDark,
    lineHeight: 14,
  },
  checkoutBtn: {
    backgroundColor: AURA_THEME.colors.terracotta,
    borderRadius: AURA_THEME.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: AURA_THEME.colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  checkoutBtnContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutBtnTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  checkoutBtnSub: {
    color: '#FFDBCF',
    fontSize: 10.5,
  },
  checkoutBtnPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
