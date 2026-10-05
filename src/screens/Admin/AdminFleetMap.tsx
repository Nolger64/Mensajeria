import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
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
  const webViewRef = useRef<WebView>(null);

  const htmlContent = useMemo(() => {
    return generateAdminMapHtml({
      driver,
      coworkers,
      stores,
      activeOrders,
    });
  }, [driver, coworkers, stores, activeOrders]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_WORKER') {
        onSelectWorker(data.id);
      } else if (data.type === 'SELECT_STORE') {
        onSelectStore(data.id);
      }
    } catch {
      // ignore
    }
  };

  const handleCenter = () => {
    webViewRef.current?.injectJavaScript(`
      if (window.centerOnLocation) {
        window.centerOnLocation(4.6750, -74.0550);
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
        style={{ flex: 1, backgroundColor: '#121418' }}
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
