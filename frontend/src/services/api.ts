const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Fonction utilitaire pour faire des requêtes au backend.
 * Elle gère automatiquement l'URL de base et la conversion en JSON.
 */
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // Si le serveur renvoie une erreur (404, 500, etc.), on lève une exception
    const errorBody = await response.text().catch(() => 'Erreur inconnue');
    throw new Error(`Erreur HTTP: ${response.status} - ${errorBody}`);
  }

  // S'il n'y a pas de contenu (ex: DELETE), on ne parse pas le JSON
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
