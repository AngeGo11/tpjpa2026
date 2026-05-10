import { fetchApi } from './api';

export enum StatutCommande {
  ANNULE = 'ANNULE',
  EN_ATTENTE = 'EN_ATTENTE',
  REMBOURSE = 'REMBOURSE',
  VALIDEE = 'VALIDEE',
}

/**
 * Aligné sur CommandeDTO (GET /api/commandes/{id}).
 */
export interface Commande {
  id: number;
  date: string;
  montantTotal: number;
  acheteurId: number;
  statut: StatutCommande;
}

/** Ligne renvoyée par GET /api/commandes/{id}/billets (BilletsDTO). */
export interface BilletCommandeLigne {
  id: number;
  codeBarre: string;
  commandeId: number;
  typeBilletId: number;
}

/** Tolère tableau, objet unique ou variantes de clés JSON côté serveur. */
export function normalizeCommandeBilletsPayload(data: unknown): BilletCommandeLigne[] {
  const raw = Array.isArray(data) ? data : data != null && typeof data === 'object' ? [data] : [];
  const out: BilletCommandeLigne[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const typeBilletId = Number(row.typeBilletId ?? row.type_billet_id);
    if (!Number.isFinite(typeBilletId) || typeBilletId <= 0) continue;
    const id = Number(row.id ?? row.Id);
    const cid = Number(row.commandeId ?? row.commande_id ?? 0);
    const codeBarre = String(row.codeBarre ?? row.code_barre ?? '');
    out.push({
      id: Number.isFinite(id) ? id : 0,
      codeBarre,
      commandeId: Number.isFinite(cid) ? cid : 0,
      typeBilletId,
    });
  }
  return out;
}

export const commandeService = {
  /**
   * Commande EN_ATTENTE en cours pour l'utilisateur (dérivée de GET /api/commandes).
   * Évite un appel dédié sujet à 404 (route / utilisateur introuvable) et fonctionne avec le backend existant.
   */
  getCommandeEnAttenteForUser: async (userId: number): Promise<Commande | null> => {
    const all = await fetchApi<Commande[]>('/commandes');
    const pending = all.filter(
      (c) => c.acheteurId === userId && c.statut === StatutCommande.EN_ATTENTE
    );
    if (pending.length === 0) return null;
    pending.sort((a, b) => b.id - a.id);
    return pending[0];
  },

  /**
   * Récupérer toutes les commandes (GET /api/commandes)
   */
  getAllCommandes: async (): Promise<Commande[]> => {
    return fetchApi<Commande[]>('/commandes');
  },

  /**
   * Commandes d’un utilisateur (GET /api/users/{userId}/commandes).
   */
  getCommandesByUserId: async (userId: number): Promise<Commande[]> => {
    return fetchApi<Commande[]>(`/users/${userId}/commandes`);
  },

  /**
   * Récupérer une commande par ID (GET /api/commandes/{id})
   */
  getCommandeById: async (id: number): Promise<Commande> => {
    return fetchApi<Commande>(`/commandes/${id}`);
  },

  /**
   * Billets associés à une commande (GET /api/commandes/{id}/billets).
   */
  getBilletsByCommandeId: async (commandeId: number): Promise<BilletCommandeLigne[]> => {
    const raw = await fetchApi<unknown>(`/commandes/${commandeId}/billets`);
    return normalizeCommandeBilletsPayload(raw);
  },

  /**
   * Créer une commande (POST /api/commandes)
   */
  createCommande: async (commandeData: Partial<Commande>): Promise<Commande> => {
    return fetchApi<Commande>('/commandes', {
      method: 'POST',
      body: JSON.stringify(commandeData),
    });
  },

  /**
   * Mettre à jour une commande (PUT /api/commandes/{id})
   */
  updateCommande: async (id: number, commandeData: Partial<Commande>): Promise<Commande> => {
    return fetchApi<Commande>(`/commandes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(commandeData),
    });
  },

  /**
   * Supprimer une commande (DELETE /api/commandes/{id})
   */
  deleteCommande: async (id: number): Promise<void> => {
    return fetchApi<void>(`/commandes/${id}`, {
      method: 'DELETE',
    });
  },
};
