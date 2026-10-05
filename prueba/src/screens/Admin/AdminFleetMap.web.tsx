import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PartnerStore, Coworker, DriverProfile, DeliveryOrder } from '../../types';
import { generateAdminMapHtml } from './adminMapHtmlGenerator';

interface AdminFleetMapProps {
  driver: DriverProfile;
  coworkers: Coworker[];
  stores: PartnerStore[];
  activeOrders: DeliveryOrder[];
  onSelectWorker: (workerId: string) => void;
  onSelectStore: (storeId: string) => void;
}

export const AdminFleetMap: React.FC<AdminFleetMapProps> = ({
  driver,
  coworkers,
  stores,
  activeOrders,
  onSelectWorker,
  onSelectStore,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const htmlContent = useMemo(() => {
    return generateAdminMapHtml({
      driver,
      coworkers,
      stores,
      activeOrders,
    });
  }, [driver, coworkers, stores, activeOrders]);

  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (payload.type === 'SELECT_WORKER') {
          onSelectWorker(payload.id);
        } else if (payload.type === 'SELECT_STORE') {
          onSelectStore(payload.id);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [onSelectWorker, onSelectStore]);

  const handleCenter = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // @ts-ignore
      iframeRef.current.contentWindow.centerOnLocation?.(4.6750, -74.0550);
    }
  };

  return (
    <View style={styles.container}>
      {/* @ts-ignore */}
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Admin Fleet Map"
      />

      <TouchableOpacity style={styles.recenterBtn} onPress={handleCenter} activeOpacity={0.85}>
        <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#121418',
  },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1D20',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#333842',
  },
});
