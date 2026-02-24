package jpa.dao;

import jpa.model.Artiste;

import java.util.List;

public class ArtisteDAO extends AbstractJpaDao<Long, Artiste> {

    public ArtisteDAO() {
        super.setClazz(Artiste.class);
    }



// Requête JPQL pour récupérer les artistes par nom
public List<Artiste> findArtistsByName(String nom) {
    String jpql = "SELECT a FROM Artiste a WHERE a.nomArtiste LIKE :nomArtiste";
    return entityManager.createQuery(jpql, Artiste.class)
            .setParameter("nomArtiste", "%" + nom + "%")
            .getResultList();
}

}


