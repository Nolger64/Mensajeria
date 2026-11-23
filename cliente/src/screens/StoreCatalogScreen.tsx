import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { useClient } from '../context/ClientContext';
import type { PartnerStore } from '../types';
import { Link } from 'expo-router';
import { AuraInput } from '../../../src/components/AuraInput';
import { useOperationStyles } from '../../../src/theme/operationStyles';

interface StoreCatalogScreenProps {
  onSelectStore: (store: PartnerStore) => void;
}

export function StoreCatalogScreen({ onSelectStore }: StoreCatalogScreenProps) {
  const styles = useOperationStyles();
  const { stores, isServerConnected, searchQuery, setSearchQuery } = useClient();
  const query = searchQuery.trim().toLocaleLowerCase('es');
  const matching = stores.filter((store) => [store.name, store.address].some(
    (value) => value?.toLocaleLowerCase('es').includes(query)
  ));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Productos de Aura Spa</Text>
      <Text style={styles.text}>Elige una sede para ver sus productos de cuidado personal.</Text>
      <Link href="/cliente/citas" style={styles.heading}>Reservar una cita</Link>
      <AuraInput
        accessibilityLabel="Buscar sedes"

        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar una sede o dirección"
      />
      {!isServerConnected && <Text style={styles.text}>Conectando con el catálogo…</Text>}
      {isServerConnected && matching.length === 0 && (
        <Text style={styles.text}>{query ? 'No hay sedes que coincidan con tu búsqueda.' : 'Todavía no hay sedes disponibles.'}</Text>
      )}
      {matching.map((store) => (
        <TouchableOpacity key={store.id} style={styles.card} onPress={() => onSelectStore(store)}>
          <Text style={styles.heading}>{store.name}</Text>
          <Text style={styles.text}>{store.address}</Text>
          {!!store.openingHours && <Text style={styles.text}>{store.openingHours}</Text>}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
