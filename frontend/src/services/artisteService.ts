import { fetchApi } from './api';

// TODO: Adapter cette interface pour qu'elle corresponde à l'entité Artiste
export interface Artiste {
  id?: number;
  name: string;
  genre: string;
  // ... autres champs
}

export const artisteService = {
  /**
   * Récupérer tous les artistes (GET /api/artistes)
   */
  getAllArtistes: async (): Promise<Artiste[]> => {
    return fetchApi<Artiste[]>('/artistes');
  },

  /**
   * Récupérer un artiste par ID (GET /api/artistes/{id})
   */
  getArtisteById: async (id: number): Promise<Artiste> => {
    return fetchApi<Artiste>(`/artistes/${id}`);
  },

  /**
   * Créer un artiste (POST /api/artistes)
   */
  createArtiste: async (artisteData: Partial<Artiste>): Promise<Artiste> => {
    return fetchApi<Artiste>('/artistes', {
      method: 'POST',
      body: JSON.stringify(artisteData),
    });
  },

  /**
   * Mettre à jour un artiste (PUT /api/artistes/{id})
   */
  updateArtiste: async (id: number, artisteData: Partial<Artiste>): Promise<Artiste> => {
    return fetchApi<Artiste>(`/artistes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(artisteData),
    });
  },

  /**
   * Supprimer un artiste (DELETE /api/artistes/{id})
   */
  deleteArtiste: async (id: number): Promise<void> => {
    return fetchApi<void>(`/artistes/${id}`, {
      method: 'DELETE',
    });
  },
};
