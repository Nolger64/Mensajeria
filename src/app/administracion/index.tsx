import React from 'react';
import { useSession } from '../../context/SessionContext';
import { AdminAgenda } from '../../screens/Spa/AdminAgenda';

export default function Screen() {
  const { session } = useSession();
  return session ? <AdminAgenda token={session.token} /> : null;
}
