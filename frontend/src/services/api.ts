export const API_BASE_URL = 'http://localhost:8080/api'; // On revient à l'URL complète

/**
 * Fonction utilitaire pour faire des requêtes au backend.
 * Elle gère automatiquement l'URL de base et la conversion en JSON.
 */
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = localStorage.getItem('authToken');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Erreur inconnue');
    throw new Error(`Erreur HTTP: ${response.status} - ${errorBody}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const textBody = await response.text();
  return textBody ? JSON.parse(textBody) : ({} as T);
}

export async function fetchApiRaw<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Erreur inconnue');
    throw new Error(`Erreur HTTP: ${response.status} - ${errorBody}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const textBody = await response.text();
  return textBody ? JSON.parse(textBody) : ({} as T);
}