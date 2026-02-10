from rest_framework.permissions import BasePermission

from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Full access for admin users (is_staff or is_superuser).
    Can perform any action (GET, POST, PATCH, DELETE).
    """
    def has_permission(self, request, view):
        return request.user.is_staff or request.user.is_superuser


class IsVenueAdminOrReadOnly(permissions.BasePermission):
    """
    Venue admin can edit their own venue, menus, news, tables.
    Other users have read-only access (GET).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(obj, 'venue_admin', None) == request.user


class IsVisitorOrReadOnly(permissions.BasePermission):
    """
    Registered user (visitor):
    - can view venues (GET)
    - can create orders, add favorites, write reviews (if they were a client)
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(obj, 'user', None) == request.user


class IsGuestReadOnly(permissions.BasePermission):
    """
    Unauthenticated users can only read (GET requests).
    Cannot create, update, or delete any object.
    """
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS


class SocialProfileCompletePermission(BasePermission):
    message = "You must complete your profile (birth date and accept rules) for social login."
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        if getattr(user, "auth_provider", None) != user.AuthProvider.EMAIL:
            profile = getattr(user, "profile", None)
            if not profile or not profile.birth_date or not profile.is_rules_accepted:
                return False
        return True