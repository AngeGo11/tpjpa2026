import { fetchApi } from './api';

export enum Role {
  Fan = 'Fan',
  Organizer = 'Organizer'
}

/**
 * Correspond à l'entité Users.java / UsersDTO côté backend (login, register).
 */
export interface User {
  id: number;
  nom: string;
  email: string;
  mdp?: string;
  role: Role;
  /** Présent pour les comptes organisateur (sous-classe Organizer). */
  nomOrganisation?: string | null;
}

/** Libellé principal : organisation pour un organisateur, sinon nom affiché. */
export function getUserDisplayName(user: User): string {
  if (user.role === Role.Organizer && user.nomOrganisation?.trim()) {
    return user.nomOrganisation.trim();
  }
  const n = user.nom?.trim();
  if (n) return n;
  const local = user.email?.split('@')[0];
  return local || 'Utilisateur';
}

/** Prénom ou premier mot pour les salutations (ex. « Bonjour, Marie »). */
export function getUserFirstName(user: User): string {
  const n = user.nom?.trim();
  if (!n) return user.email?.split('@')[0] || 'toi';
  return n.split(/\s+/)[0] || n;
}

export function getUserInitials(user: User): string {
  const display =
    user.role === Role.Organizer && user.nomOrganisation?.trim()
      ? user.nomOrganisation.trim()
      : user.nom?.trim() || user.email || '?';
  const parts = display.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  const single = parts[0] || '?';
  return single.slice(0, 2).toUpperCase();
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
