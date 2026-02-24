package jpa.dao;

import jpa.model.Organizer;

public class OrganizerDAO extends AbstractJpaDao<Long, Organizer> {
    public OrganizerDAO() {
        super.setClazz(Organizer.class);
    }
}
