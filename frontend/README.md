# Xakilo — Frontend

Interface utilisateur de l'application Xakilo, construite avec React 19, TypeScript et Vite.

---

## Stack

| Outil | Version | Rôle |
|-------|---------|------|
| React | 19.1.0 | Bibliothèque UI |
| TypeScript | 5.8.3 | Typage statique |
| Vite | 6.3.5 | Bundler & serveur de développement |
| React Router | 7.5.3 | Routing SPA |
| Axios | 1.12.2 | Client HTTP + intercepteurs JWT |
| Tailwind CSS | 4.1.5 | Styles utilitaires |
| DaisyUI | 5.0.35 | Composants UI (basé sur Tailwind) |
| Framer Motion | 12.9.7 | Animations de page |
| Recharts | 2.15.3 | Graphiques (barres, courbes, donut) |
| React Hot Toast | 2.6.0 | Notifications toast |
| SweetAlert2 | 11.26.25 | Modales de confirmation |
| Lucide React | 0.507.0 | Icônes SVG |

---

## Commandes

```bash
# Démarrer le serveur de développement (hot reload)
npm run dev

# Vérifier les types TypeScript
npx tsc --noEmit

# Linter ESLint
npm run lint

# Build de production
npm run build

# Prévisualiser le build de production
npm run preview
```

Via Docker (recommandé) :

```bash
docker compose exec frontend npm run lint
docker compose exec frontend npx tsc --noEmit
docker compose exec frontend npm run build
```

---

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de base de l'API backend | `http://localhost:8000` |

Définie dans `docker-compose.yml` en développement. Pour la production, créer un `.env.production`.

---

## Structure des dossiers

```
src/
├── App.tsx                     # Point d'entrée React
├── main.tsx                    # Montage du DOM
├── index.css                   # Variables CSS globales + Tailwind
│
├── assets/                     # Images, logos, icônes statiques
│
├── layout/                     # Squelettes de page
│   ├── Layout.tsx              # Layout boutique (header + sidebar + footer)
│   ├── AdminLayout.tsx         # Layout superadmin
│   ├── Header.tsx              # Barre supérieure + nom boutique centré
│   ├── Sidebar.tsx             # Navigation latérale boutique
│   ├── Footer.tsx              # Pied de page (version dynamique)
│   ├── LoginWelcomeOverlay.tsx # Animation de connexion
│   └── LogoutOverlay.tsx       # Animation de déconnexion
│
├── providers/                  # Contextes React globaux
│   ├── AuthProvider.tsx        # Authentification (user, login, logout)
│   ├── CashSessionProvider.tsx # Session de caisse active
│   ├── StockAlertProvider.tsx  # Alertes rupture de stock
│   └── index.tsx               # Composition de tous les providers
│
├── router/
│   ├── index.tsx               # Définition de toutes les routes
│   ├── paths.ts                # Constantes des chemins de routes
│   ├── PrivateRoute.tsx        # Guard : redirige si non connecté
│   ├── RequireRole.tsx         # Guard : redirige si rôle insuffisant
│   └── ErrorBoundary.tsx       # Gestion des erreurs de route
│
├── shared/                     # Code partagé entre features
│   ├── api/
│   │   └── client.ts           # Instance Axios + intercepteurs JWT auto-refresh
│   ├── components/ui/          # Composants réutilisables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── IconButton.tsx
│   │   ├── Modal.tsx
│   │   └── Pagination.tsx
│   ├── hooks/
│   │   └── usePermission.ts    # Hook RBAC centralisé
│   └── utils/
│       └── getRoleLabel.tsx    # Libellé français du rôle utilisateur
│
└── features/                   # Modules métier (1 dossier = 1 domaine)
    ├── auth/                   # Connexion, types AuthUser
    ├── boutiques/              # Gestion superadmin des boutiques
    ├── cash/                   # Sessions de caisse + dépenses
    ├── dashboard/              # Page d'accueil, KPIs, graphiques
    ├── invoices/               # Factures, modèle d'impression
    ├── products/               # Catalogue, fiche produit, alertes stock
    ├── reports/                # Bilan matériel et financier
    ├── sales/                  # Ventes rapides, suivi des ventes
    ├── settings/               # Paramètres boutique (logo, informations)
    ├── stock/
    │   ├── entries/            # Entrées de marchandises
    │   └── removals/           # Sorties (vente, don, perte)
    └── users/                  # Gestion utilisateurs + page profil
```

### Convention par feature

```
features/<nom>/
├── api/          # Appels API (fonctions axios)
├── components/   # Composants propres à la feature
├── hooks/        # Hooks de données (useXxx)
├── pages/        # Pages complètes routées
└── types.ts      # Types TypeScript de la feature
```

---

## Routing et guards

```
/login                  → public
/                       → OWNER | MANAGER | EMPLOYEE
/products               → OWNER | MANAGER | EMPLOYEE
/removals               → OWNER | MANAGER | EMPLOYEE
/session                → OWNER | MANAGER | EMPLOYEE
/expenses               → OWNER | MANAGER | EMPLOYEE
/reports/materiel       → OWNER | MANAGER | EMPLOYEE
/reports/financier      → OWNER | MANAGER
/profile                → OWNER | MANAGER | EMPLOYEE
/users                  → OWNER
/settings               → OWNER
/boutiques              → superuser
/admin                  → superuser
```

---

## Authentification JWT

1. `POST /api/token/` → reçoit `access` + `refresh`
2. Tokens stockés dans `localStorage`
3. `client.ts` injecte `Authorization: Bearer <token>` sur chaque requête
4. En cas de 401 → refresh automatique via `/api/token/refresh/`
5. Si refresh échoue → redirection vers `/login`

---

## Gestion des permissions (RBAC)

```typescript
const {
  isOwner,                  // rôle OWNER
  isManager,                // OWNER ou MANAGER
  canAccessMonthlyReport,   // OWNER ou MANAGER
  canAccessAnnualReport,    // OWNER uniquement
  canFilterByDate,          // OWNER uniquement
  canDelete,                // OWNER ou MANAGER
  canRecordPayment,         // tous les rôles
} = usePermission();
```

---

## Versionnage

La version est lue depuis `package.json` et injectée automatiquement par Vite :

```bash
npm version patch   # 1.0.0 → 1.0.1  (correction de bug)
npm version minor   # 1.0.0 → 1.1.0  (nouvelle fonctionnalité)
npm version major   # 1.0.0 → 2.0.0  (refonte majeure)
```

---

## Dépendances de développement

| Package | Rôle |
|---------|------|
| `typescript-eslint` | Linting TypeScript |
| `eslint-plugin-react-hooks` | Règles hooks React |
| `eslint-plugin-react-refresh` | Compatibilité HMR Vite |
| `@tailwindcss/forms` | Reset styles formulaires |
| `@tailwindcss/typography` | Styles contenu typographique |
| `postcss` + `autoprefixer` | Post-traitement CSS |
