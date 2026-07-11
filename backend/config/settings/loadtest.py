from .base import *  # noqa: F403, F405
from datetime import timedelta

DEBUG = False
ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True

# Connexions persistantes : réduit le coût d'ouverture/fermeture sous charge
DATABASES["default"]["CONN_MAX_AGE"] = 60  # noqa: F405

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
}
