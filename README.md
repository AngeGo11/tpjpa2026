# Documentation technique — Backend Billetterie / Gestion d'événements

---

## 1. Présentation du Projet

Implémentation d'une **API REST** dédiée à la **gestion de la vente de tickets de Concerts**. Il permet de gérer l'**organisation de concerts**, les **artistes** qui s’y produisent, les **organisateurs** qui les créent, et les **utilisateurs (clients)** qui achètent des billets. Les rôles principaux sont : **organisateur** (création d’événements et définition des types de billets) et **acheteur/client** (utilisateur passant des commandes et détenant des billets). L’API expose des ressources pour les artistes, événements, types de billets, commandes, billets, utilisateurs et organisateurs, avec une documentation OpenAPI (Swagger).

---

## 2. Modèle Métier 

### 2.1 Concepts clés et interactions

- **Utilisateur (User)** : compte générique (nom, email, mot de passe). Il peut être simple acheteur ou **organisateur**.
- **Organisateur (Organizer)** : sous-type d’utilisateur, identifié par un nom d’organisation. Il crée et gère des **événements**.
- **Événement (Event)** : manifestation (nom, lieu, date, heure, description, nombre de places, genre musical). Il appartient à un organisateur, a un **artiste principal** obligatoire et éventuellement des **artistes invités**.
- **Artiste** : identité artistique (nom, photo). Il peut être **artiste principal** d’un événement ou **invité** (guest) sur plusieurs événements.
- **Type de billet (TypeBillet)** : tarif lié à un événement (ex. GrandPublic, VIP, VVIP), avec prix et stock.
- **Commande** : achat effectué par un utilisateur (acheteur), avec date, montant total et statut (ANNULE, REMBOURSE, VALIDEE). Une commande peut regrouper plusieurs **billets**.
- **Billet** : titre d’entrée physique/logique (code-barres unique), rattaché à une commande et à un type de billet.

### 2.2 Héritage utilisateur

Le modèle utilise une **héritage par jointure** (JPA `JOINED`) :

- **Users** : table de base (`users`) avec `id`, `nom`, `email`, `mdp`, et la liste des commandes (relation 1–n).
- **Organizer** : sous-classe avec `@PrimaryKeyJoinColumn(name = "id")`, table `organizers`, ajout de `nom_organisation` et relation 1–n vers les événements.

Un organisateur est donc un utilisateur avec des champs et des responsabilités supplémentaires (création d’événements).

### 2.3 Artiste principal vs invités (Guests) pour un Event

- **Artiste principal** : relation **ManyToOne** obligatoire (`nullable = false`) entre `Event` et `Artiste`. Chaque événement a exactement un artiste principal.
- **Invités** : relation **ManyToMany** unidirectionnelle entre `Event` et `Artiste`, via la table d’association `event_guests`. Un événement peut avoir zéro, un ou plusieurs invités ; un artiste peut être invité sur plusieurs événements.

La distinction métier : l’artiste principal est la tête d’affiche ; les invités sont les artistes additionnels (featurings, première partie, etc.).

### 2.4 Cycle de vie d’un achat : TypeBillet → Commande → Billet

1. **TypeBillet** : défini par l’organisateur pour un **événement** donné (type GrandPublic/VIP/VVIP, prix, stock). C’est le « catalogue » de ce qui peut être acheté pour cet événement.
2. **Commande** : créée par un **utilisateur** (acheteur). Elle contient la date, le montant total et le statut. La commande est le panier/transaction qui regroupe plusieurs lignes d’achat.
3. **Billet** : chaque billet est émis pour une **commande** et un **TypeBillet**. Le code-barres identifie le billet de façon unique. En pratique, l’acheteur choisit un ou plusieurs types de billets (avec quantités), une commande est créée, puis les billets sont créés et rattachés à cette commande et aux types de billets choisis.

Résumé : **TypeBillet** = offre par événement → **Commande** = achat par un utilisateur → **Billet** = instance concrète (un billet = une entrée d’un type donné dans une commande).

### 2.5 Relations bidirectionnelles (mappedBy)

Le modèle utilise **trois relations bidirectionnelles** JPA (côté « un » et côté « plusieurs » navigables), avec `mappedBy` côté collection :

- **Users ↔ Commande** : `Users` a `@OneToMany(mappedBy = "acheteur")` sur ses commandes ; `Commande` a `@ManyToOne` sur `acheteur`. Un utilisateur peut accéder à ses commandes, une commande à son acheteur.
- **Organizer ↔ Events** : `Organizer` a `@OneToMany(mappedBy = "organizer")` sur ses événements ; `Events` a `@ManyToOne` sur `organizer`. Un organisateur peut accéder à ses événements, un événement à son organisateur.
- **Commande ↔ Billets** : `Commande` a `@OneToMany(mappedBy = "commande")` sur ses billets ; `Billets` a `@ManyToOne` sur `commande`. Une commande peut accéder à ses billets, un billet à sa commande.

Ces relations sont en cascade (CascadeType.ALL) et orphelin-suppression (orphanRemoval = true) côté collection.

### 2.6 Autres points

- **Genres musicaux** : énumération sur l’événement (POP, ROCK, SHATTA, JAZZ, HIP_HOP, ELECTRO, RAP).
- **Statut de commande** : ANNULE, REMBOURSE, VALIDEE — permet de gérer annulations et remboursements sans supprimer l’historique.

---

## 3. Diagramme de Classes

Le diagramme ci-dessous représente les entités JPA principales et leurs relations (cardinalités et héritage).

**Entités** : sept classes sont représentées — `Users`, `Organizer`, `Artiste`, `Events`, `TypeBillet`, `Commande`, `Billets`. Chaque entité affiche ses attributs principaux (identifiant, champs métier, énumérations).

**Héritage** : une flèche de spécialisation relie `Organizer` à `Users` (héritage par jointure) : tout organisateur est un utilisateur, avec des attributs et des associations supplémentaires.

**Relations et cardinalités** :
- **Users 1 → n Commande** : un utilisateur (acheteur) a plusieurs commandes ; chaque commande a un seul acheteur.
- **Organizer 1 → n Events** : un organisateur gère plusieurs événements ; chaque événement a un seul organisateur.
- **Events n → 1 Artiste** (artiste principal) : chaque événement a un artiste principal ; un artiste peut être tête d’affiche de plusieurs événements.
- **Events n ↔ n Artiste** (invités) : un événement peut avoir plusieurs invités, un artiste peut être invité à plusieurs événements (table d’association `event_guests`).
- **TypeBillet n → 1 Events** : chaque type de billet est rattaché à un événement ; un événement a plusieurs types de billets.
- **Commande 1 → n Billets** : une commande contient plusieurs billets ; chaque billet appartient à une commande.
- **Billets n → 1 TypeBillet** : chaque billet est d’un type donné ; un type de billet peut être associé à plusieurs billets.

La lecture des flèches et des multiplicités (1, n) permet de vérifier la cohérence du modèle avec les relations JPA (OneToMany, ManyToOne, ManyToMany) décrites en section 2.

---

## 4. Couche DAO (`jpa.dao`)

La couche **DAO** (Data Access Object) assure l’accès aux données et isole la persistance JPA du reste de l’application.

- **`IGenericDao<K, T>`** : interface générique avec les opérations CRUD.
- **`AbstractJpaDao<K, T>`** : implémentation générique qui utilise un `EntityManager` pour exécuter les requêtes JPA.
- **`EntityManagerHelper`** : fournit un `EntityManager` à partir de l’unité de persistance `dev`.
- **DAOs concrets** : une classe par entité principale — `ArtisteDAO`, `BilletsDAO`, `CommandeDAO`, `EventsDAO`, `OrganizerDAO`, `TypeBilletDAO`, `UsersDAO`. Chacune étend `AbstractJpaDao`. Certaines comportent des méthodes métier en plus.

Les ressources REST instancient ces DAOs pour charger ou modifier les entités, puis convertissent les entités en DTO pour la réponse HTTP.

---

## 5. Couche REST (`jpa.rest`)

La couche **REST** expose l’API HTTP. Elle est organisée dans le package **`jpa.rest`**.

- **Point d’entrée** : `RestApplication` (JAX-RS `Application`) déclare le préfixe **`/api`** et enregistre toutes les classes de ressources et Swagger (`OpenApiResource`, `SwaggerResource`). Le serveur est lancé par `RestServer` (Resteasy sur Undertow, port 8080).
- **Ressources (endpoints)** : une classe par ressource métier. Les réponses sont construites à partir des **DTO** (pas d’exposition directe des entités JPA).
- **DTO** : les objets échangés avec le client. Ils contiennent des champs et des identifiants pour les relations et sont sérialisés en JSON ou XML . Les ressources font la conversion entité ↔ DTO.
- **Documentation** : `SwaggerResource` sert la page Swagger UI ; l’API OpenAPI est exposée en JSON (ex. `/openapi.json`) pour une documentation interactive des endpoints.

---

## 6. Endpoints de l’API (Backend)

L’API est exposée sous le préfixe **`/api`**. Les ressources sont implémentées en **JAX-RS** (Resteasy). Format de réponse : JSON et/ou XML selon les ressources. Aucune authentification ni rôles ne sont gérés dans le code actuel.

| Méthode HTTP | Endpoint (URL) | Description |
|--------------|----------------|-------------|
| **Artistes** | | | |
| GET | `/api/artiste/` | Liste tous les artistes | 
| GET | `/api/artiste/{artisteId}` | Détail d’un artiste par ID | 
| POST | `/api/artiste` | Créer un artiste | 
| DELETE | `/api/artiste/{artisteId}` | Supprimer un artiste | 
| **Événements** | | | |
| GET | `/api/events/` | Liste tous les événements | 
| GET | `/api/events/{eventId}` | Détail d’un événement par ID | 
| GET | `/api/events/{eventId}/organizer` | Organisateur de l’événement | 
| GET | `/api/events/events/{eventId}/main-artist` | Artiste principal de l’événement | 
| POST | `/api/events` | Créer un événement | 
| DELETE | `/api/events/{eventId}` | Supprimer un événement | 
| **Organisateurs** | | | |
| GET | `/api/organizer/` | Liste tous les organisateurs | 
| GET | `/api/organizer/{organizerId}` | Détail d’un organisateur par ID | 
| GET | `/api/organizer/organizer/{organizerId}/events` | Événements d’un organisateur | 
| POST | `/api/organizer` | Créer un organisateur | 
| DELETE | `/api/organizer/{organizerId}` | Supprimer un organisateur | 
| **Types de billet** | | | |
| GET | `/api/type_billet/` | Liste tous les types de billets | 
| GET | `/api/type_billet/{typeId}` | Détail d’un type de billet par ID | 
| GET | `/api/type_billet/type_billet/{typeId}/events` | Événement associé au type de billet | 
| POST | `/api/type_billet` | Créer un type de billet | 
| **Commandes** | | | |
| GET | `/api/commandes/` | Liste toutes les commandes | 
| GET | `/api/commandes/{commandeId}` | Détail d’une commande par ID | 
| GET | `/api/commandes/commandes/{commandeId}/billets` | Billets d’une commande | 
| POST | `/api/commandes` | Créer une commande | 
| DELETE | `/api/commandes/{commandeId}` | Supprimer une commande | 
| **Billets** | | | |
| GET | `/api/billets/` | Liste tous les billets | 
| GET | `/api/billets/{billetId}` | Détail d’un billet par ID | 
| GET | `/api/billets/billets/{billetId}/type_billet` | Type de billet d’un billet | 
| POST | `/api/billets` | Créer un billet | 
| **Utilisateurs** | | | |
| GET | `/api/users/` | Liste tous les utilisateurs | 
| GET | `/api/users/{userId}` | Détail d’un utilisateur par ID | 
| GET | `/api/users/users/{userId}/commandes` | Commandes d’un utilisateur | 
| POST | `/api/users` | Créer un utilisateur | 
| **Documentation** | | | |
| GET | `/api` | Page Swagger UI (documentation interactive) | 
| GET | `/openapi.json` | Spécification OpenAPI (JSON) | 

---

## 7. Technologies Utilisées

- **Java 11** (Maven compiler source/target)
- **Maven** (build et gestion des dépendances)
- **Jakarta Persistence (JPA) 3.0** avec **Hibernate 6.2.7** comme implémentation
- **HSQLDB 2.7.2** (base de données par défaut pour dev/prod)
- **Jakarta WS-RS (JAX-RS) 3.1.0** (API REST)
- **Swagger / OpenAPI 3** (swagger-jaxrs2-jakarta 2.2.15, swagger-jaxrs2-servlet-initializer-v2) pour documentation d’API
- **Jackson 2.16.1** (jackson-core, jackson-databind) pour sérialisation JSON
- **JAXB** (via resteasy-jaxb-provider) pour sérialisation XML
