import React from 'react';
import { ProfileScreen } from '../../../repartidor/src/screens/ProfileScreen';
import { useSession } from '../../context/SessionContext';

export default function Screen() {
  const { session } = useSession();
  return <ProfileScreen currentUser={session?.user} />;
}
