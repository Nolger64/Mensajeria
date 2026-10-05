import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { StoreCategory } from '../types';
import { useClient } from '../context/ClientContext';

export const CategoryPills: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = useClient();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, isSelected && styles.pillActive]}
              onPress={() => setSelectedCategory(cat.id as StoreCategory)}
              activeOpacity={0.8}
            >
              <Text style={styles.pillIcon}>{cat.icon}</Text>
              <Text style={[styles.pillLabel, isSelected && styles.pillLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#12151B',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E232E',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F28',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262E3B',
  },
  pillActive: {
    backgroundColor: '#FF441F',
    borderColor: '#FF441F',
  },
  pillIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8C96A5',
  },
  pillLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
