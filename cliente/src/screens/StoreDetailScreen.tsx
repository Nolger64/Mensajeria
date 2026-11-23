import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useClient } from '../context/ClientContext';
import type { PartnerStore } from '../types';
import { formatOrderAmount } from '../../../src/services/orderDisplay';
import { useOperationStyles } from '../../../src/theme/operationStyles';

interface StoreDetailScreenProps {
  store: PartnerStore;
  onBack: () => void;
  onGoToCart: () => void;
}

export function StoreDetailScreen({ store, onBack, onGoToCart }: StoreDetailScreenProps) {
  const styles = useOperationStyles();
  const { stores, addToCart, totalCartItemCount, cartStoreId } = useClient();
  const currentStore = stores.find((entry) => entry.id === store.id);
  const differentBranch = !!cartStoreId && cartStoreId !== store.id;
  const products = currentStore?.products?.filter((product) => product.available) ?? [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack}><Text style={styles.heading}>Volver a sedes</Text></TouchableOpacity>
      <Text style={styles.title}>{store.name}</Text>
      <Text style={styles.text}>{currentStore?.address ?? store.address}</Text>
      {differentBranch && <Text style={styles.text}>Tu carrito tiene productos de otra sede. Vacíalo para comprar en esta.</Text>}
      {products.length === 0 && <Text style={styles.text}>No hay productos disponibles.</Text>}
      {currentStore && products.map((product) => (
        <View key={product.id} style={styles.card}>
          <Text style={styles.heading}>{product.name}</Text>
          {!!product.description && <Text style={styles.text}>{product.description}</Text>}
          <Text style={styles.text}>{formatOrderAmount(product.price)}</Text>
          <TouchableOpacity style={[styles.button, differentBranch && { opacity: 0.5 }]} onPress={() => addToCart(product, currentStore)} disabled={differentBranch}
            accessibilityState={{ disabled: differentBranch }}>
            <Text style={styles.buttonText}>Agregar al carrito</Text>
          </TouchableOpacity>
        </View>
      ))}
      {totalCartItemCount > 0 && (
        <TouchableOpacity style={styles.button} onPress={onGoToCart}>
          <Text style={styles.buttonText}>Ver carrito ({totalCartItemCount})</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
