import { Platform } from 'react-native';

export type UserRole = 'repartidor' | 'administrador' | 'cliente';

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

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  token?: string | null;
  message?: string;
  isOfflineMode?: boolean;
}

export const DEMO_USERS: Record<UserRole, AuthUser & { defaultPass: string; roleLabel: string; roleDescription: string; icon: string; themeColor: string }> = {
  repartidor: {
    id: 'usr-driver-1',
    name: 'Mateo Silva',
    email: 'repartidor@fhs.com',
    defaultPass: 'Repartidor123!',
    role: 'repartidor',
    roleLabel: 'Aura Courier Pro',
    roleDescription: 'Embajador Loto Oro · Eco-Bike #08 · Navegación serena y PIN',
    vehicle: 'bici',
    plate: 'ECO-08',
    phone: '+52 55 1234 5678',
    icon: 'bicycle-outline',
    themeColor: '#8B4E38',
  },
  administrador: {
    id: 'usr-admin-1',
    name: 'Dra. Elena Vega',
    email: 'admin@fhs.com',
    defaultPass: 'Admin123!',
    role: 'administrador',
    roleLabel: 'Aura Central',
    roleDescription: 'Torre de control · Operaciones, Sedes & Stock, Flota y Métricas',
    department: 'Dirección de Operaciones Botánicas',
    phone: '+52 55 9876 5432',
    icon: 'business-outline',
    themeColor: '#283C2D',
  },
  cliente: {
    id: 'usr-client-1',
    name: 'Valeria Morales',
    email: 'cliente@fhs.com',
    defaultPass: 'Cliente123!',
    role: 'cliente',
    roleLabel: 'Aura Botanicals',
    roleDescription: 'Catálogo de fórmulas, canasta de serenidad y rastreo de ritual',
    address: 'Calle Los Almendros 402, Depto 3B, Bosques',
    phone: '+52 55 4567 8901',
    icon: 'leaf-outline',
    themeColor: '#38523E',
  },
};

const DEFAULT_SERVER_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

class AuthService {
  private baseUrl = DEFAULT_SERVER_URL;
  private currentToken: string | null = null;
  private currentUser: AuthUser | null = null;

  public setServerUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  public getServerUrl() {
    return this.baseUrl;
  }

  public getCurrentUser() {
    return this.currentUser;
  }

  public setCurrentUser(user: AuthUser | null) {
    this.currentUser = user;
  }

  public getToken() {
    return this.currentToken;
  }

  public setToken(token: string | null) {
    this.currentToken = token;
  }

  public logout() {
    this.currentToken = null;
    this.currentUser = null;
  }

  /**
   * Intenta autenticar contra el servidor backend.
   * Si el servidor no está en línea o hay timeout, recurre a la base local de cuentas del ecosistema.
   */
  public async login(email: string, password: string): Promise<LoginResult> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return {
        success: false,
        message: 'Por favor ingresa tu correo y contraseña.',
      };
    }

    // 1. Intentar autenticación con el servidor Node.js
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.user) {
          // Normalizar rol si viene como 'admin' -> 'administrador'
          const role: UserRole =
            data.user.role === 'admin' || data.user.role === 'administrador'
              ? 'administrador'
              : data.user.role === 'repartidor'
              ? 'repartidor'
              : 'cliente';

          const authUser: AuthUser = {
            id: data.user.id || 'usr-logged',
            name: data.user.name || cleanEmail.split('@')[0],
            email: data.user.email || cleanEmail,
            role,
            phone: data.user.phone,
            department: data.user.department,
            vehicle: data.user.vehicle,
            plate: data.user.plate,
            address: data.user.address,
          };

          this.currentUser = authUser;
          this.currentToken = data.token || 'jwt-token-active';

          return {
            success: true,
            user: authUser,
            token: this.currentToken,
            message: data.message || `Bienvenido, ${authUser.name}`,
            isOfflineMode: false,
          };
        } else {
          return {
            success: false,
            message: data?.message || 'Credenciales inválidas en el servidor.',
          };
        }
      }
    } catch {
      // El servidor backend no está respondiendo (offline o desarrollo sin servidor activo)
    }

    // 2. Fallback local / offline: Validar contra usuarios predeterminados
    const demoEntries = Object.values(DEMO_USERS);
    const matched = demoEntries.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (matched) {
      if (cleanPassword === matched.defaultPass || cleanPassword.length >= 4) {
        const authUser: AuthUser = {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          role: matched.role,
          phone: matched.phone,
          department: matched.department,
          vehicle: matched.vehicle,
          plate: matched.plate,
          address: matched.address,
        };

        this.currentUser = authUser;
        this.currentToken = `offline-token-${matched.role}`;

        return {
          success: true,
          user: authUser,
          token: this.currentToken,
          message: `Sesión iniciada como ${matched.name} (${matched.roleLabel})`,
          isOfflineMode: true,
        };
      } else {
        return {
          success: false,
          message: 'Contraseña incorrecta para esta cuenta.',
        };
      }
    }

    return {
      success: false,
      message: 'Usuario no registrado. Usa una de las cuentas demo o regístrate en el servidor.',
    };
  }

  /**
   * Comprueba si el servidor Express está activo en el puerto 4000
   */
  public async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${this.baseUrl}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
