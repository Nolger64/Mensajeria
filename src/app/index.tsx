import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../context/SessionContext';
import { LoginPortalScreen } from '../screens/Auth/LoginPortalScreen';
import { useOperationStyles } from '../theme/operationStyles';

export default function SignInRoute() {
  const styles = useOperationStyles();
  const { signIn, requiredRole } = useSession();
  return (
    <SafeAreaView style={styles.screen}>
      <LoginPortalScreen onLoginSuccess={(user, token) => signIn({ user, token })} requiredRole={requiredRole} />
    </SafeAreaView>
  );
}
