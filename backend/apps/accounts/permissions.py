from rest_framework.permissions import BasePermission

MAX_USERS_PER_BOUTIQUE = 5


class IsBoutiqueOwner(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'OWNER' and
            request.user.boutique_id is not None
        )


class IsBoutiqueOwnerOrManager(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ('OWNER', 'MANAGER') and
            request.user.boutique_id is not None
        )


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)