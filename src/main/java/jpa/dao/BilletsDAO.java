package jpa.dao;

import jpa.model.Billets;

public class BilletsDAO extends AbstractJpaDao<Long, Billets> {

    public BilletsDAO() {
        super.setClazz(Billets.class);
    }
}
