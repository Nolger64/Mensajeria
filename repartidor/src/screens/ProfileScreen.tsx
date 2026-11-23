import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { AuthUser } from '../../../src/services/authService';
import { useOperationStyles } from '../../../src/theme/operationStyles';

interface ProfileScreenProps {
  onLogout?: () => void;
  currentUser?: AuthUser | null;
}

export function ProfileScreen({ onLogout, currentUser }: ProfileScreenProps) {
  const styles = useOperationStyles();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mi perfil</Text>
      {currentUser && (
        <View style={styles.card}>
          <Text style={styles.heading}>{currentUser.name}</Text>
          <Text style={styles.text}>Repartidor</Text>
        </View>
      )}
      {onLogout && (
        <TouchableOpacity style={styles.button} onPress={onLogout}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
