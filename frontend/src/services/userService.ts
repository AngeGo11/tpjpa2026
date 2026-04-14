import { fetchApi } from './api';

export enum Role {
  Fan = 'Fan',
  Organizer = 'Organizer'
}

/**
 * Correspond à l'entité Users.java du backend.
 */
export interface User {
  id: number;
  nom: string;
  email: string;
  mdp: string; // Mot de passe (Attention : généralement on ne le renvoie pas au frontend)
  role: Role;
  // commandes: Commande[] - On peut l'ajouter si on l'utilise
}

export const userService = {
  /**
   * Récupérer tous les utilisateurs (GET /api/users)
   */
  getAllUsers: async (): Promise<User[]> => {
    return fetchApi<User[]>('/users');
  },

  /**
   * Récupérer un utilisateur par ID (GET /api/users/{id})
   */
  getUserById: async (id: number): Promise<User> => {
    return fetchApi<User>(`/users/${id}`);
  },

  /**
   * Créer un utilisateur (POST /api/users)
   */
  createUser: async (userData: Partial<User>): Promise<User> => {
    return fetchApi<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Mettre à jour un utilisateur (PUT /api/users/{id})
   */
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    return fetchApi<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Supprimer un utilisateur (DELETE /api/users/{id})
   */
  deleteUser: async (id: number): Promise<void> => {
    return fetchApi<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
