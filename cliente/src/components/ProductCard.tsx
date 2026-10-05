import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, PartnerStore } from '../types';
import { useClient } from '../context/ClientContext';

interface ProductCardProps {
  product: Product;
  store: PartnerStore;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, store }) => {
  const { cart, addToCart, updateQuantity } = useClient();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <View style={styles.card}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{product.emoji || '🍽️'}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>
        <Text style={styles.price}>
          ${product.price.toLocaleString('es-CO')} COP
        </Text>
      </View>

      <View style={styles.actionContainer}>
        {quantityInCart === 0 ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addToCart(product, store)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={16} color="#FFF" />
            <Text style={styles.addBtnText}>Agregar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => updateQuantity(product.id, -1)}
            >
              <Ionicons name="remove" size={14} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.counterText}>{quantityInCart}</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => updateQuantity(product.id, 1)}
            >
              <Ionicons name="add" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#181C24',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#262D3B',
  },
  emojiContainer: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#202633',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 28,
  },
  details: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    color: '#8C96A5',
    marginBottom: 6,
    lineHeight: 15,
  },
  price: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00E676',
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF441F',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232A37',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#FF441F',
  },
  counterBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#FF441F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
    paddingHorizontal: 8,
  },
});
