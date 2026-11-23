import React, { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { FHSApiService as AdminApi } from '../../administrador/src/services/api';
import { FHSApiService as ClientApi } from '../../cliente/src/services/api';
import { FHSApiService as CourierApi } from '../../repartidor/src/services/api';
import type { Credentials, UserRole } from '../services/authService';

const roleApis = {
  administrador: AdminApi,
  cliente: ClientApi,
  repartidor: CourierApi,
  especialista: null,
};

const Edition = createContext<UserRole | undefined>(undefined);
export const EditionProvider = Edition.Provider;

interface SessionContextValue {
  session: Credentials | null;
  requiredRole?: UserRole;
  signIn: (session: Credentials) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const requiredRole = useContext(Edition);
  const [session, setSession] = useState<Credentials | null>(null);

  function signIn(next: Credentials) {
    if (requiredRole && next.user.role !== requiredRole) {
      throw new Error('Esta cuenta no tiene acceso a esta edición de Aura Spa.');
    }
    roleApis[next.user.role]?.setAuthToken(next.token);
    setSession(next);
  }

  function signOut() {
    if (session) roleApis[session.user.role]?.setAuthToken(null);
    setSession(null);
  }

  return (
    <SessionContext.Provider value={{ session, requiredRole, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('La pantalla requiere SessionProvider.');
  return value;
}
