import { fetchApi, fetchApiRaw } from './api';

export enum GenreMusical {
  POP = 'POP',
  ROCK = 'ROCK',
  SHATTA = 'SHATTA',
  JAZZ = 'JAZZ',
  HIP_HOP = 'HIP_HOP',
  ELECTRO = 'ELECTRO',
  RAP = 'RAP'
}

/**
 * Correspond à l'entité EventsDTO.java du backend.
 * Attention: Le backend ne renvoie pas les objets complets, mais des IDs !
 */
export interface Event {
  id: number;
  nom: string;
  lieu: string;
  image: string;
  date: string; // Date en format string (ISO) retournée par le backend
  heure: string; // Heure en format string retournée par le backend
  description: string;
  nbPlaces: number;
  organizerId: number; // Le backend renvoie organizerId, pas un objet Organizer
  genreMusical: GenreMusical;
  artistePrincipalId: number; // Le backend renvoie artistePrincipalId
  inviteIds: number[]; // Le backend renvoie une liste d'IDs
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

  uploadEventImage: async (id: number, file: File): Promise<Event> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        return await fetchApiRaw<Event>(`/events/${id}/image`, {
        method: 'POST',
        body: formData,
        });
    } catch (e) {
        console.warn("L'upload d'image n'est pas encore totalement supporté", e);
        return {} as Event;
    }
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
    // Utiliser la fonction fetchApi qui est maintenant bien configurée
    // pour les requêtes DELETE avec un corps de réponse vide.
    return fetchApi<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};
