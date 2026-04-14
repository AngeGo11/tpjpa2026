import { fetchApi } from './api';
import { Event } from './eventService';

export enum Type {
  GrandPublic = 'GrandPublic',
  VIP = 'VIP',
  VVIP = 'VVIP'
}

/**
 * Correspond à l'entité TypeBillet.java du backend.
 */
export interface TypeBillet {
  id: number;
  event: Event; // Ou just l'ID : number si l'API renvoie seulement l'ID
  type: Type;
  prix: number;
  stock: number;
}

export const typeBilletService = {
  /**
   * Récupérer tous les types de billets (GET /api/types-billet)
   */
  getAllTypeBillets: async (): Promise<TypeBillet[]> => {
    return fetchApi<TypeBillet[]>('/types-billet');
  },

  /**
   * Récupérer un type de billet par ID (GET /api/types-billet/{id})
   */
  getTypeBilletById: async (id: number): Promise<TypeBillet> => {
    return fetchApi<TypeBillet>(`/types-billet/${id}`);
  },

  /**
   * Créer un type de billet (POST /api/types-billet)
   */
  createTypeBillet: async (typeBilletData: Partial<TypeBillet>): Promise<TypeBillet> => {
    return fetchApi<TypeBillet>('/types-billet', {
      method: 'POST',
      body: JSON.stringify(typeBilletData),
    });
  },

  /**
   * Mettre à jour un type de billet (PUT /api/types-billet/{id})
   */
  updateTypeBillet: async (id: number, typeBilletData: Partial<TypeBillet>): Promise<TypeBillet> => {
    return fetchApi<TypeBillet>(`/types-billet/${id}`, {
      method: 'PUT',
      body: JSON.stringify(typeBilletData),
    });
  },

  /**
   * Supprimer un type de billet (DELETE /api/types-billet/{id})
   */
  deleteTypeBillet: async (id: number): Promise<void> => {
    return fetchApi<void>(`/types-billet/${id}`, {
      method: 'DELETE',
    });
  },
};
