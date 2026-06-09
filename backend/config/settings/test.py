from .base import *  # noqa: F403, F405

DEBUG = False

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Désactiver le cache pendant les tests
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    }
}

# Accélérer le hashage des mots de passe dans les tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]