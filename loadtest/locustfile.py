"""
Test de charge Locust — App de gestion boutique/caisse "Xakilo" (Django REST + JWT).

Trois profils en parallele :
  - SuperAdmin : gere les boutiques
  - Proprietaire/Owner : gere employes, produits, rapports (pas besoin de session caisse)
  - Employe (caisse) : SEQUENCE realiste -> ouvre session, vend, gere stock, cloture

Emplacement attendu : loadtest/locustfile.py (monte dans le conteneur sur /mnt/locust)

Lancement via Docker :
    docker compose --profile loadtest up locust
    -> interface sur http://localhost:8089

Lancement local (hors Docker) :
    locust -f locustfile.py --host http://localhost:8000
"""

import random
from locust import HttpUser, task, between, SequentialTaskSet  # type: ignore


# ---------------------------------------------------------------------------
# COMPTES DE TEST — pre-crees dans la base avec password "passer123"
# ---------------------------------------------------------------------------
SUPERADMINS = [
    {"username": "p.alassane.sylla@gmail.com", "password": "passer123"},
]
OWNERS = [
    {"username": "alou@xakilo.com",    "password": "passer123"},  # boutique 8
    {"username": "ahmet@tangana.sn",   "password": "passer123"},  # boutique 9
    {"username": "amina@chezsoi.com",  "password": "passer123"},  # boutique 10
]
EMPLOYES = [
    {"username": "papi@xakilo.com",    "password": "passer123"},  # boutique 8
    {"username": "yaye@chezsoi.com",   "password": "passer123"},  # boutique 10
    {"username": "modou@tagana.sn",    "password": "passer123"},  # boutique 9
    {"username": "awa@tangana.com",    "password": "passer123"},  # boutique 9
    {"username": "marie@chezsoi.com",  "password": "passer123"},  # boutique 10
]

MODES_PAIEMENT = ["especes", "mobile_money", "carte"]


# ---------------------------------------------------------------------------
# Fonctions utilitaires partagees
# ---------------------------------------------------------------------------
def login(user):
    """Authentifie l'utilisateur et stocke le token JWT dans les headers."""
    compte = random.choice(user.comptes)
    with user.client.post(
        "/api/token/",
        json={"username": compte["username"], "password": compte["password"]},
        name="POST /api/token/ (login)",
        catch_response=True,
    ) as r:
        try:
            data = r.json()
        except Exception:
            data = {}
        if r.status_code == 200 and "access" in data:
            user.token   = data["access"]
            user.refresh = data.get("refresh", "")
            user.client.headers.update({"Authorization": f"Bearer {user.token}"})
            r.success()
        else:
            user.token = None
            user.client.headers.pop("Authorization", None)
            r.failure(f"Login echoue : {r.status_code}")


def fetch_my_products(user):
    """Charge la liste des produits de la boutique de l'utilisateur apres login."""
    try:
        r = user.client.get("/api/products/", name="GET /api/products/ (init)", catch_response=True)
        with r:
            data = r.json() if r.status_code == 200 else []
            if isinstance(data, list) and data:
                user.product_ids = [p["id"] for p in data if p.get("id")]
                r.success()
            else:
                user.product_ids = []
                r.success()
    except Exception:
        user.product_ids = []


def logout(user):
    """Blackliste le refresh token (deconnexion propre)."""
    if getattr(user, "token", None) and getattr(user, "refresh", ""):
        user.client.post(
            "/api/token/blacklist/",
            json={"refresh": user.refresh},
            name="POST /api/token/blacklist/ (logout)",
        )


# ===========================================================================
# PROFIL 1 — SUPERADMIN
# ===========================================================================
class SuperAdmin(HttpUser):
    weight    = 1
    wait_time = between(2, 5)
    comptes   = SUPERADMINS

    def on_start(self):
        login(self)

    def on_stop(self):
        logout(self)

    @task(5)
    def lister_boutiques(self):
        self.client.get("/api/boutiques/", name="GET /api/boutiques/")

    @task(2)
    def voir_dashboard(self):
        self.client.get("/api/users/dashboard/", name="GET /api/users/dashboard/")

    @task(1)
    def creer_boutique(self):
        bid = random.randint(10000, 99999)
        with self.client.post(
            "/api/boutiques/add/",
            json={
                "name":    f"Boutique_{bid}",
                "phone":   "774297425",
                "address": "Dakar",
            },
            name="POST /api/boutiques/add/",
            catch_response=True,
        ) as r:
            if r.status_code in (200, 201, 400, 403):
                r.success()
            else:
                r.failure(f"Inattendu : {r.status_code}")


# ===========================================================================
# PROFIL 2 — PROPRIETAIRE / OWNER
# Exempt de session caisse pour toutes ses operations
# ===========================================================================
class Proprietaire(HttpUser):
    weight    = 2
    wait_time = between(1, 4)
    comptes   = OWNERS

    def on_start(self):
        login(self)
        if self.token:
            fetch_my_products(self)

    def on_stop(self):
        logout(self)

    @task(5)
    def voir_profil(self):
        self.client.get("/api/users/me/", name="GET /api/users/me/")

    @task(4)
    def lister_employes(self):
        self.client.get("/api/users/", name="GET /api/users/")

    @task(4)
    def consulter_rapports(self):
        periode = random.choice(["day", "month", "year"])
        self.client.get(
            f"/api/users/reports/?period={periode}",
            name="GET /api/users/reports/",
        )

    @task(3)
    def lister_sorties(self):
        self.client.get("/api/removals/?page=1", name="GET /api/removals/")

    @task(3)
    def factures_impayees(self):
        self.client.get("/api/removals/unpaid/", name="GET /api/removals/unpaid/")

    @task(2)
    def voir_pertes(self):
        self.client.get("/api/removals/losses/", name="GET /api/removals/losses/")

    @task(2)
    def creer_produit(self):
        pid = random.randint(10000, 99999)
        with self.client.post(
            "/api/products/add/",
            json={
                "product_name":   f"Produit_{pid}",
                "category":       random.choice(["electronique", "meublier", "informatique"]),
                "unit_price":     random.randint(5000, 200000),
                "purchase_price": random.randint(3000, 150000),
                "alert":          2,
            },
            name="POST /api/products/add/",
            catch_response=True,
        ) as r:
            if r.status_code in (200, 201, 400, 403):
                r.success()
            else:
                r.failure(f"Inattendu : {r.status_code}")

    @task(1)
    def creer_employe(self):
        """Creation d'un employe (limite : MAX_USERS_PER_BOUTIQUE, 400 attendu si atteinte)."""
        uid = random.randint(10000, 99999)
        with self.client.post(
            "/api/users/add/",
            json={
                "username":   f"employe_{uid}",
                "email":      f"employe_{uid}@boutique.com",
                "password":   "motdepasse123",
                "first_name": "Jean",
                "last_name":  "Dupont",
                "phone":      "771234567",
                "role":       "EMPLOYEE",
                # boutique omis : le backend l'assigne automatiquement depuis le owner connecte
            },
            name="POST /api/users/add/ (creation employe)",
            catch_response=True,
        ) as r:
            # 201 = cree ; 400 = limite atteinte (attendu) ; 403 = non autorise
            if r.status_code in (200, 201, 400, 403):
                r.success()
            else:
                r.failure(f"Inattendu : {r.status_code}")

    @task(1)
    def historique_sessions(self):
        self.client.get("/api/sessions/history/", name="GET /api/sessions/history/")


# ===========================================================================
# PROFIL 3 — EMPLOYE (CAISSE) : sequence ordonnee et realiste
# ouvre session -> opere (ventes, stock, depenses) -> cloture
# ===========================================================================
class ParcoursCaisse(SequentialTaskSet):

    @task
    def ouvrir_session(self):
        with self.client.post(
            "/api/sessions/open/",
            json={"opening_balance": random.randint(10000, 50000)},
            name="POST /api/sessions/open/",
            catch_response=True,
        ) as r:
            # 201 = ouverte ; 400 = session deja ouverte (tolere)
            if r.status_code in (200, 201, 400):
                r.success()
            else:
                r.failure(f"Ouverture session : {r.status_code}")

    @task
    def consulter_session(self):
        self.client.get("/api/sessions/current/", name="GET /api/sessions/current/")

    @task
    def lister_produits(self):
        with self.client.get(
            "/api/products/",
            name="GET /api/products/",
            catch_response=True,
        ) as r:
            if r.status_code == 200:
                try:
                    data = r.json()
                    if isinstance(data, list) and data:
                        self.user.product_ids = [p["id"] for p in data if p.get("id")]
                except Exception:
                    pass
                r.success()
            else:
                r.success()

    @task
    def creer_vente(self):
        ids = getattr(self.user, "product_ids", [])
        if not ids:
            return
        produit = random.choice(ids)
        qte = random.randint(1, 3)
        with self.client.post(
            "/api/removals/add/",
            json={
                "destination":    "vente",
                "client_name":    "Badou Kane",
                "client_phone":   "774297425",
                "items":          [{"product": produit, "quantity": qte}],
                "initial_payment": 0,
                "payment_mode":   random.choice(MODES_PAIEMENT),
            },
            name="POST /api/removals/add/ (vente)",
            catch_response=True,
        ) as r:
            # 201 = vente cree ; 400 = stock insuffisant (tolere)
            if r.status_code in (200, 201, 400, 403):
                r.success()
            else:
                r.failure(f"Inattendu : {r.status_code}")

    @task
    def ajouter_entree_stock(self):
        ids = getattr(self.user, "product_ids", [])
        if not ids:
            return
        with self.client.post(
            "/api/entries/add/",
            json={
                "product":  random.choice(ids),
                "quantity": random.randint(10, 50),
                "supplier": "Fournisseur XYZ",
            },
            name="POST /api/entries/add/ (entree stock)",
            catch_response=True,
        ) as r:
            if r.status_code in (200, 201, 400, 403):
                r.success()
            else:
                r.failure(f"Inattendu : {r.status_code}")

    @task
    def lister_alertes_stock(self):
        self.client.get("/api/products/low-stock/", name="GET /api/products/low-stock/")

    @task
    def ajouter_depense(self):
        with self.client.post(
            "/api/sessions/expenses/add/",
            json={
                "amount":       random.randint(500, 5000),
                "description":  "Achat de fournitures",
                "payment_mode": random.choice(["especes", "mobile_money"]),
            },
            name="POST /api/sessions/expenses/add/",
            catch_response=True,
        ) as r:
            if r.status_code in (200, 201, 400, 403):
                r.success()
            else:
                r.failure(f"Inattendu : {r.status_code}")

    @task
    def enregistrer_perte(self):
        ids = getattr(self.user, "product_ids", [])
        if not ids:
            return
        with self.client.post(
            "/api/removals/add/",
            json={
                "destination":   "perte",
                "justification": "Produits endommages lors du transport",
                "items":         [{"product": random.choice(ids), "quantity": 1}],
            },
            name="POST /api/removals/add/ (perte)",
            catch_response=True,
        ) as r:
            if r.status_code in (200, 201, 400, 403):
                r.success()
            else:
                r.failure(f"Inattendu : {r.status_code}")

    @task
    def cloturer_session(self):
        with self.client.post(
            "/api/sessions/close/",
            json={"closing_balance": random.randint(10000, 50000)},
            name="POST /api/sessions/close/",
            catch_response=True,
        ) as r:
            if r.status_code in (200, 201, 400):
                r.success()
            else:
                r.failure(f"Cloture session : {r.status_code}")
        # Fin du parcours caisse : recommencer depuis le debut
        self.interrupt()


class Employe(HttpUser):
    weight    = 7          # Employes = profil le plus sollicite
    wait_time = between(1, 4)
    comptes   = EMPLOYES
    tasks     = [ParcoursCaisse]

    def on_start(self):
        login(self)
        if self.token:
            fetch_my_products(self)

    def on_stop(self):
        logout(self)