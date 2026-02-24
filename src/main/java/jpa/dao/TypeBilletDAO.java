package jpa.dao;

import jpa.model.TypeBillet;

public class TypeBilletDAO extends AbstractJpaDao<Long, TypeBillet> {
    public TypeBilletDAO() {
        super.setClazz(TypeBillet.class);
    }
}
