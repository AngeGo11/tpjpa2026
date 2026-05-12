package jpa;


import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jpa.dao.EntityManagerHelper;
import jpa.model.*;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Date;
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
    


    private void insertData() {
        insertArtistes();
        insertUsers();
        insertOrganizers();
        insertEvents();
        insertTypeBillets();
        insertCommandes();
        insertBillets();
    }

	/**
	 * Crée des lignes dans les tables sans jointures : UserRole, RoleArtiste, TypeTicket, GenreMusical.
	 * Ne fait rien si des données existent déjà.
	 */
    // Dans JpaTest.insertData()
    private void insertArtistes() {
        if (manager.createQuery("SELECT a FROM Artiste a", Artiste.class).getResultList().isEmpty()) {
            manager.persist(new Artiste("Aya Nakamura", "https://i.scdn.co/image/ab6761610000e5eb1b1d1a60a2e95efc4eea8259"));
            manager.persist(new Artiste("Damso", "https://www.booska-p.com/wp-content/uploads/2022/05/damso-conseil-artiste-1024x750.jpg"));
            manager.persist(new Artiste("DJ Snake", "https://upload.wikimedia.org/wikipedia/commons/2/28/DJ_Snake_Paris_02.2020.jpg"));
            manager.persist(new Artiste("Stromae", "https://www.booska-p.com/wp-content/uploads/2022/03/Stromae-Multitude-Visu-News.jpg"));
            manager.persist(new Artiste("Ninho", "https://media.gqmagazine.fr/photos/649d9a7dce0c708b2278d7ff/1:1/w_1600%2Cc_limit/Ninho-OMEGA_MYKONOS_pierremouton-1840082.jpg"));
            manager.persist(new Artiste("The Weeknd", "https://www.booska-p.com/wp-content/uploads/2022/08/The-Weeknd-Visu-News.jpg"));
            manager.persist(new Artiste("Daft Punk", "https://www.booska-p.com/wp-content/uploads/2021/07/daft-punk-aurait-dit-non-un-gros-ch-que-649.jpg"));
            manager.persist(new Artiste("Rihanna", "https://startitkbs.org/wp-content/uploads/2024/05/rihanna.jpg"));
            manager.persist(new Artiste("Soolking", "https://www.radiofrance.fr/pikapi/images/05f7b4fa-3081-4482-b02f-6d38b0dd0359/1200x680"));
            manager.persist(new Artiste("Kaaris", "https://www.booska-p.com/wp-content/uploads/2023/08/kaaris-news-visu-1024x750.jpg"));

            System.out.println("Artistes : 10 artistes créés.");
        } else {
            System.out.println("Artistes : déjà présents, insertion ignorée.");
        }
    }


    private void insertUsers(){
        if (!manager.createQuery("SELECT u FROM Users u WHERE TYPE(u) = Users", Users.class).getResultList().isEmpty()) {
            System.out.println("Users : déjà présents.");
            return;
        }
        manager.persist(new Users("Alice Martin", "alice@mail.com", "alice123", Users.Role.Fan));
        manager.persist(new Users("Bob Leroy", "bob@mail.com", "bob123",  Users.Role.Fan));
        manager.persist(new Users("Claire Petit", "claire@mail.com", "claire123",  Users.Role.Fan));
        System.out.println("Users : OK");

    }


    private void insertOrganizers() {
        if (!manager.createQuery("SELECT o FROM Organizer o", Organizer.class).getResultList().isEmpty()) {
            System.out.println("Organizers : déjà présents.");
            return;
        }

        Organizer o1 = new Organizer("Pulse Events");
        o1.setNom("Camille Robert");
        o1.setEmail("camille.robert@pulse-events.fr");
        o1.setMdp("passCamille123");

        Organizer o2 = new Organizer("Aurora Live");
        o2.setNom("Mathis Bernard");
        o2.setEmail("mathis.bernard@aurora-live.fr");
        o2.setMdp("passMathis123");

        Organizer o3 = new Organizer("Nova Production");
        o3.setNom("Ines Laurent");
        o3.setEmail("ines.laurent@nova-prod.fr");
        o3.setMdp("passInes123");

        Organizer o4 = new Organizer("Hexagone Shows");
        o4.setNom("Lucas Martin");
        o4.setEmail("lucas.martin@hexagone-shows.fr");
        o4.setMdp("passLucas123");

        Organizer o5 = new Organizer("Sunset Booking");
        o5.setNom("Sarah Dubois");
        o5.setEmail("sarah.dubois@sunset-booking.fr");
        o5.setMdp("passSarah123");

        manager.persist(o1);
        manager.persist(o2);
        manager.persist(o3);
        manager.persist(o4);
        manager.persist(o5);

        System.out.println("Organizers : 5 organisateurs créés.");
    }

    private void insertEvents(){
        if (!manager.createQuery("SELECT e FROM Events e", Events.class).getResultList().isEmpty()) {
            System.out.println("Events : déjà présents.");
            return;
        }
        Organizer org1 = manager.createQuery("SELECT o FROM Organizer o ORDER BY o.id", Organizer.class)
                .setMaxResults(1)
                .getSingleResult();
        List<Artiste> artistes = manager.createQuery("SELECT a FROM Artiste a ORDER BY a.id", Artiste.class)
                .getResultList();
        Artiste main1 = artistes.get(0);
        Artiste guest1 = artistes.get(2);
        Events e1 = new Events(
                "Summer Vibes",
                "https://img.freepik.com/vecteurs-libre/illustration-ambiance-estivale-plate_23-2149410479.jpg?semt=ais_hybrid&w=740&q=80",
                "Accor Arena, Paris",
                toDate(2026, 6, 15),
                Time.valueOf(LocalTime.of(20, 0)),
                "Festival pop/electro",
                12000
        );
        e1.setOrganizer(org1);
        e1.setGenreMusical(Events.GenreMusical.POP);
        e1.setArtistePrincipal(main1);
        e1.getInvites().add(guest1);


        Artiste main2 = artistes.get(1);
        Artiste guest2 = artistes.get(3);
        Events e2 = new Events(
                "Rap Night",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_ilBQY99NlFUWSPsbEH1gAwX8WTS6MK7IhQ&s",
                "Zénith, Lyon",
                toDate(2026, 7, 2),
                Time.valueOf(LocalTime.of(21, 0)),
                "Soirée rap",
                8000
        );
        e2.setOrganizer(org1);
        e2.setGenreMusical(Events.GenreMusical.RAP);
        e2.setArtistePrincipal(main2);
        e2.getInvites().add(guest2);
        manager.persist(e1);
        manager.persist(e2);
        System.out.println("Events : OK");

    }


    private void insertTypeBillets(){
        if (!manager.createQuery("SELECT t FROM TypeBillet t", TypeBillet.class).getResultList().isEmpty()) {
            System.out.println("TypeBillets : déjà présents.");
            return;
        }
        List<Events> events = manager.createQuery("SELECT e FROM Events e ORDER BY e.id", Events.class).getResultList();
        for (Events e : events) {
            manager.persist(new TypeBillet(e, TypeBillet.Type.GrandPublic, 49.99, 500));
            manager.persist(new TypeBillet(e, TypeBillet.Type.VIP, 99.99, 150));
            manager.persist(new TypeBillet(e, TypeBillet.Type.VVIP, 199.99, 50));
        }
        System.out.println("TypeBillets : OK");

    }


    private void insertCommandes(){
        if (!manager.createQuery("SELECT c FROM Commande c", Commande.class).getResultList().isEmpty()) {
            System.out.println("Commandes : déjà présentes.");
            return;
        }
        List<Users> users = manager.createQuery("SELECT u FROM Users u WHERE TYPE(u) = Users ORDER BY u.id", Users.class)
                .getResultList();
        Users u1 = users.get(0);
        Users u2 = users.get(1);
        Users u3 = users.get(2);
        Commande c1 = new Commande();
        c1.setDate(new Date());
        c1.setMontantTotal(149.98);
        c1.setAcheteur(u1);
        c1.setStatut(Commande.StatutCommande.VALIDEE);
        Commande c2 = new Commande();
        c2.setDate(new Date());
        c2.setMontantTotal(99.99);
        c2.setAcheteur(u2);
        c2.setStatut(Commande.StatutCommande.VALIDEE);
        Commande c3 = new Commande();
        c3.setDate(new Date(System.currentTimeMillis() - 6L * 60 * 60 * 1000));
        c3.setMontantTotal(59.50);
        c3.setAcheteur(u3);
        c3.setStatut(Commande.StatutCommande.ANNULE);
        Commande c4 = new Commande();
        c4.setDate(new Date());
        c4.setMontantTotal(219.90);
        c4.setAcheteur(u1);
        c4.setStatut(Commande.StatutCommande.REMBOURSE);
        manager.persist(c1);
        manager.persist(c2);
        manager.persist(c3);
        manager.persist(c4);
        System.out.println("Commandes : OK");

    }


    private void insertBillets(){
        if (!manager.createQuery("SELECT b FROM Billets b", Billets.class).getResultList().isEmpty()) {
            System.out.println("Billets : déjà présents.");
            return;
        }
        List<Commande> commandes = manager.createQuery("SELECT c FROM Commande c ORDER BY c.id", Commande.class)
                .getResultList();
        List<TypeBillet> types = manager.createQuery("SELECT t FROM TypeBillet t ORDER BY t.id", TypeBillet.class)
                .getResultList();
        Commande c1 = commandes.get(0);
        Commande c2 = commandes.get(1);
        TypeBillet t1 = types.get(0); // GP event 1
        TypeBillet t2 = types.get(1); // VIP event 1
        TypeBillet t3 = types.get(3); // GP event 2 (selon ordre de persist)
        manager.persist(new Billets("BIL-0001-2026", c1, t1));
        manager.persist(new Billets("BIL-0002-2026", c1, t2));
        manager.persist(new Billets("BIL-0003-2026", c2, t3));
        System.out.println("Billets : OK");
    }
    /* -------------------- UTILITAIRE DATE -------------------- */
    private Date toDate(int year, int month, int day) {
        return Date.from(
                LocalDate.of(year, month, day)
                        .atStartOfDay(ZoneId.systemDefault())
                        .toInstant()
        );
    }






}





