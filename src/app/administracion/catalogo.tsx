import React from 'react';
import { useSession } from '../../context/SessionContext';
import { AdminCatalog } from '../../screens/Spa/AdminCatalog';

export default function Screen() {
  const { session } = useSession();
  return session ? <AdminCatalog token={session.token} /> : null;
}
