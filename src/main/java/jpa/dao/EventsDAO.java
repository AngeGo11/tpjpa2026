package jpa.dao;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import jpa.model.Events;

import java.util.List;

public class EventsDAO extends AbstractJpaDao<Long, Events> {
    public EventsDAO() {
        super.setClazz(Events.class);
    }


// Requête Criteria pour récupérer les événements par genre musical
    public List<Events> findEventsByGenre(Events.GenreMusical genre){
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Events> cq = cb.createQuery(Events.class);
        Root<Events> root = cq.from(Events.class);
        cq.select(root).where(cb.equal(root.get("genreMusical"), genre));
        return entityManager.createQuery(cq).getResultList();
    }
}
