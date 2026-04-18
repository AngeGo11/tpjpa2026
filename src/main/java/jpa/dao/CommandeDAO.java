package jpa.dao;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import jpa.model.Commande;

import java.util.List;
import java.util.Optional;

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
        cq.select(root).where(cb.equal(root.get("acheteur").get("id"), idUser));
        return entityManager.createQuery(cq).getResultList();
    }

    /** Au plus une commande « panier » : la plus récente en statut EN_ATTENTE pour cet acheteur. */
    public Optional<Commande> findEnAttenteByAcheteurId(Long acheteurId) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Commande> cq = cb.createQuery(Commande.class);
        Root<Commande> root = cq.from(Commande.class);
        cq.select(root).where(
                cb.and(
                        cb.equal(root.get("acheteur").get("id"), acheteurId),
                        cb.equal(root.get("statut"), Commande.StatutCommande.EN_ATTENTE)
                )
        );
        cq.orderBy(cb.desc(root.get("id")));
        List<Commande> list = entityManager.createQuery(cq).setMaxResults(1).getResultList();
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
