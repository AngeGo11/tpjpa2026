package jpa.dao;

import jakarta.persistence.EntityTransaction;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import jpa.model.Events;
import jpa.model.Users;

import java.util.List;

public class UsersDAO extends AbstractJpaDao<Long, Users> {
    public UsersDAO() {
        super.setClazz(Users.class);
    }


    // Requête Criteria pour récupérer les Users pour un utilisateur
    public List<Users> getUsers(){
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Users> cq = cb.createQuery(Users.class);
        Root<Users> root = cq.from(Users.class);
        cq.select(root);
        return entityManager.createQuery(cq).getResultList();
    }

    /**
     * Événements favoris d’un utilisateur
     */
    public List<Events> findFavoriteEvents(Long userId) {
        return entityManager
                .createQuery(
                        "select distinct e from Users u join u.favoriteEvents e where u.id = :uid order by e.date",
                        Events.class)
                .setParameter("uid", userId)
                .getResultList();
    }

    public boolean hasFavoriteEvent(Long userId, Long eventId) {
        Long count =
                entityManager
                        .createQuery(
                                "select count(e.id) from Users u join u.favoriteEvents e where u.id = :uid and e.id = :eid",
                                Long.class)
                        .setParameter("uid", userId)
                        .setParameter("eid", eventId)
                        .getSingleResult();
        return count != null && count > 0;
    }

    /**
     * Mettre en favori un événement.
     */
    public void addFavoriteEvent(Long userId, Long eventId) {
        EntityTransaction tx = entityManager.getTransaction();
        tx.begin();
        try {
            Users user = entityManager.find(Users.class, userId);
            Events event = entityManager.find(Events.class, eventId);
            if (user == null || event == null) {
                tx.rollback();
                throw new IllegalStateException("Utilisateur ou événement introuvable");
            }
            if (!user.getFavoriteEvents().contains(event)) {
                user.getFavoriteEvents().add(event);
                event.getFavoritedByUsers().add(user);
            }
            tx.commit();
        } catch (RuntimeException e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        }
    }

    /**
     * Retire un favori .
     */
    public void removeFavoriteEvent(Long userId, Long eventId) {
        EntityTransaction tx = entityManager.getTransaction();
        tx.begin();
        try {
            Users user = entityManager.find(Users.class, userId);
            Events event = entityManager.find(Events.class, eventId);
            if (user == null || event == null) {
                tx.rollback();
                throw new IllegalStateException("Utilisateur ou événement introuvable");
            }
            user.getFavoriteEvents().remove(event);
            event.getFavoritedByUsers().remove(user);
            tx.commit();
        } catch (RuntimeException e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        }
    }

}

