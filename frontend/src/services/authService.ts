import { fetchApi } from './api';
import { User, Role } from './userService';

export interface LoginCredentials {
  email?: string;
  mdp?: string;
}

export interface RegisterData {
  nom: string;
  email: string;
  mdp: string;
  role: Role;
  nomOrganisation?: string; // Requis si role === 'Organizer'
}

export const authService = {
  /**
   * Connexion de l'utilisateur (POST /api/auth/login)
   * Le backend renvoie les informations de l'utilisateur si succès
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    return fetchApi<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Inscription d'un utilisateur (POST /api/auth/register)
   */
  register: async (data: RegisterData): Promise<User> => {
    return fetchApi<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Déconnexion (gérée côté client)
   */
  logout: (): void => {
    localStorage.removeItem('currentUser');
    // Note: votre backend n'utilise pas de token JWT pour l'instant,
    // mais si c'était le cas, on supprimerait aussi le token ici.
    localStorage.removeItem('authToken');
  },

  /**
   * Stocker l'utilisateur connecté
   */
  storeUser: (user: User): void => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  /**
   * Récupérer l'utilisateur actuellement connecté
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },
};
