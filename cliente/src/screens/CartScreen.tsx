import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClient } from '../context/ClientContext';

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
    cartStoreName,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    deliveryAddress,
    setDeliveryAddress,
    deliveryNotes,
    setDeliveryNotes,
    placeStoreOrder,
  } = useClient();

  const [selectedTip, setSelectedTip] = useState<number>(3000);
  const [paymentMethod, setPaymentMethod] = useState<'Tarjeta (Pagado)' | 'Efectivo contraentrega'>('Tarjeta (Pagado)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee = 5500;
  const grandTotal = cartSubtotal + deliveryFee + selectedTip;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Canasta vacía', 'Agrega productos de una tienda para continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await placeStoreOrder(selectedTip, paymentMethod);
      if (order) {
        Alert.alert(
          '🎉 ¡Pedido Recibido con Éxito!',
          `Tu pedido ${order.orderCode} en ${order.store.name} fue enviado a la red. El domiciliario se dirigirá a la tienda para recogerlo.`,
          [{ text: 'Ver Seguimiento', onPress: onOrderSuccess }]
        );
      }
    } catch {
      Alert.alert('Error', 'No pudimos procesar tu pedido. Verifica tu conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="cart-outline" size={48} color="#FF441F" />
        </View>
        <Text style={styles.emptyTitle}>Tu canasta está vacía</Text>
        <Text style={styles.emptySub}>
          Explora los restaurantes, supermercados y tiendas aliadas para agregar tus productos favoritos.
        </Text>
        <TouchableOpacity style={styles.exploreBtn} onPress={onExploreMore}>
          <Text style={styles.exploreBtnText}>Explorar Tiendas</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Store Title Bar */}
        <View style={styles.storeHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.storeLabel}>Pedido en</Text>
            <Text style={styles.storeName}>{cartStoreName}</Text>
          </View>
          <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Vaciar</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items List */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionHeader}>Productos en tu canasta</Text>
          {cart.map((item) => (
            <View key={item.product.id} style={styles.itemRow}>
              <View style={styles.itemEmoji}>
                <Text style={{ fontSize: 24 }}>{item.product.emoji || '🍽️'}</Text>
              </View>

              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemUnitPrice}>
                  ${item.product.price.toLocaleString('es-CO')} c/u
                </Text>
              </View>

              {/* Quantity Controls */}
              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.product.id, -1)}
                >
                  <Ionicons name="remove" size={14} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.qtyNumber}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.product.id, 1)}
                >
                  <Ionicons name="add" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.itemTotal}>
                ${(item.product.price * item.quantity).toLocaleString('es-CO')}
              </Text>

              <TouchableOpacity
                onPress={() => removeFromCart(item.product.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={16} color="#E53935" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Delivery Address & Notes */}
        <View style={styles.sectionCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="location-sharp" size={18} color="#FF441F" />
            <Text style={styles.cardTitle}>Dirección de entrega</Text>
          </View>
          <TextInput
            style={styles.input}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholder="Dirección completa"
            placeholderTextColor="#687385"
          />

          <Text style={[styles.cardTitle, { marginTop: 10, marginBottom: 4, fontSize: 12 }]}>
            Indicaciones para el domiciliario:
          </Text>
          <TextInput
            style={styles.input}
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
            placeholder="Ej: Apto 502, timbrar al citófono"
            placeholderTextColor="#687385"
          />
        </View>

        {/* Driver Tip */}
        <View style={styles.sectionCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="heart" size={18} color="#FF4081" />
            <Text style={styles.cardTitle}>Propina para el domiciliario</Text>
          </View>
          <View style={styles.tipRow}>
            {[0, 2000, 3000, 5000, 8000].map((tip) => (
              <TouchableOpacity
                key={tip}
                style={[styles.tipBtn, selectedTip === tip && styles.tipBtnActive]}
                onPress={() => setSelectedTip(tip)}
              >
                <Text
                  style={[
                    styles.tipBtnText,
                    selectedTip === tip && styles.tipBtnTextActive,
                  ]}
                >
                  {tip === 0 ? '$0' : `+$${(tip / 1000).toFixed(0)}k`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.sectionCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="wallet-outline" size={18} color="#4FC3F7" />
            <Text style={styles.cardTitle}>Método de Pago</Text>
          </View>
          <View style={styles.paymentRow}>
            <TouchableOpacity
              style={[
                styles.paymentBtn,
                paymentMethod === 'Tarjeta (Pagado)' && styles.paymentBtnActive,
              ]}
              onPress={() => setPaymentMethod('Tarjeta (Pagado)')}
            >
              <Ionicons
                name="card"
                size={18}
                color={paymentMethod === 'Tarjeta (Pagado)' ? '#00E676' : '#8C96A5'}
              />
              <Text
                style={[
                  styles.paymentBtnText,
                  paymentMethod === 'Tarjeta (Pagado)' && styles.paymentBtnTextActive,
                ]}
              >
                Tarjeta (Pagado)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentBtn,
                paymentMethod === 'Efectivo contraentrega' && styles.paymentBtnActive,
              ]}
              onPress={() => setPaymentMethod('Efectivo contraentrega')}
            >
              <Ionicons
                name="cash"
                size={18}
                color={paymentMethod === 'Efectivo contraentrega' ? '#00E676' : '#8C96A5'}
              />
              <Text
                style={[
                  styles.paymentBtnText,
                  paymentMethod === 'Efectivo contraentrega' && styles.paymentBtnTextActive,
                ]}
              >
                Efectivo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal de productos</Text>
            <Text style={styles.summaryVal}>
              ${cartSubtotal.toLocaleString('es-CO')} COP
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Costo de envío estándar</Text>
            <Text style={styles.summaryVal}>
              ${deliveryFee.toLocaleString('es-CO')} COP
            </Text>
          </View>
          {selectedTip > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Propina voluntaria</Text>
              <Text style={styles.summaryVal}>
                ${selectedTip.toLocaleString('es-CO')} COP
              </Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalVal}>
              ${grandTotal.toLocaleString('es-CO')} COP
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={handleCheckout}
          disabled={isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <View style={styles.checkoutBtnRow}>
              <Text style={styles.checkoutBtnText}>Confirmar y Pedir Domicilio</Text>
              <Text style={styles.checkoutBtnPrice}>
                ${grandTotal.toLocaleString('es-CO')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
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
    paddingBottom: 20,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181C24',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#262D3B',
  },
  storeLabel: {
    fontSize: 11,
    color: '#8C96A5',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 2,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#262E3B',
    borderRadius: 8,
  },
  clearBtnText: {
    color: '#E53935',
    fontSize: 11,
    fontWeight: '700',
  },
  itemsSection: {
    backgroundColor: '#181C24',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262D3B',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#202633',
  },
  itemEmoji: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#202633',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  itemUnitPrice: {
    fontSize: 11,
    color: '#8C96A5',
    marginTop: 2,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222834',
    borderRadius: 8,
    padding: 2,
    marginRight: 10,
  },
  qtyBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#FF441F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
    paddingHorizontal: 6,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00E676',
    marginRight: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  sectionCard: {
    backgroundColor: '#181C24',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262D3B',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  input: {
    backgroundColor: '#101319',
    borderRadius: 10,
    padding: 11,
    color: '#FFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#2D3545',
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipBtn: {
    flex: 1,
    backgroundColor: '#202633',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2B3344',
  },
  tipBtnActive: {
    backgroundColor: 'rgba(255, 68, 31, 0.2)',
    borderColor: '#FF441F',
  },
  tipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C96A5',
  },
  tipBtnTextActive: {
    color: '#FF441F',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E232E',
    paddingVertical: 11,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A3241',
  },
  paymentBtnActive: {
    borderColor: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
  },
  paymentBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8C96A5',
  },
  paymentBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#151921',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222834',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8C96A5',
  },
  summaryVal: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#262D3C',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00E676',
  },
  footer: {
    backgroundColor: '#12151B',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#222834',
  },
  checkoutBtn: {
    backgroundColor: '#FF441F',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#FF441F',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  checkoutBtnPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0E1014',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 68, 31, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: '#8C96A5',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: '#FF441F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
