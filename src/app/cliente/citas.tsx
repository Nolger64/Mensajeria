import React from 'react';
import { useSession } from '../../context/SessionContext';
import { ClientAppointments } from '../../screens/Spa/ClientAppointments';

export default function Screen() {
  const { session } = useSession();
  return session ? <ClientAppointments token={session.token} /> : null;
}
