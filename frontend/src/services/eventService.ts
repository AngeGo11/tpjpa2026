import { fetchApi } from './api';

// Définissez ici l'interface de votre Event en TypeScript
// (Assurez-vous qu'elle correspond aux champs de votre backend)
export interface Event {
  id?: number;
  title: string;
  description: string;
  date: string;
  location: string;
  // ... autres champs
}

export const eventService = {
  /**
   * Récupérer tous les événements (GET /api/events)
   */
  getAllEvents: async (): Promise<Event[]> => {
    return fetchApi<Event[]>('/events');
  },

  /**
   * Récupérer un événement par ID (GET /api/events/{id})
   */
  getEventById: async (id: number): Promise<Event> => {
    return fetchApi<Event>(`/events/${id}`);
  },

  /**
   * Créer un événement (POST /api/events)
   */
  createEvent: async (eventData: Partial<Event>): Promise<Event> => {
    return fetchApi<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  /**
   * Mettre à jour un événement (PUT /api/events/{id})
   */
  updateEvent: async (id: number, eventData: Partial<Event>): Promise<Event> => {
    return fetchApi<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  /**
   * Supprimer un événement (DELETE /api/events/{id})
   */
  deleteEvent: async (id: number): Promise<void> => {
    return fetchApi<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};
