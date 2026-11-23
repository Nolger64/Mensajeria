import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useClient } from '../context/ClientContext';
import { formatOrderAmount } from '../../../src/services/orderDisplay';
import { AuraInput } from '../../../src/components/AuraInput';
import { useOperationStyles } from '../../../src/theme/operationStyles';

interface CartScreenProps {
  onOrderSuccess: () => void;
  onExploreMore: () => void;
}

export function CartScreen({ onOrderSuccess, onExploreMore }: CartScreenProps) {
  const styles = useOperationStyles();
  const {
    cart, cartSubtotal, updateQuantity, deliveryAddress, setDeliveryAddress, deliveryNotes,
    setDeliveryNotes, placeStoreOrder, clearCart,
  } = useClient();
  const [tip, setTip] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const deliveryFee = 5500;

  const checkout = async () => {
    if (saving) return;
    if (!deliveryAddress.trim()) {
      setError('Ingresa la dirección de entrega.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (await placeStoreOrder(tip)) onOrderSuccess();
      else setError('No se pudo confirmar el pedido. Revisa los productos disponibles.');
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Carrito</Text>
      {cart.length === 0 ? (
        <>
          <Text style={styles.text}>Tu carrito está vacío.</Text>
          <TouchableOpacity style={styles.button} onPress={onExploreMore}>
            <Text style={styles.buttonText}>Ver sedes</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity onPress={clearCart} accessibilityRole="button" disabled={saving}>
            <Text style={styles.heading}>Vaciar carrito</Text>
          </TouchableOpacity>
          {cart.map(({ product, quantity }) => (
            <View key={product.id} style={styles.card}>
              <Text style={styles.heading}>{product.name}</Text>
              <Text style={styles.text}>{quantity} × {formatOrderAmount(product.price)}</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={styles.button} accessibilityLabel={`Quitar una unidad de ${product.name}`} onPress={() => updateQuantity(product.id, -1)} disabled={saving}>
                  <Text style={styles.buttonText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} accessibilityLabel={`Agregar una unidad de ${product.name}`} onPress={() => updateQuantity(product.id, 1)} disabled={saving}>
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={styles.card}>
            <Text style={styles.heading}>Dirección de entrega</Text>
            <AuraInput accessibilityLabel="Dirección de entrega" value={deliveryAddress} onChangeText={setDeliveryAddress} />
            <Text style={styles.text}>Instrucciones (opcional)</Text>
            <AuraInput accessibilityLabel="Instrucciones de entrega" value={deliveryNotes} onChangeText={setDeliveryNotes} />
          </View>
          <View style={styles.card}>
            <Text style={styles.heading}>Resumen</Text>
            <Text style={styles.text}>Productos · {formatOrderAmount(cartSubtotal)}</Text>
            <Text style={styles.text}>Envío · {formatOrderAmount(deliveryFee)}</Text>
            <Text style={styles.text}>Propina (opcional)</Text>
            <AuraInput

              accessibilityLabel="Propina"
              keyboardType="number-pad"
              value={String(tip)}
              onChangeText={(value) => setTip(Number(value.replace(/[^0-9]/g, '')))}
              maxLength={7}
            />
            <Text style={styles.heading}>Total · {formatOrderAmount(cartSubtotal + deliveryFee + tip)}</Text>
            <Text style={styles.text}>Pago en efectivo contraentrega</Text>
          </View>
          {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
          <TouchableOpacity style={styles.button} onPress={checkout} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Confirmando…' : 'Confirmar pedido'}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
