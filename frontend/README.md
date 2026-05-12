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

## 🛠️ Technologies utilisées

- **Framework :** React 18
- **Langage :** TypeScript
- **Build Tool :** Vite 6
- **Styling :** Tailwind CSS 4
- **Composants UI :** Radix UI (accessible & sans style de base), stylisé façon `shadcn/ui`
- **Icônes :** Lucide React
- **Graphiques :** Recharts (pour le tableau de bord organisateur)
- **Réseau :** Fetch API natif (via un wrapper personnalisé dans `src/services/api.ts`)

---

##  Architecture du dossier `src`

```text
src/
├── components/          # Composants React
│   ├── ui/              # Composants génériques réutilisables (Boutons, Modals, etc.)
│   ├── login-festive.tsx # Page de connexion
│   ├── signup-festive.tsx# Page d'inscription
│   ├── user-discovery.tsx# Affichage et recherche des concerts pour les fans
│   ├── event-details.tsx # Page de détails d'un événement
│   └── organizer-dashboard.tsx # Tableau de bord pour les organisateurs
├── services/            # Logique de communication avec le backend (API REST)
│   ├── api.ts           # Client HTTP de base (gestion du CORS, JSON, erreurs)
│   ├── authService.ts   # Service de connexion/inscription (localStorage)
│   ├── eventService.ts  # Appels API pour les événements
│   ├── artisteService.ts# Appels API pour les artistes
│   └── typeBilletService.ts # Appels API pour les tarifs
├── styles/              # Fichiers CSS globaux
│   └── globals.css      # Variables Tailwind et animations personnalisées
├── App.tsx              # Composant racine (Routage et gestion des vues)
└── Main.tsx             # Point d'entrée React
```

---

## 🔌 Connexion avec le Backend

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
   - Tableau de bord avec statistiques (calculées dynamiquement selon les événements créés).
   - Création d'événements (avec création automatique des artistes principaux et invités dans la base de données).
   - Modification et suppression des événements existants.
