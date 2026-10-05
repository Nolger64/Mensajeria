import { Platform } from 'react-native';
import { PartnerStore, Coworker, DeliveryOrder, CommunityMessage } from '../types';

const DEFAULT_SERVER_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

export class FHSApiService {
  private static baseUrl = DEFAULT_SERVER_URL;

  public static setServerUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  public static getServerUrl() {
    return this.baseUrl;
  }

  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      if (!response.ok) return null;
      const json = await response.json();
      return json.data !== undefined ? json.data : json;
    } catch (e) {
      // Offline or network error - gracefully fall back
      return null;
    }
  }

  public static async checkHealth(): Promise<{ status: string; online: boolean; dispatchMode?: string } | null> {
    return this.request<{ status: string; online: boolean; dispatchMode?: string }>('/api/health');
  }

  public static async getStores(): Promise<PartnerStore[] | null> {
    return this.request<PartnerStore[]>('/api/stores');
  }

  public static async createStore(store: PartnerStore): Promise<PartnerStore | null> {
    return this.request<PartnerStore>('/api/stores', {
      method: 'POST',
      body: JSON.stringify(store),
    });
  }

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

  public static async getMessages(): Promise<CommunityMessage[] | null> {
    return this.request<CommunityMessage[]>('/api/messages');
  }

  public static async sendMessage(message: Partial<CommunityMessage>): Promise<CommunityMessage | null> {
    return this.request<CommunityMessage>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  public static async getDeliveryStars(): Promise<import('../types').DeliveryStar[] | null> {
    return this.request<import('../types').DeliveryStar[]>('/api/delivery-stars');
  }

  public static async createDeliveryStar(star: Partial<import('../types').DeliveryStar>): Promise<import('../types').DeliveryStar | null> {
    return this.request<import('../types').DeliveryStar>('/api/delivery-stars', {
      method: 'POST',
      body: JSON.stringify(star),
    });
  }

  public static async resetData(): Promise<boolean> {
    const res = await this.request('/api/reset', { method: 'POST' });
    return res !== null;
  }
}
