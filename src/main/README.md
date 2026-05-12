# FestiGo — Backend (API REST JPA / Hibernate)

Ce dossier contient **tout le code source et les ressources** du backend Java (API REST JPA / Hibernate). Le build Maven se fait **à la racine du dépôt**.

---

## Persistance (`persistence.xml`)

- **`dev`** (utilisée par défaut dans `EntityManagerHelper`) : HSQLDB en mode serveur `jdbc:hsqldb:hsql://localhost/`, schéma **`create`** au démarrage.
- **`prod`** : même URL HSQLDB, schéma **`update`**.
- **`mysql`** : MySQL local (`jdbc:mysql://localhost/mydatabase`), schéma **`update`**.

Pour travailler sur ce backend, le **serveur HSQLDB** doit être joignable (voir scripts `run-hsqldb-server.sh` / `start.sh` à la racine du dépôt).

---

## Compiler et lancer l’API

Depuis la **racine du dépôt** :

```bash
mvn -q compile dependency:copy-dependencies
java -cp "target/classes:target/dependency/*" jpa.RestServer
```

L’API est alors disponible sur **http://localhost:8080** sous **`/api/...`**. La spécification OpenAPI est typiquement exposée en **`/openapi.json`**.

---

## Données de démonstration

Toujours depuis la racine, avec HSQLDB déjà démarré et le classpath Maven à jour :

```bash
java -cp "target/classes:target/dependency/*" jpa.JpaTest
```

`JpaTest` insère des lignes **uniquement si les tables correspondantes sont vides** (pas de doublons automatiques). Les URLs d’images de démo pointent vers des services publics (ex. Picsum) utilisables dans le navigateur.

---

## Documentation détaillée

Le **README à la racine** du projet décrit le modèle métier, le tableau des endpoints, les technologies et la structure globale du dépôt (y compris le frontend). Ce fichier se limite au périmètre **`src/main`**.

---

## Rappel rapide des packages `jpa.rest`

Les ressources exposées sous `/api` incluent notamment : `auth` (login / register), `artiste`, `events`, `organizer`, `type_billet`, `commandes`, `billets`, `users` (dont favoris événements sous `/users/{id}/favorites/events/...`). Le détail des verbes HTTP et des corps JSON est dans le README racine et dans les annotations OpenAPI sur chaque méthode.

---

## Structure backend

```
src/main/
├── README.md
├── java/jpa/
│   ├── JpaTest.java
│   ├── RestApplication.java
│   ├── RestServer.java
│   ├── dao/
│   │   ├── AbstractJpaDao.java
│   │   ├── ArtisteDAO.java
│   │   ├── BilletsDAO.java
│   │   ├── CommandeDAO.java
│   │   ├── EntityManagerHelper.java
│   │   ├── EventsDAO.java
│   │   ├── IGenericDao.java
│   │   ├── OrganizerDAO.java
│   │   ├── TypeBilletDAO.java
│   │   └── UsersDAO.java
│   ├── dto/
│   │   ├── ArtisteDTO.java
│   │   ├── BilletsDTO.java
│   │   ├── CommandeDTO.java
│   │   ├── EventsDTO.java
│   │   ├── OrganizerDTO.java
│   │   ├── TypeBilletDTO.java
│   │   └── UsersDTO.java
│   ├── model/
│   │   ├── Artiste.java
│   │   ├── Billets.java
│   │   ├── Commande.java
│   │   ├── Events.java
│   │   ├── Organizer.java
│   │   ├── TypeBillet.java
│   │   └── Users.java
│   ├── rest/
│   │   ├── ArtisteResource.java
│   │   ├── BilletsResource.java
│   │   ├── CommandeResource.java
│   │   ├── CorsFilter.java
│   │   ├── EventsResource.java
│   │   ├── LoginResource.java
│   │   ├── OrganizerResource.java
│   │   ├── SwaggerResource.java
│   │   ├── TypeBilletResource.java
│   │   └── UsersResource.java
│   └── service/
│       └── LocalImageStorageService.java
├── resources/
│   ├── log4j.properties
│   └── META-INF/
│       └── persistence.xml
└── webapp/
    └── swagger/
        └── index.html
```
