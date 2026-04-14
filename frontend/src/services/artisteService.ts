import { fetchApi } from './api';

/**
 * Correspond à l'entité ArtisteDTO.java du backend.
 */
export interface Artiste {
  id?: number;
  nomArtiste?: string; // Utilisé par le backend pour renvoyer le nom (dans getArtisteById)
  nom?: string;        // Utilisé par le backend dans le POST (artisteDTO.getNom())
  photoUrl?: string;
}

export const artisteService = {
  /**
   * Récupérer tous les artistes
   */
  getAllArtistes: async (): Promise<Artiste[]> => {
    // Si l'endpoint renvoie 404 de façon persistante, on attrape l'erreur
    // pour éviter de crasher le dashboard.
    try {
       // La route dans ArtisteResource est @Path("artiste")
       return await fetchApi<Artiste[]>('/artiste');
    } catch (e) {
       console.warn("Impossible de récupérer la liste des artistes.", e);
       return [];
    }
  },

  /**
   * Récupérer un artiste par ID
   */
  getArtisteById: async (id: number): Promise<Artiste> => {
    return fetchApi<Artiste>(`/artiste/${id}`);
  },

  /**
   * Créer un artiste
   */
  createArtiste: async (artisteData: Partial<Artiste>): Promise<Artiste> => {
    // IMPORTANT : Dans Java (ArtisteResource.addArtiste), il lit `artisteDTO.getNom()`
    const dataToSend = {
       nom: artisteData.nomArtiste || artisteData.nom || 'Artiste Inconnu',
       photoUrl: artisteData.photoUrl || ''
    };

    return fetchApi<Artiste>('/artiste', {
      method: 'POST',
      body: JSON.stringify(dataToSend),
    });
  },

  /**
   * Mettre à jour un artiste
   */
  updateArtiste: async (id: number, artisteData: Partial<Artiste>): Promise<Artiste> => {
    return fetchApi<Artiste>(`/artiste/${id}`, {
      method: 'PUT',
      body: JSON.stringify(artisteData),
    });
  },

  /**
   * Supprimer un artiste
   */
  deleteArtiste: async (id: number): Promise<void> => {
    return fetchApi<void>(`/artiste/${id}`, {
      method: 'DELETE',
    });
  },
};
