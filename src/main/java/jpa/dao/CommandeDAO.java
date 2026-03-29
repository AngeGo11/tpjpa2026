package jpa.dao;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
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


    // Requête Criteria pour récupérer les commandes pour un utilisateur
    public List<Commande> getCommandesByUser(Long idUser){
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Commande> cq = cb.createQuery(Commande.class);
        Root<Commande> root = cq.from(Commande.class);
        cq.select(root).where(cb.equal(root.get("id"), idUser));
        return entityManager.createQuery(cq).getResultList();
    }
}
