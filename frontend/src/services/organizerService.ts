import { fetchApi } from './api';

// TODO: Adapter cette interface pour qu'elle corresponde à l'entité Organizer
export interface Organizer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  // ... autres champs
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
    return fetchApi<Organizer>('/organizers', {
      method: 'POST',
      body: JSON.stringify(organizerData),
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
