import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import { TestLabScreen } from './src/screens/TestLab/TestLabScreen';

function PruebaMain() {
  const { serverConnected, serverOnlineNotice, dismissServerOnlineNotice } = useApp();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Text style={styles.appTitle}>FHS TEST LAB</Text>
          <View style={styles.testTag}>
            <Text style={styles.testTagText}>SANDBOX</Text>
          </View>
        </View>

        {/* Indicador no modificable de estado del servidor */}
        <View style={[styles.connectionPill, serverConnected ? styles.pillOnline : styles.pillOffline]}>
          <View style={[styles.dot, serverConnected ? styles.dotOnline : styles.dotOffline]} />
          <Text style={[styles.connectionText, serverConnected ? styles.textOnline : styles.textOffline]}>
            {serverConnected ? 'Servidor Conectado' : 'Modo Local'}
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

      {/* Test Lab Screen */}
      <View style={styles.content}>
        <TestLabScreen />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <PruebaMain />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#9C27B0',
    letterSpacing: 0.5,
  },
  testTag: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  testTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9C27B0',
  },
  connectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  pillOnline: {
    backgroundColor: '#F3E5F5',
  },
  pillOffline: {
    backgroundColor: '#FFF8E1',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOnline: {
    backgroundColor: '#9C27B0',
  },
  dotOffline: {
    backgroundColor: '#FF9100',
  },
  connectionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textOnline: {
    color: '#7B1FA2',
  },
  textOffline: {
    color: '#F57F17',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  serverNoticeBanner: {
    backgroundColor: '#9C27B0',
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
