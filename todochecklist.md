# TODO Checklist - Backend SIR

Checklist basee sur les consignes de rendu final + etat actuel du projet.

## 1) Partie JPA (MOR)

- [x] MOR (entites) fonctionnel present (`Users`, `Organizer`, `Events`, `Artiste`, `TypeBillet`, `Commande`, `Billets`).
- [x] Au moins un heritage present (`Organizer Voirtends Users` avec `@Inheritance(strategy = InheritanceType.JOINED)`).
- [x] Au moins une relation bidirectionnelle (`mappedBy`) presente (plusieurs Voiristantes: `Users <-> Commande`, `Organizer <-> Events`, `Commande <-> Billets`).


## 2) Partie DAO

- [x] Une DAO par entite (7 DAOs metier presentes).
- [x] Au moins une requete JPQL (Voir: `ArtisteDAO.findArtistsByName`).
- [x] Au moins une requete nommee (Voir: `@NamedQuery` sur `Commande` + `CommandeDAO.findByStatut`).
- [x] Au moins une Criteria Query (Voir: `UsersDAO.getUsers`, `EventsDAO.findEventsByGenre`).
- [x] Au moins une DAO avec methodes metier (Voir: `ArtisteDAO`, `EventsDAO`, `CommandeDAO`).

## 3) Partie API REST

- [x] Un controller par entite (`ArtisteResource`, `BilletsResource`, `CommandeResource`, `EventsResource`, `OrganizerResource`, `TypeBilletResource`, `UsersResource`).
- [x] Au moins un controller avec endpoints metier (Voir: `EventsResource` / `CommandeResource`).
- [x] Au moins un controller utilisant un DTO (en pratique presque tous les controllers utilisent des DTO).
- [x] Documentations OpenAPI complete sur tous les controllers (Voir: `controller/*` ).


## 4) Documentation de rendu

- [x] README present avec modele metier, relations, endpoints et Voirplications.
- [x] Diagramme de classe présent.
