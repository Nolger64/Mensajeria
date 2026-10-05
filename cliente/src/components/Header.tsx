import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClient } from '../context/ClientContext';

interface HeaderProps {
  onSearchChange?: (text: string) => void;
  showSearch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange, showSearch = true }) => {
  const { deliveryAddress, setDeliveryAddress, isServerConnected, refreshStores } = useClient();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [tempAddress, setTempAddress] = useState(deliveryAddress);

  const saveAddress = () => {
    if (tempAddress.trim()) {
      setDeliveryAddress(tempAddress.trim());
    }
    setShowAddressModal(false);
  };

  return (
    <View style={styles.header}>
      {/* Top Bar: Address & Server Status */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.addressContainer}
          onPress={() => {
            setTempAddress(deliveryAddress);
            setShowAddressModal(true);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.locationPin}>
            <Ionicons name="location-sharp" size={18} color="#FF441F" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.addressLabel}>Entregar en</Text>
              <Ionicons name="chevron-down" size={14} color="#8C96A5" style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.addressValue} numberOfLines={1}>
              {deliveryAddress}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Server Connection Badge */}
        <TouchableOpacity
          style={[styles.serverBadge, isServerConnected ? styles.serverOnline : styles.serverOffline]}
          onPress={refreshStores}
          activeOpacity={0.7}
        >
          <View style={[styles.statusDot, isServerConnected ? styles.dotGreen : styles.dotOrange]} />
          <Text style={styles.serverText}>
            {isServerConnected ? 'Central 4000' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#8C96A5" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="¿Qué se te antoja hoy? (Hamburguesas, Carulla, etc.)"
            placeholderTextColor="#687385"
            onChangeText={onSearchChange}
          />
        </View>
      )}

      {/* Address Edit Modal */}
      <Modal visible={showAddressModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📍 Cambiar Dirección de Entrega</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Dirección completa o punto de referencia:</Text>
            <TextInput
              style={styles.modalInput}
              value={tempAddress}
              onChangeText={setTempAddress}
              placeholder="Ej: Cra. 14 #94-44, Chicó, Bogotá"
              placeholderTextColor="#687385"
            />

            <View style={styles.quickAddresses}>
              <TouchableOpacity
                style={styles.quickBadge}
                onPress={() => setTempAddress('Cra. 14 #94-44, Torre Apto 502, Chicó')}
              >
                <Text style={styles.quickBadgeText}>🏠 Casa (Chicó)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickBadge}
                onPress={() => setTempAddress('Cl. 93 #11-20, Edificio WeWork')}
              >
                <Text style={styles.quickBadgeText}>💼 Oficina (Pq 93)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveAddress}>
              <Text style={styles.saveBtnText}>Confirmar Dirección</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#12151B',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222834',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  locationPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 68, 31, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addressLabel: {
    fontSize: 11,
    color: '#8C96A5',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  addressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  serverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  serverOnline: {
    backgroundColor: 'rgba(0, 200, 83, 0.12)',
    borderColor: 'rgba(0, 200, 83, 0.4)',
  },
  serverOffline: {
    backgroundColor: 'rgba(255, 145, 0, 0.12)',
    borderColor: 'rgba(255, 145, 0, 0.4)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  dotGreen: {
    backgroundColor: '#00E676',
  },
  dotOrange: {
    backgroundColor: '#FF9100',
  },
  serverText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E232E',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#2B3342',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#181C24',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2D3545',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  inputLabel: {
    fontSize: 12,
    color: '#8C96A5',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#12151B',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2D3545',
    marginBottom: 14,
  },
  quickAddresses: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  quickBadge: {
    backgroundColor: '#222834',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quickBadgeText: {
    fontSize: 12,
    color: '#FFF',
  },
  saveBtn: {
    backgroundColor: '#FF441F',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
