import { fetchApi } from './api';

export interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export const authService = {
  /**
   * Connexion de l'utilisateur (POST /api/login)
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Déconnexion (peut être gérée côté client en supprimant le token)
   */
  logout: (): void => {
    // Supprimer le token du localStorage ou d'où vous le stockez
    localStorage.removeItem('authToken');
  },

  /**
   * Stocker le token après une connexion réussie
   */
  storeToken: (token: string): void => {
    localStorage.setItem('authToken', token);
  },

  /**
   * Récupérer le token pour les requêtes authentifiées
   */
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },
};
