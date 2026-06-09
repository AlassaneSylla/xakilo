.PHONY: dev build down restart logs \
        migrate makemigrations shell-backend shell-frontend \
        test lint createsuperuser

# ── Cycle de vie ──────────────────────────────────────────────────────────────

dev:
	docker compose up

build:
	docker compose build

down:
	docker compose down

restart:
	docker compose down && docker compose up

# ── Logs ──────────────────────────────────────────────────────────────────────

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

# ── Base de données ───────────────────────────────────────────────────────────

migrate:
	docker compose exec backend python manage.py migrate

makemigrations:
	docker compose exec backend python manage.py makemigrations

createsuperuser:
	docker compose exec backend python manage.py createsuperuser

# ── Shells ────────────────────────────────────────────────────────────────────

shell-backend:
	docker compose exec backend bash

shell-frontend:
	docker compose exec frontend sh

shell-db:
	docker compose exec db psql -U $${DB_USER} -d $${DB_NAME}

# ── Qualité ───────────────────────────────────────────────────────────────────

test:
	docker compose exec backend pytest -v
	docker compose exec frontend npm run test -- --run

lint:
	docker compose exec backend ruff check .
	docker compose exec frontend npm run lint