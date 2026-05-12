# FestiGo — Frontend ( REACT)


### Installation

1. Ouvrez un terminal dans le dossier `frontend` :
   ```bash
   cd frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```

### Lancement en mode développement

Démarrez le serveur Vite :
```bash
npm run dev
```
L'application sera accessible sur [http://localhost:5173](http://localhost:5173) (ou le port indiqué dans le terminal).

---

## Technologies utilisées

- **Framework :** React 18
- **Langage :** TypeScript
- **Build Tool :** Vite 6
- **Styling :** Tailwind CSS 4
- **Composants UI :** Radix UI (accessible & sans style de base), stylisé façon `shadcn/ui`
- **Icônes :** Lucide React
- **Graphiques :** Recharts (pour le tableau de bord organisateur)
- **Réseau :** Fetch API natif (via un wrapper personnalisé dans `src/services/api.ts`)

---

## Architecture du dossier `src`

```text
src/
├── App.tsx                      # Racine : vues fan / organisateur, login, détails événement, modales
├── Main.tsx                     # Point d'entrée React (montage de l’app)
├── components/
│   ├── ui/                      # Primitives Radix + styles 
│   ├── admin-event-validation.tsx
│   ├── commande-recap.tsx       # Récapitulatif / finalisation de commande
│   ├── event-details.tsx        # Fiche détaillée d’un événement (billets, favoris)
│   ├── festigo-digital-pass.tsx # Pass / billet numérique
│   ├── festigo-logo.tsx
│   ├── login-festive.tsx        # Connexion
│   ├── organizer-calendar.tsx   # Calendrier des événements organisateur
│   ├── organizer-dashboard.tsx  # Tableau de bord organisateur (stats, graphiques)
│   ├── organizer-settings.tsx   # Paramètres du compte organisateur
│   ├── purchase-receipt.tsx     # Reçu d’achat
│   ├── signup-festive.tsx       # Inscription
│   ├── ticket-modal.tsx         # Modal choix quantités / réservation
│   ├── user-app-navbar.tsx      # Barre de navigation vue fan
│   ├── user-dashboard.tsx       # Espace fan : billets, favoris, commandes
│   └── user-discovery.tsx       # Découverte / liste des concerts
├── services/                    # Appels HTTP vers `/api`
│   ├── api.ts                   # Client HTTP (CORS, JSON, erreurs)
│   ├── authService.ts           # Login / register + persistance localStorage
│   ├── artisteService.ts
│   ├── billetService.ts
│   ├── commandeService.ts
│   ├── eventService.ts
│   ├── favoriteService.ts       # Favoris événements (utilisateur)
│   ├── organizerService.ts
│   ├── typeBilletService.ts
│   ├── userService.ts
│   └── userTicketsService.ts    # Billets côté utilisateur
└── styles/
    └── globals.css              # Tailwind, variables et styles globaux
```

---

##  Connexion avec le Backend

La communication avec le backend Java s'effectue via le fichier `src/services/api.ts`.

- **URL de base :** Par défaut, l'application pointe vers `http://localhost:8080/api`.
- **CORS :** Le backend doit autoriser les requêtes (Filtre CORS en Java).
- **Authentification :** Lorsqu'un utilisateur se connecte, ses informations sont stockées dans le `localStorage` du navigateur. Si un jeton (token) est présent, il est automatiquement injecté dans les en-têtes (Headers) de chaque requête sortante par la fonction `fetchApi`.

---

## Fonctionnalités principales

1. **Espace Public / Fan :**
   - Inscription et connexion en tant que Fan.
   - Découverte des concerts (liste).
   - Affichage détaillé d'un concert (lieu, date, line-up, tarifs).
   
2. **Espace Organisateur :**
   - Inscription et connexion en tant qu'Organisateur.
   - Calendrier récapitulatif de tous les évènements crées par l'organisateur connecté.
   - Tableau de bord avec statistiques (calculées dynamiquement selon les événements créés).
   - Création d'événements (avec création automatique des artistes principaux et invités dans la base de données).
   - Modification et suppression des événements existants.
