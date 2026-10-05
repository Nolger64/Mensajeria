import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DriverProfile } from '../types';

import { useApp } from '../context/AppContext';

interface WalletScreenProps {
  driver?: DriverProfile;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ driver: propDriver }) => {
  const { driver: contextDriver } = useApp();
  const driver = propDriver || contextDriver;
  const [transferred, setTransferred] = useState(false);
  const formatCurrency = (val: number) => '$' + val.toLocaleString('es-CO');

  const handleWithdraw = () => {
    Alert.alert(
      'Transferencia Instantánea',
      `¿Deseas transferir ${formatCurrency(driver.balanceAvailable)} a tu cuenta Nequi inscrita (*4821)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Retiro',
          onPress: () => {
            setTransferred(true);
            Alert.alert('¡Transferencia en curso!', 'Tus fondos llegarán a tu cuenta Nequi en menos de 5 minutos.');
          },
        },
      ]
    );
  };

  const balance = transferred ? 0 : driver.balanceAvailable;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Billetera Soy FHS</Text>
        <Text style={styles.subtitle}>Ganancias y transferencias inmediatas</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Disponible para Retiro</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
          <Text style={styles.balanceSubtext}>Sin costo por retiro diario</Text>

          <TouchableOpacity
            style={[styles.withdrawButton, balance === 0 && styles.withdrawButtonDisabled]}
            onPress={handleWithdraw}
            disabled={balance === 0}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="bank-transfer" size={22} color="#FFFFFF" />
            <Text style={styles.withdrawButtonText}>Transferir a Nequi / Daviplata</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Quest / Incentive Progress */}
        <View style={styles.questCard}>
          <View style={styles.questHeader}>
            <View style={styles.questIconBox}>
              <Ionicons name="trophy" size={20} color="#FF441F" />
            </View>
            <View style={styles.questTitleCol}>
              <Text style={styles.questTitle}>Reto Semanal Diamante</Text>
              <Text style={styles.questSubtitle}>Completa 25 pedidos esta semana y gana +$60.000</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '70%' }]} />
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>18 de 25 entregas</Text>
              <Text style={styles.progressPercent}>72% completado</Text>
            </View>
          </View>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Desglose de Ganancias Hoy</Text>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.dot, { backgroundColor: '#2979FF' }]} />
              <Text style={styles.breakdownLabel}>Tarifas base por distancia</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatCurrency(driver.todayEarnings - driver.tipsToday - 18500)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.dot, { backgroundColor: '#00C853' }]} />
              <Text style={styles.breakdownLabel}>Propinas directas de clientes</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#00C853' }]}>
              +{formatCurrency(driver.tipsToday)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.dot, { backgroundColor: '#FF441F' }]} />
              <Text style={styles.breakdownLabel}>Bonos convenios y zonas de calor</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#FF441F' }]}>
              +$18.500
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Acumulado Hoy</Text>
            <Text style={styles.totalValue}>{formatCurrency(driver.todayEarnings)}</Text>
          </View>
        </View>

        {/* Payment accounts */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cuentas Inscritas</Text>
          
          <View style={styles.accountRow}>
            <View style={styles.accountIconBox}>
              <Text style={{ fontSize: 18 }}>🟣</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>Nequi (Principal)</Text>
              <Text style={styles.accountNumber}>+57 311 *** 4821</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verificada</Text>
            </View>
          </View>

          <View style={styles.accountRow}>
            <View style={styles.accountIconBox}>
              <Text style={{ fontSize: 18 }}>🔴</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>Daviplata (Secundaria)</Text>
              <Text style={styles.accountNumber}>+57 311 *** 4821</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verificada</Text>
            </View>
          </View>
        </View>
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
    paddingBottom: 14,
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  balanceCard: {
    backgroundColor: '#1A1D20',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#BDBDBD',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 6,
  },
  balanceSubtext: {
    fontSize: 11,
    color: '#00C853',
    fontWeight: '700',
    marginBottom: 16,
  },
  withdrawButton: {
    width: '100%',
    backgroundColor: '#FF441F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  withdrawButtonDisabled: {
    backgroundColor: '#616161',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  questCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  questHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  questIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFF0ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questTitleCol: {
    flex: 1,
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1D20',
  },
  questSubtitle: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  progressContainer: {
    gap: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF441F',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 11,
    color: '#616161',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 11,
    color: '#FF441F',
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#424242',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#616161',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D20',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 8,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1D20',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00C853',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  accountIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D20',
  },
  accountNumber: {
    fontSize: 11,
    color: '#757575',
    marginTop: 1,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D32',
  },
});
