import { fetchApi } from './api';

/** Même énumération que `TypeBillet.Type` côté Java (table `type_billet`). */
export enum TypeBilletType {
  GrandPublic = 'GrandPublic',
  VIP = 'VIP',
  VVIP = 'VVIP',
}

/**
 * Correspond à l'entité TypeBillet / TypeBilletDTO du backend.
 */
export interface TypeBillet {
  id?: number;
  eventId?: number;
  type: TypeBilletType;
  prix: number;
  stock: number;
}

export type CreateTypeBilletPayload = {
  eventId: number;
  type: TypeBilletType;
  prix: number;
  stock: number;
};

export const typeBilletService = {
  /**
   * Liste des types de billets (GET /api/type_billet/)
   */
  getAllTypeBillets: async (): Promise<TypeBillet[]> => {
    return fetchApi<TypeBillet[]>('/type_billet');
  },

  /**
   * Détail (GET /api/type_billet/{id})
   */
  getTypeBilletById: async (id: number): Promise<TypeBillet> => {
    return fetchApi<TypeBillet>(`/type_billet/${id}`);
  },

  /** Types de billets pour un événement (filtre côté client sur la liste API). */
  getTypeBilletsByEventId: async (eventId: number): Promise<TypeBillet[]> => {
    const list = await fetchApi<TypeBillet[]>('/type_billet');
    return list.filter((t) => t.eventId === eventId);
  },

  /**
   * Création (POST /api/type_billet) — persistance en base `type_billet`.
   */
  createTypeBillet: async (payload: CreateTypeBilletPayload): Promise<TypeBillet> => {
    return fetchApi<TypeBillet>('/type_billet', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Mise à jour (non exposée par le backend actuellement — peut échouer).
   */
  updateTypeBillet: async (id: number, typeBilletData: Partial<TypeBillet>): Promise<TypeBillet> => {
    return fetchApi<TypeBillet>(`/type_billet/${id}`, {
      method: 'PUT',
      body: JSON.stringify(typeBilletData),
    });
  },

  /**
   * Suppression (non exposée par le backend actuellement — peut échouer).
   */
  deleteTypeBillet: async (id: number): Promise<void> => {
    return fetchApi<void>(`/type_billet/${id}`, {
      method: 'DELETE',
    });
  },
};
