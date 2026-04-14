import { fetchApi } from './api';
import { User, Role } from './userService';

/**
 * Correspond à l'entité Organizer.java du backend.
 * Elle hérite de Users (nom, email, mdp, role).
 */
export interface Organizer extends User {
  nomOrganisation: string;
  // events: Event[] - Si nécessaire
}

export const organizerService = {
  /**
   * Récupérer tous les organisateurs (GET /api/organizers)
   */
  getAllOrganizers: async (): Promise<Organizer[]> => {
    return fetchApi<Organizer[]>('/organizers');
  },

  /**
   * Récupérer un organisateur par ID (GET /api/organizers/{id})
   */
  getOrganizerById: async (id: number): Promise<Organizer> => {
    return fetchApi<Organizer>(`/organizers/${id}`);
  },

  /**
   * Créer un organisateur (POST /api/organizers)
   */
  createOrganizer: async (organizerData: Partial<Organizer>): Promise<Organizer> => {
    // Par défaut, s'assurer que le rôle est défini s'il n'est pas envoyé
    const data = { ...organizerData, role: Role.Organizer };
    return fetchApi<Organizer>('/organizers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Mettre à jour un organisateur (PUT /api/organizers/{id})
   */
  updateOrganizer: async (id: number, organizerData: Partial<Organizer>): Promise<Organizer> => {
    return fetchApi<Organizer>(`/organizers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(organizerData),
    });
  },

  /**
   * Supprimer un organisateur (DELETE /api/organizers/{id})
   */
  deleteOrganizer: async (id: number): Promise<void> => {
    return fetchApi<void>(`/organizers/${id}`, {
      method: 'DELETE',
    });
  },
};
