import { API_URL } from '../../../src/services/apiConfig';
import {
  PartnerStore,
  Coworker,
  DeliveryOrder,
  CommunityMessage,
  User,
  AuthResponse,
  RadioRoom,
  RadioParticipant,
  VoiceTransmission,
  SystemSettings,
  DispatchMode,
} from '../types';

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
  // AUTENTICACIÓN Y GESTIÓN DE USUARIOS (ADMIN)
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

  public static async getAllUsers(role?: string): Promise<User[] | null> {
    const query = role ? `?role=${role}` : '';
    return this.request<User[]>(`/api/auth/users${query}`);
  }

  public static async updateUserRole(userId: string, role: string): Promise<User | null> {
    const res = await this.request<{ user: User }>(`/api/auth/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return res?.user || null;
  }

  public static async deleteUser(userId: string): Promise<boolean> {
    const res = await this.request(`/api/auth/users/${userId}`, {
      method: 'DELETE',
    });
    return res !== null;
  }

  // ==========================================
  // TIENDAS
  // ==========================================

  public static async getStores(): Promise<PartnerStore[] | null> {
    return this.request<PartnerStore[]>('/api/stores');
  }

  public static async createStore(store: PartnerStore): Promise<PartnerStore | null> {
    return this.request<PartnerStore>('/api/stores', {
      method: 'POST',
      body: JSON.stringify(store),
    });
  }

  public static async updateStore(id: string, data: Partial<PartnerStore>): Promise<PartnerStore | null> {
    return this.request<PartnerStore>(`/api/stores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public static async deleteStore(id: string): Promise<boolean> {
    const res = await this.request(`/api/stores/${id}`, {
      method: 'DELETE',
    });
    return res !== null;
  }

  public static async addStoreProduct(storeId: string, product: any): Promise<any | null> {
    return this.request(`/api/stores/${storeId}/products`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  public static async deleteStoreProduct(storeId: string, productId: string): Promise<boolean> {
    const res = await this.request(`/api/stores/${storeId}/products/${productId}`, {
      method: 'DELETE',
    });
    return res !== null;
  }

  // ==========================================
  // TRABAJADORES (COWORKERS)
  // ==========================================

  public static async getWorkers(): Promise<Coworker[] | null> {
    return this.request<Coworker[]>('/api/workers');
  }

  public static async createWorker(worker: Coworker): Promise<Coworker | null> {
    return this.request<Coworker>('/api/workers', {
      method: 'POST',
      body: JSON.stringify(worker),
    });
  }

  public static async updateWorker(id: string, data: Partial<Coworker>): Promise<Coworker | null> {
    return this.request<Coworker>(`/api/workers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public static async simulateMovement(): Promise<Coworker[] | null> {
    return this.request<Coworker[]>('/api/workers/simulate-movement', {
      method: 'POST',
    });
  }

  // ==========================================
  // ÓRDENES
  // ==========================================

  public static async getOrders(): Promise<DeliveryOrder[] | null> {
    return this.request<DeliveryOrder[]>('/api/orders');
  }

  public static async createOrder(order: DeliveryOrder): Promise<DeliveryOrder | null> {
    return this.request<DeliveryOrder>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  public static async updateOrderStatus(id: string, status: string): Promise<DeliveryOrder | null> {
    return this.request<DeliveryOrder>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  public static async assignOrder(id: string, workerId: string): Promise<DeliveryOrder | null> {
    return this.request<DeliveryOrder>(`/api/orders/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ workerId }),
    });
  }

  // ==========================================
  // MENSAJERÍA
  // ==========================================

  public static async getMessages(): Promise<CommunityMessage[] | null> {
    return this.request<CommunityMessage[]>('/api/messages');
  }

  public static async sendMessage(message: Partial<CommunityMessage>): Promise<CommunityMessage | null> {
    return this.request<CommunityMessage>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // ==========================================
  // PINES DE ENTREGA ⭐
  // ==========================================

  public static async getDeliveryStars(): Promise<import('../types').DeliveryStar[] | null> {
    return this.request<import('../types').DeliveryStar[]>('/api/delivery-stars');
  }

  public static async createDeliveryStar(star: Partial<import('../types').DeliveryStar>): Promise<import('../types').DeliveryStar | null> {
    return this.request<import('../types').DeliveryStar>('/api/delivery-stars', {
      method: 'POST',
      body: JSON.stringify(star),
    });
  }

  // ==========================================
  // SALAS DE RADIO Y REUNIONES DE VOZ EN VIVO
  // ==========================================

  public static async getRadioRooms(): Promise<RadioRoom[] | null> {
    return this.request<RadioRoom[]>('/api/radio/rooms');
  }

  public static async getRadioRoom(id: string): Promise<RadioRoom | null> {
    return this.request<RadioRoom>(`/api/radio/rooms/${id}`);
  }

  public static async joinRadioRoom(roomId: string, participant: Partial<RadioParticipant>): Promise<RadioRoom | null> {
    return this.request<RadioRoom>(`/api/radio/rooms/${roomId}/join`, {
      method: 'POST',
      body: JSON.stringify(participant),
    });
  }

  public static async leaveRadioRoom(roomId: string, userId: string): Promise<RadioRoom | null> {
    return this.request<RadioRoom>(`/api/radio/rooms/${roomId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  public static async setRadioSpeaking(roomId: string, userId: string, isSpeaking: boolean): Promise<boolean> {
    const res = await this.request<{ userId: string; isSpeaking: boolean }>(`/api/radio/rooms/${roomId}/speaking`, {
      method: 'POST',
      body: JSON.stringify({ userId, isSpeaking }),
    });
    return res !== null;
  }

  public static async broadcastVoiceTransmission(
    roomId: string,
    transmission: {
      senderId: string;
      senderName: string;
      senderVehicle: string;
      audioText: string;
      tag?: string;
      durationSec?: number;
    }
  ): Promise<VoiceTransmission | null> {
    return this.request<VoiceTransmission>(`/api/radio/rooms/${roomId}/broadcast`, {
      method: 'POST',
      body: JSON.stringify(transmission),
    });
  }

  // ==========================================
  // ESTADO DEL SERVIDOR Y MODO DE DESPACHO
  // ==========================================

  public static async checkHealth(): Promise<{ status: string; online: boolean; serverMessage: string; dispatchMode: string } | null> {
    return this.request<{ status: string; online: boolean; serverMessage: string; dispatchMode: string }>('/api/health');
  }

  public static async getSettings(): Promise<SystemSettings | null> {
    return this.request<SystemSettings>('/api/settings');
  }

  public static async updateDispatchMode(dispatchMode: DispatchMode): Promise<SystemSettings | null> {
    return this.request<SystemSettings>('/api/settings/dispatch-mode', {
      method: 'PATCH',
      body: JSON.stringify({ dispatchMode }),
    });
  }

  // ==========================================
  // RESET
  // ==========================================

  public static async resetData(): Promise<boolean> {
    const res = await this.request('/api/reset', { method: 'POST' });
    return res !== null;
  }
}
