import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DriverProfile } from '../types';

import { useApp } from '../context/AppContext';

interface OrdersHistoryScreenProps {
  driver?: DriverProfile;
}

export const OrdersHistoryScreen: React.FC<OrdersHistoryScreenProps> = ({ driver: propDriver }) => {
  const { driver: contextDriver } = useApp();
  const driver = propDriver || contextDriver;
  const formatCurrency = (val: number) => '$' + val.toLocaleString('es-CO');

  const history = [
    {
      id: 'ord-8491',
      code: '#FHS-8491',
      storeName: 'El Corral Burger Premium',
      storeLogo: '🍔',
      category: 'Restaurante',
      customerName: 'Mariana Duarte',
      time: 'Hace 25 min',
      distanceKm: 1.1,
      basePay: 8500,
      tip: 4500,
      bonus: 2500,
      total: 15500,
      status: 'Entregado a tiempo',
      rating: 5,
    },
    {
      id: 'ord-8472',
      code: '#FHS-8472',
      storeName: 'Carulla Fresh Market - Cl 85',
      storeLogo: '🛒',
      category: 'Supermercado',
      customerName: 'Andrés Felipe Castro',
      time: 'Hace 1h 10min',
      distanceKm: 1.8,
      basePay: 9200,
      tip: 6000,
      bonus: 3200,
      total: 18400,
      status: 'Entregado a tiempo',
      rating: 5,
    },
    {
      id: 'ord-8450',
      code: '#FHS-8450',
      storeName: 'Farmatodo 24H - Cra 15',
      storeLogo: '💊',
      category: 'Farmacia',
      customerName: 'Carolina Méndez',
      time: 'Hace 2h 05min',
      distanceKm: 0.9,
      basePay: 7000,
      tip: 3000,
      bonus: 2800,
      total: 12800,
      status: 'Entregado a tiempo',
      rating: 5,
    },
    {
      id: 'ord-8419',
      code: '#FHS-8419',
      storeName: 'FHS Turbo Dark Store (10 min)',
      storeLogo: '⚡',
      category: 'Turbo Express',
      customerName: 'David Henao',
      time: 'Hace 3h 15min',
      distanceKm: 0.6,
      basePay: 7500,
      tip: 2500,
      bonus: 4000,
      total: 14000,
      status: 'Entregado en 8 minutos',
      rating: 5,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Entregas</Text>
        <Text style={styles.subtitle}>Jornada de hoy • {driver.totalOrdersToday} órdenes completadas</Text>

        {/* Quick metrics banner */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatCurrency(driver.todayEarnings)}</Text>
            <Text style={styles.summaryLabel}>Ganado Hoy</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{driver.onTimeRate}%</Text>
            <Text style={styles.summaryLabel}>Puntualidad</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>Cancelaciones</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>Órdenes de hoy</Text>

        {history.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.storeInfoRow}>
                <View style={styles.storeEmojiBadge}>
                  <Text style={styles.storeEmoji}>{item.storeLogo}</Text>
                </View>
                <View>
                  <Text style={styles.storeName}>{item.storeName}</Text>
                  <Text style={styles.cardSubtext}>
                    {item.code} • {item.time}
                  </Text>
                </View>
              </View>

              <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.badgeRow}>
                <View style={styles.statusPill}>
                  <Ionicons name="checkmark-circle" size={14} color="#00C853" />
                  <Text style={styles.statusPillText}>{item.status}</Text>
                </View>

                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#FFB300" />
                  <Text style={styles.ratingText}>5.0</Text>
                </View>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownItem}>Base: {formatCurrency(item.basePay)}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.breakdownTip}>Propina: +{formatCurrency(item.tip)}</Text>
                {item.bonus > 0 && (
                  <>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.breakdownBonus}>Bono: +{formatCurrency(item.bonus)}</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1D20',
  },
  subtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
    marginBottom: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1A1D20',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#757575',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#616161',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storeEmojiBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF0ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeEmoji: {
    fontSize: 20,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1D20',
  },
  cardSubtext: {
    fontSize: 11,
    color: '#757575',
    marginTop: 1,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00C853',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusPillText: {
    fontSize: 11,
    color: '#00C853',
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F57F17',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownItem: {
    fontSize: 11,
    color: '#757575',
  },
  breakdownTip: {
    fontSize: 11,
    color: '#00C853',
    fontWeight: '700',
  },
  breakdownBonus: {
    fontSize: 11,
    color: '#FF441F',
    fontWeight: '700',
  },
  dot: {
    color: '#BDBDBD',
  },
});
