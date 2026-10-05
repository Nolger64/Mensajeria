import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import { AdminDashboardScreen } from './src/screens/Admin/AdminDashboardScreen';

function AdministradorMain() {
  const { serverConnected, serverOnlineNotice, dismissServerOnlineNotice } = useApp();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Text style={styles.appTitle}>FHS CONTROL</Text>
          <View style={styles.adminTag}>
            <Text style={styles.adminTagText}>ADMIN DISPATCH</Text>
          </View>
        </View>

        {/* Indicador no modificable de estado del servidor */}
        <View style={[styles.connectionPill, serverConnected ? styles.pillOnline : styles.pillOffline]}>
          <View style={[styles.dot, serverConnected ? styles.dotOnline : styles.dotOffline]} />
          <Text style={[styles.connectionText, serverConnected ? styles.textOnline : styles.textOffline]}>
            {serverConnected ? 'Servidor Conectado' : 'Modo Offline'}
          </Text>
        </View>
      </View>

      {/* Aviso de Servidor en Línea */}
      {serverOnlineNotice && (
        <View style={styles.serverNoticeBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.serverNoticeText}>{serverOnlineNotice}</Text>
          <TouchableOpacity onPress={dismissServerOnlineNotice} style={styles.dismissNoticeBtn}>
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Admin Dashboard */}
      <View style={styles.content}>
        <AdminDashboardScreen />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AdministradorMain />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1113',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F1113',
    borderBottomWidth: 1,
    borderBottomColor: '#24282D',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FF441F',
    letterSpacing: 0.5,
  },
  adminTag: {
    backgroundColor: '#1E232A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2F3540',
  },
  adminTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00E676',
  },
  connectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: '#292E36',
  },
  pillOnline: {
    backgroundColor: '#14291B',
  },
  pillOffline: {
    backgroundColor: '#2D2312',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOnline: {
    backgroundColor: '#00E676',
  },
  dotOffline: {
    backgroundColor: '#FFB300',
  },
  connectionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textOnline: {
    color: '#00E676',
  },
  textOffline: {
    color: '#FFB300',
  },
  content: {
    flex: 1,
    backgroundColor: '#0F1113',
  },
  serverNoticeBanner: {
    backgroundColor: '#00C853',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  serverNoticeText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  dismissNoticeBtn: {
    padding: 4,
  },
});
