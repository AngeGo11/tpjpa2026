import { fetchApi } from './api';

// TODO: Adapter cette interface pour qu'elle corresponde à l'entité Billet
export interface Billet {
  id?: number;
  prix: number;
  typeId: number;
  eventId: number;
  // ... autres champs
}

export const billetService = {
  /**
   * Récupérer tous les billets (GET /api/billets)
   */
  getAllBillets: async (): Promise<Billet[]> => {
    return fetchApi<Billet[]>('/billets');
  },

  /**
   * Récupérer un billet par ID (GET /api/billets/{id})
   */
  getBilletById: async (id: number): Promise<Billet> => {
    return fetchApi<Billet>(`/billets/${id}`);
  },

  /**
   * Créer un billet (POST /api/billets)
   */
  createBillet: async (billetData: Partial<Billet>): Promise<Billet> => {
    return fetchApi<Billet>('/billets', {
      method: 'POST',
      body: JSON.stringify(billetData),
    });
  },

  /**
   * Mettre à jour un billet (PUT /api/billets/{id})
   */
  updateBillet: async (id: number, billetData: Partial<Billet>): Promise<Billet> => {
    return fetchApi<Billet>(`/billets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(billetData),
    });
  },

  /**
   * Supprimer un billet (DELETE /api/billets/{id})
   */
  deleteBillet: async (id: number): Promise<void> => {
    return fetchApi<void>(`/billets/${id}`, {
      method: 'DELETE',
    });
  },
};
