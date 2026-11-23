import { apiRequest } from './apiRequest';

export type UserRole = 'repartidor' | 'administrador' | 'cliente' | 'especialista';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string;
  vehicle?: 'moto' | 'bici' | 'auto';
  plate?: string;
  address?: string;
}

export interface Credentials {
  user: AuthUser;
  token: string;
}

export type StaffRole = Extract<UserRole, 'especialista' | 'repartidor'>;

interface StaffProfile {
  name: string;
  email: string;
  phone?: string;
  vehicle?: AuthUser['vehicle'];
  vehicleModel?: string;
  plate?: string;
}

export interface StaffMember extends AuthUser {
  role: StaffRole;
  vehicleModel?: string;
}

interface Registration extends StaffProfile {
  password: string;
  role?: UserRole;
}

export const authService = {
  login(email: string, password: string) {
    return apiRequest<Credentials>('/api/auth/login', undefined, {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });
  },
  register(data: Registration, token?: string) {
    return apiRequest<Credentials>('/api/auth/register', token, { method: 'POST', body: JSON.stringify(data) });
  },
  listStaff(role: StaffRole, token: string) {
    return apiRequest<StaffMember[]>(`/api/auth/users?role=${role}`, token);
  },
  updateStaff(id: string, data: StaffProfile, token: string) {
    return apiRequest<StaffMember>(`/api/auth/users/${id}`, token, {
      method: 'PATCH', body: JSON.stringify(data),
    });
  },
  removeStaff(id: string, token: string) {
    return apiRequest(`/api/auth/users/${id}`, token, { method: 'DELETE' });
  },
};
