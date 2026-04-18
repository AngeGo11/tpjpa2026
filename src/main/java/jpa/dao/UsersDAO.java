package jpa.dao;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
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


}

