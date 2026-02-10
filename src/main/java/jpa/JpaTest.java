package jpa;


import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;

import java.util.List;

public class JpaTest {


	private EntityManager manager;

	public JpaTest(EntityManager manager) {
		this.manager = manager;
	}
	/**
	 * @param args
	 */
	public static void main(String[] args) {
			EntityManager manager = EntityManagerHelper.getEntityManager();

		JpaTest test = new JpaTest(manager);

		EntityTransaction tx = manager.getTransaction();
		tx.begin();
		try {
			test.createRolesEtTablesSansJointures();
		} catch (Exception e) {
			e.printStackTrace();
		}
		tx.commit();

			
   	 manager.close();
		EntityManagerHelper.closeEntityManagerFactory();
		System.out.println(".. done");
	}

/*
    private void createEmployees() {
        int numOfEmployees = manager.createQuery("Select a From Employee a", Employee.class).getResultList().size();
        if (numOfEmployees == 0) {
            Department department = new Department("java");
            manager.persist(department);

            manager.persist(new Employee("Jakab Gipsz",department));
            manager.persist(new Employee("Captain Nemo",department));

        }
    }

    private void listEmployees() {
        List<Employee> resultList = manager.createQuery("Select a From Employee a", Employee.class).getResultList();
        System.out.println("num of employess:" + resultList.size());
        for (Employee next : resultList) {
            System.out.println("next employee: " + next);
        }
    } */

	/**
	 * Crée des lignes dans les tables sans jointures : UserRole, RoleArtiste, TypeTicket, GenreMusical.
	 * Ne fait rien si des données existent déjà.
	 */
	private void createRolesEtTablesSansJointures() {
		// UserRole (rôles utilisateur)
		if (manager.createQuery("SELECT r FROM UserRole r", UserRole.class).getResultList().isEmpty()) {
			manager.persist(new UserRole("ADMIN"));
			manager.persist(new UserRole("ORGANISATEUR"));
			manager.persist(new UserRole("CLIENT"));
			System.out.println("UserRole : 3 rôles créés.");
		}

		// RoleArtiste (rôles artiste)
		if (manager.createQuery("SELECT r FROM RoleArtiste r", RoleArtiste.class).getResultList().isEmpty()) {
			manager.persist(new RoleArtiste("Headliner"));
			manager.persist(new RoleArtiste("Support"));
			manager.persist(new RoleArtiste("DJ"));
			System.out.println("RoleArtiste : 3 rôles créés.");
		}

		// TypeTicket
		if (manager.createQuery("SELECT t FROM TypeTicket t", TypeTicket.class).getResultList().isEmpty()) {
			manager.persist(new TypeTicket("Standard"));
			manager.persist(new TypeTicket("VIP"));
			manager.persist(new TypeTicket("Early Bird"));
			System.out.println("TypeTicket : 3 types créés.");
		}

		// GenreMusical
		if (manager.createQuery("SELECT g FROM GenreMusical g", GenreMusical.class).getResultList().isEmpty()) {
			manager.persist(new GenreMusical("Rock"));
			manager.persist(new GenreMusical("Electro"));
			manager.persist(new GenreMusical("Jazz"));
			manager.persist(new GenreMusical("Hip-Hop"));
			System.out.println("GenreMusical : 4 genres créés.");
		}
	}
}





