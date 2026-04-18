package jpa.dao;

import jakarta.persistence.TypedQuery;
import jpa.model.Billets;

import java.util.List;

public class BilletsDAO extends AbstractJpaDao<Long, Billets> {

    public BilletsDAO() {
        super.setClazz(Billets.class);
    }

    /**
     * Tous les billets dont la commande appartient à l’utilisateur donné
     * (jointure sur les associations JPA {@code commande} et {@code acheteur}).
     */
    public List<Billets> getBilletsByUser(Long idUser) {
        String jpql = "SELECT b FROM Billets b "
                + "JOIN b.commande c "
                + "JOIN c.acheteur u "
                + "WHERE u.id = :idUser";
        TypedQuery<Billets> query = entityManager.createQuery(jpql, Billets.class);
        query.setParameter("idUser", idUser);
        return query.getResultList();
    }
}
