import { API_URL } from './apiConfig';

export async function apiRequest<T>(path: string, token?: string, init?: RequestInit, baseUrl = API_URL): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  } catch {
    throw new Error('No hay conexión con Aura Spa. Inténtalo nuevamente.');
  }
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || (response.status === 404
      ? 'El recurso ya no está disponible.'
      : 'No se pudo completar la operación.'));
  }
  return (payload?.data ?? payload) as T;
}
