export const API_BASE_URL = 'http://localhost:8080/api'; // On revient à l'URL complète

/**
 * Fonction utilitaire pour faire des requêtes au backend.
 * Elle gère automatiquement l'URL de base et la conversion en JSON.
 */
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = localStorage.getItem('authToken');

  // Si c'est un DELETE, on n'a souvent pas besoin de Content-Type car on n'envoie pas de body
  const isDelete = options?.method === 'DELETE';

  const defaultHeaders: HeadersInit = {
    ...(!isDelete ? { 'Content-Type': 'application/json' } : {}),
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

  // S'il n'y a pas de contenu (ex: DELETE qui renvoie 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  // Parfois les API renvoient 200 OK mais avec un corps vide (ce qui fait crasher JSON.parse)
  const textBody = await response.text();
  if (!textBody || textBody.trim() === '') {
     return {} as T;
  }

  try {
     return JSON.parse(textBody) as T;
  } catch (e) {
     console.warn("La réponse n'est pas du JSON valide:", textBody);
     return {} as T; // Fallback pour éviter le crash total du composant
  }
}

export async function fetchApiRaw<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');

  const headers = new Headers(options?.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Accept', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers: headers,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Erreur inconnue');
    throw new Error(`Erreur HTTP: ${response.status} - ${errorBody}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const textBody = await response.text();
  if (!textBody || textBody.trim() === '') {
     return {} as T;
  }

  try {
     return JSON.parse(textBody) as T;
  } catch (e) {
     return {} as T;
  }
}
