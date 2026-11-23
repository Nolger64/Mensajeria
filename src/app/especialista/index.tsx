import React from 'react';
import { useSession } from '../../context/SessionContext';
import { SpecialistAgenda } from '../../screens/Spa/SpecialistAgenda';

export default function Screen() {
  const { session } = useSession();
  return session ? <SpecialistAgenda token={session.token} /> : null;
}
