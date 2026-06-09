# Xakilo — Système de Gestion de Boutique

Xakilo est une application web full-stack de gestion de boutique développée pour le marché africain (devise FCFA). Elle couvre la gestion des stocks, des ventes, des factures, des dépenses, des sessions de caisse et des rapports financiers.

Développé par **Alassane Sylla**.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   NGINX (prod)                  │
│          Reverse proxy — port 80/443            │
└──────────┬──────────────────────┬───────────────┘
           │                      │
    ┌──────▼──────┐        ┌──────▼──────┐
    │  Frontend   │        │   Backend   │
    │ React/Vite  │        │   Django    │
    │  port 5173  │        │  port 8000  │
    └─────────────┘        └──────┬──────┘
                                  │
                    ┌─────────────┼─────────────┐
             ┌──────▼──────┐ ┌───▼───┐  ┌──────▼──────┐
             │ PostgreSQL  │ │ Redis │  │    Media    │
             │  port 5432  │ │ 6379  │  │   uploads   │
             └─────────────┘ └───────┘  └─────────────┘
```

---

## Fonctionnalités

| Module | Description |
|--------|-------------|
| **Produits** | Catalogue, stock, alertes rupture, fiche produit |
| **Entrées** | Réception de marchandises, mise à jour du stock |
| **Sorties** | Ventes, dons, pertes avec justificatif |
| **Factures** | Génération, impression, suivi des paiements |
| **Caisse** | Sessions journalières, dépenses, écarts |
| **Rapports** | Bilan matériel et financier (jour/mois/année/custom) |
| **Utilisateurs** | Multi-rôles (Propriétaire, Manager, Employé) |
| **Boutiques** | Multi-boutique (superadmin) |

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Django 5.2 + Django REST Framework |
| Base de données | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | JWT (djangorestframework-simplejwt) |
| Proxy (prod) | Nginx |
| Conteneurisation | Docker + Docker Compose |

---

## Prérequis

- [Docker](https://www.docker.com/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.x
- `make` (optionnel, pour les commandes courtes)

---

## Démarrage rapide

```bash
# 1. Cloner le projet
git clone <url-du-repo> xakilo
cd xakilo

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Lancer l'environnement de développement
docker compose up
```

L'application est accessible sur :
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:8000/api/
- **Swagger** → http://localhost:8000/swagger/
- **Admin Django** → http://localhost:8000/admin/

---

## Variables d'environnement

Copier `.env.example` en `.env` et renseigner les valeurs :

```env
# Django
DJANGO_SECRET_KEY=votre-cle-secrete-ici
DJANGO_SETTINGS_MODULE=config.settings.dev

# Base de données
DB_NAME=xakilo
DB_USER=postgres
DB_PASSWORD=votre-mot-de-passe
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## Commandes Docker

### Cycle de vie

```bash
# Démarrer tous les services
docker compose up

# Démarrer en arrière-plan
docker compose up -d

# Arrêter les services
docker compose down

# Arrêter et supprimer les volumes (ATTENTION : supprime les données)
docker compose down -v

# Reconstruire les images (après modification d'un Dockerfile ou requirements)
docker compose build

# Redémarrer un service spécifique
docker compose restart backend
docker compose restart frontend
```

### Logs

```bash
# Logs de tous les services
docker compose logs -f

# Logs du backend uniquement
docker compose logs -f backend

# Logs du frontend uniquement
docker compose logs -f frontend

# 50 dernières lignes du backend
docker compose logs backend --tail=50
```

### Base de données

```bash
# Appliquer les migrations
docker compose exec backend python manage.py migrate

# Créer de nouvelles migrations
docker compose exec backend python manage.py makemigrations

# Créer un superutilisateur
docker compose exec backend python manage.py createsuperuser

# Accéder à la console PostgreSQL
docker compose exec db psql -U postgres -d xakilo

# Sauvegarder la base de données
docker compose exec db pg_dump -U postgres xakilo > backup.sql

# Restaurer une sauvegarde
docker compose exec -T db psql -U postgres xakilo < backup.sql
```

### Shells

```bash
# Shell Python (Django)
docker compose exec backend python manage.py shell

# Shell Bash du backend
docker compose exec backend bash

# Shell du frontend
docker compose exec frontend sh
```

### Qualité du code

```bash
# Lancer les tests backend
docker compose exec backend pytest

# Lancer les tests avec couverture
docker compose exec backend pytest --cov=apps

# Linter Python (ruff)
docker compose exec backend ruff check .

# Linter frontend (ESLint)
docker compose exec frontend npm run lint

# Build de production du frontend
docker compose exec frontend npm run build
```

### Versionnage

```bash
# Dans le dossier frontend/
cd frontend

# Correction de bug → 1.0.0 → 1.0.1
npm version patch

# Nouvelle fonctionnalité → 1.0.0 → 1.1.0
npm version minor

# Refonte majeure → 1.0.0 → 2.0.0
npm version major
```

---

## Structure du projet

```
xakilo/
├── backend/                # API Django
│   ├── apps/
│   │   ├── accounts/       # Utilisateurs, boutiques, rapports
│   │   ├── products/       # Catalogue produits
│   │   └── stock/          # Entrées, sorties, paiements, sessions
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── dev.py
│   │   │   └── prod.py
│   │   └── urls.py
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── dev.txt
│   │   └── prod.txt
│   └── Dockerfile.dev
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── features/       # Modules métier
│   │   ├── layout/         # Header, Footer, Sidebar
│   │   ├── providers/      # Contextes React
│   │   ├── router/         # Routes + guards
│   │   └── shared/         # Composants, hooks, utils partagés
│   └── Dockerfile.dev
├── nginx/
│   └── nginx.conf          # Configuration reverse proxy
├── docker-compose.yml      # Dev
├── docker-compose.prod.yml # Prod
├── .env.example
└── Makefile
```

---

## Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| **OWNER** | Accès complet : utilisateurs, paramètres, rapports complets |
| **MANAGER** | Rapports mensuels, gestion des ventes et stocks |
| **EMPLOYEE** | Ventes, entrées, session de caisse |

---

## Développement

Voir [backend/README.md](backend/README.md) et [frontend/README.md](frontend/README.md) pour les guides spécifiques à chaque couche.

---

## Licence

Propriété intellectuelle d'**Alassane Sylla**. Tous droits réservés.
