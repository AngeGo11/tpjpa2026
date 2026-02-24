package jpa.dao;

import jpa.model.Commande;

import java.util.List;

public class CommandeDAO extends AbstractJpaDao<Long, Commande>  {
    public CommandeDAO() {
        super.setClazz(Commande.class);
    }



// Requête Nommées pour récupérer les commandes par statut
    public List<Commande> findByStatut(Commande.StatutCommande statut){
        return entityManager.createNamedQuery("Commande.findByStatut", Commande.class)
        .setParameter("statut", statut)
        .getResultList();
    }
}
