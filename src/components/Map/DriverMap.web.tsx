import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PartnerStore, Coworker, Coordinates, DeliveryOrder } from '../../types';
import { generateMapHtml } from './mapHtmlGenerator';

interface DriverMapProps {
  driverLocation: Coordinates;
  stores: PartnerStore[];
  coworkers: Coworker[];
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const htmlContent = useMemo(() => {
    return generateMapHtml({
      driverLocation,
      stores,
      coworkers,
      showStores,
      showCoworkers,
      showDemandZones,
      activeOrder,
    });
  }, [driverLocation, stores, coworkers, showStores, showCoworkers, showDemandZones, activeOrder]);

  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (payload.type === 'SELECT_STORE') {
          const store = stores.find((s) => s.id === payload.id);
          if (store) onSelectStore(store);
        } else if (payload.type === 'SELECT_COWORKER') {
          const coworker = coworkers.find((c) => c.id === payload.id);
          if (coworker) onSelectCoworker(coworker);
        } else if (payload.type === 'SELECT_DRIVER') {
          onSelectDriver();
        }
      } catch {
        // ignore non-json messages
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [stores, coworkers, onSelectStore, onSelectCoworker, onSelectDriver]);

  const handleCenterDriver = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // @ts-ignore
      iframeRef.current.contentWindow.centerOnLocation?.(driverLocation.latitude, driverLocation.longitude);
    }
  };

  return (
    <View style={styles.container}>
      {/* Web iframe rendering Leaflet */}
      {/* @ts-ignore */}
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="FHS Driver Map"
      />

      {/* Floating Map Action Controls */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          style={[styles.floatingBtn, showStores && styles.floatingBtnActive]}
          onPress={onToggleStores}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="storefront"
            size={18}
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
            size={18}
            color={showCoworkers ? '#FFFFFF' : '#424242'}
          />
          <Text style={[styles.floatingBtnText, showCoworkers && styles.floatingBtnTextActive]}>
            Compañeros ({coworkers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingBtn, showDemandZones && styles.floatingBtnActiveFire]}
          onPress={onToggleDemandZones}
          activeOpacity={0.8}
        >
          <Ionicons
            name="flame"
            size={18}
            color={showDemandZones ? '#FFFFFF' : '#FF441F'}
          />
          <Text style={[styles.floatingBtnText, showDemandZones && styles.floatingBtnTextActive]}>
            Zona Alta
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
  floatingControls: {
    position: 'absolute',
    top: 14,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    zIndex: 100,
  },
  floatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingBtnActive: {
    backgroundColor: '#1A1D20',
  },
  floatingBtnActiveFire: {
    backgroundColor: '#FF441F',
  },
  floatingBtnText: {
    fontSize: 12,
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
