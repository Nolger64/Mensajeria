import { API_URL } from '../../../src/services/apiConfig';
import { apiRequest } from '../../../src/services/apiRequest';
import { PartnerStore, Product, DeliveryOrder, Coordinates, Coworker, DeliveryStar, User, AuthResponse } from '../types';

export class FHSApiService {
  private static baseUrl = API_URL;
  private static authToken: string | null = null;

  public static setServerUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  public static getServerUrl() {
    return this.baseUrl;
  }

  public static setAuthToken(token: string | null) {
    this.authToken = token;
  }

  public static getAuthToken() {
    return this.authToken;
  }

  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: { ...headers, ...(options?.headers as Record<string, string>) },
        ...options,
      });
      if (!response.ok) return null;
      const json = await response.json();
      return json.data !== undefined ? json.data : json;
    } catch {
      // Offline or network error - gracefully fall back
      return null;
    }
  }

  // ==========================================
  // AUTENTICACIÓN Y ROLES
  // ==========================================

  public static async login(email: string, password: string): Promise<AuthResponse | null> {
    const res = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res && res.token) {
      this.setAuthToken(res.token);
    }
    return res;
  }

  public static async register(data: Partial<User> & { password: string }): Promise<AuthResponse | null> {
    const res = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.token) {
      this.setAuthToken(res.token);
    }
    return res;
  }

  public static async getMe(): Promise<User | null> {
    const res = await this.request<{ user: User }>('/api/auth/me');
    return res?.user || null;
  }

  // ==========================================
  // TIENDAS Y PRODUCTOS
  // ==========================================

  public static async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/stores`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  public static async getStores(): Promise<PartnerStore[] | null> {
    return this.request<PartnerStore[]>('/api/stores');
  }

  public static async getStoreProducts(storeId: string): Promise<Product[] | null> {
    return this.request<Product[]>(`/api/stores/${storeId}/products`);
  }

  // ==========================================
  // ÓRDENES
  // ==========================================

  public static async getOrders(): Promise<DeliveryOrder[] | null> {
    return this.request<DeliveryOrder[]>('/api/orders');
  }

  public static async createOrder(order: {
    storeId: string;
    customerAddress: string;
    customerNotes: string;
    customerCoordinates?: Coordinates;
    customerTip: number;
    expectedTotal: number;
    items: { id: string; quantity: number }[];
  }): Promise<DeliveryOrder | null> {
    return apiRequest<DeliveryOrder>('/api/orders', this.authToken ?? undefined, {
      method: 'POST',
      body: JSON.stringify(order),
    }, this.baseUrl);
  }

  // ==========================================
  // REPARTIDORES Y PINES ⭐
  // ==========================================

  public static async getWorkers(): Promise<Coworker[] | null> {
    return this.request<Coworker[]>('/api/workers');
  }

  public static async getDeliveryStars(): Promise<DeliveryStar[] | null> {
    return this.request<DeliveryStar[]>('/api/delivery-stars');
  }
}
