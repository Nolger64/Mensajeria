import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PartnerStore, Coworker, Coordinates, DeliveryOrder, DeliveryStar } from '../../types';
import { generateMapHtml } from './mapHtmlGenerator';

interface DriverMapProps {
  driverLocation: Coordinates;
  stores: PartnerStore[];
  coworkers: Coworker[];
  deliveryStars?: DeliveryStar[];
  showStores: boolean;
  showCoworkers: boolean;
  showDemandZones: boolean;
  activeOrder: DeliveryOrder | null;
  onToggleStores: () => void;
  onToggleCoworkers: () => void;
  onToggleDemandZones: () => void;
  onSelectStore: (store: PartnerStore) => void;
  onSelectCoworker: (coworker: Coworker) => void;
  onSelectDriver: () => void;
}

export const DriverMap: React.FC<DriverMapProps> = ({
  driverLocation,
  stores,
  coworkers,
  deliveryStars = [],
  showStores,
  showCoworkers,
  showDemandZones,
  activeOrder,
  onToggleStores,
  onToggleCoworkers,
  onToggleDemandZones,
  onSelectStore,
  onSelectCoworker,
  onSelectDriver,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [showStars, setShowStars] = useState(true);

  const htmlContent = useMemo(() => {
    return generateMapHtml({
      driverLocation,
      stores,
      coworkers,
      deliveryStars,
      showStores,
      showCoworkers,
      showDemandZones,
      showStars,
      activeOrder,
    });
  }, [driverLocation, stores, coworkers, deliveryStars, showStores, showCoworkers, showDemandZones, showStars, activeOrder]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_STORE') {
        const store = stores.find((s) => s.id === data.id);
        if (store) onSelectStore(store);
      } else if (data.type === 'SELECT_COWORKER') {
        const coworker = coworkers.find((c) => c.id === data.id);
        if (coworker) onSelectCoworker(coworker);
      } else if (data.type === 'SELECT_STAR') {
        Alert.alert(
          '⭐ Tip de Entrega de Compañero',
          `📍 Dirección: ${data.address}\n\n📝 Consejo del domiciliario:\n"${data.notes}"`,
          [{ text: 'Entendido 👍' }]
        );
      } else if (data.type === 'SELECT_DRIVER') {
        onSelectDriver();
      }
    } catch {
      // ignore
    }
  };

  const handleCenterDriver = () => {
    webViewRef.current?.injectJavaScript(`
      if (window.centerOnLocation) {
        window.centerOnLocation(${driverLocation.latitude}, ${driverLocation.longitude});
      }
      true;
    `);
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        style={styles.webview}
      />

      {/* Floating Action Controls */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          style={[styles.floatingBtn, showStores && styles.floatingBtnActive]}
          onPress={onToggleStores}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="storefront"
            size={16}
            color={showStores ? '#FFFFFF' : '#424242'}
          />
          <Text style={[styles.floatingBtnText, showStores && styles.floatingBtnTextActive]}>
            Convenios ({stores.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingBtn, showCoworkers && styles.floatingBtnActive]}
          onPress={onToggleCoworkers}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="moped"
            size={16}
            color={showCoworkers ? '#FFFFFF' : '#424242'}
          />
          <Text style={[styles.floatingBtnText, showCoworkers && styles.floatingBtnTextActive]}>
            Compañeros ({coworkers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingBtn, showStars && styles.floatingBtnActiveStar]}
          onPress={() => setShowStars((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="star"
            size={15}
            color={showStars ? '#FFFFFF' : '#F57F17'}
          />
          <Text style={[styles.floatingBtnText, showStars && styles.floatingBtnTextActive]}>
            Estrellas ({deliveryStars.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingBtn, showDemandZones && styles.floatingBtnActiveFire]}
          onPress={onToggleDemandZones}
          activeOpacity={0.8}
        >
          <Ionicons
            name="flame"
            size={16}
            color={showDemandZones ? '#FFFFFF' : '#FF441F'}
          />
          <Text style={[styles.floatingBtnText, showDemandZones && styles.floatingBtnTextActive]}>
            Zonas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recenter Location Button */}
      <TouchableOpacity
        style={styles.recenterBtn}
        onPress={handleCenterDriver}
        activeOpacity={0.85}
      >
        <Ionicons name="locate" size={22} color="#FF441F" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E8ECF2',
  },
  webview: {
    flex: 1,
    backgroundColor: '#E8ECF2',
  },
  floatingControls: {
    position: 'absolute',
    top: 14,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
    zIndex: 100,
    flexWrap: 'wrap',
  },
  floatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingBtnActive: {
    backgroundColor: '#1A1D20',
  },
  floatingBtnActiveStar: {
    backgroundColor: '#F57F17',
  },
  floatingBtnActiveFire: {
    backgroundColor: '#FF441F',
  },
  floatingBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333333',
  },
  floatingBtnTextActive: {
    color: '#FFFFFF',
  },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 100,
  },
});
