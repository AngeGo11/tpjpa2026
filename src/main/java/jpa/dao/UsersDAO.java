package jpa.dao;

import jpa.model.Users;

public class UsersDAO extends AbstractJpaDao<Long, Users> {
    public UsersDAO() {
        super.setClazz(Users.class);
    }
}
