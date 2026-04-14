import { fetchApi } from './api';
import { User } from './userService';
import { Billet } from './billetService';

export enum StatutCommande {
  ANNULE = 'ANNULE',
  REMBOURSE = 'REMBOURSE',
  VALIDEE = 'VALIDEE'
}

/**
 * Correspond à l'entité Commande.java du backend.
 */
export interface Commande {
  id: number;
  date: string; // ISO string form backend
  montantTotal: number;
  acheteur: User; // Ou number si seul l'ID est retourné
  statut: StatutCommande;
  billets: Billet[]; // Optionnel, selon la façon dont le backend gère les fetch paresseux
}

export const commandeService = {
  /**
   * Récupérer toutes les commandes (GET /api/commandes)
   */
  getAllCommandes: async (): Promise<Commande[]> => {
    return fetchApi<Commande[]>('/commandes');
  },

  /**
   * Récupérer une commande par ID (GET /api/commandes/{id})
   */
  getCommandeById: async (id: number): Promise<Commande> => {
    return fetchApi<Commande>(`/commandes/${id}`);
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
