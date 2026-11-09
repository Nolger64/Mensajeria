import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Sub-aplicaciones del ecosistema FHS
import RepartidorApp from './repartidor/App';
import AdministradorApp from './administrador/App';
import ClienteApp from './cliente/App';

// Portal Único de Acceso y Servicios
import { LoginPortalScreen } from './src/screens/Auth/LoginPortalScreen';
import { AuthUser, authService } from './src/services/authService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/* 1. Si no hay sesión activa: Mostrar Portal Único de Acceso */}
      {!currentUser && (
        <SafeAreaView style={styles.portalSafeArea} edges={['top', 'left', 'right', 'bottom']}>
          <LoginPortalScreen onLoginSuccess={handleLoginSuccess} />
        </SafeAreaView>
      )}

      {/* 2. Si el usuario es Repartidor: Abrir Aplicación de Repartidor */}
      {currentUser && currentUser.role === 'repartidor' && (
        <View style={styles.appContainer}>
          <RepartidorApp onLogout={handleLogout} currentUser={currentUser} />
        </View>
      )}

      {/* 3. Si el usuario es Administrador: Abrir Aplicación de Administrador */}
      {currentUser && (currentUser.role === 'administrador' || (currentUser.role as string) === 'admin') && (
        <View style={styles.appContainer}>
          <AdministradorApp onLogout={handleLogout} currentUser={currentUser} />
        </View>
      )}

      {/* 4. Si el usuario es Cliente / Usuario: Abrir Aplicación de Cliente */}
      {currentUser && currentUser.role === 'cliente' && (
        <View style={styles.appContainer}>
          <ClienteApp onLogout={handleLogout} currentUser={currentUser} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  portalSafeArea: {
    flex: 1,
    backgroundColor: '#F2F7F3',
  },
  appContainer: {
    flex: 1,
  },
});
