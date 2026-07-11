from .base import *  # noqa: F403, F405
from datetime import timedelta

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "backend"]

# En dev on autorise le front Vite
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
CORS_ALLOW_ALL_ORIGINS = True   # pratique en dev, jamais en prod

# Afficher les emails dans le terminal au lieu de les envoyer
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Django debug toolbar
INSTALLED_APPS += ["debug_toolbar"]  # noqa: F405
MIDDLEWARE    += ["debug_toolbar.middleware.DebugToolbarMiddleware"]  # noqa: F405
INTERNAL_IPS   = ["127.0.0.1"]

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
}
