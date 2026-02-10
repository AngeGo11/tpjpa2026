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
			test.insertData();
		} catch (Exception e) {
			e.printStackTrace();
		}
		tx.commit();

			
   	 manager.close();
		EntityManagerHelper.closeEntityManagerFactory();
		System.out.println(".. done");
	}

	/**
	 * Crée des lignes dans les tables sans jointures : UserRole, RoleArtiste, TypeTicket, GenreMusical.
	 * Ne fait rien si des données existent déjà.
	 */
	private void insertData() {



		// TypeTicket
		if (manager.createQuery("SELECT t FROM TypeTicket t", TypeTicket.class).getResultList().isEmpty()) {
			manager.persist(new TypeTicket("Standard"));
			manager.persist(new TypeTicket("VIP"));
			manager.persist(new TypeTicket("Early Bird"));
			System.out.println("TypeTicket : 3 types créés.");
		}


	}
}





