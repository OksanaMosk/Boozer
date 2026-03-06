from rest_framework.permissions import BasePermission, SAFE_METHODS

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


class IsAdminOrVenueAdminOrReadOnly(BasePermission):
    """
    - GET/HEAD/OPTIONS — усі можуть
    - POST/PUT/PATCH/DELETE — Admin або VenueAdmin
    - VenueAdmin може змінювати лише свої веню
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        user = request.user
        return bool(
            user and
            user.is_authenticated and
            getattr(user, 'role', '').upper() in ['ADMIN', 'VENUE_ADMIN']
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        user = request.user
        role = getattr(user, 'role', '').upper()

        if role == 'ADMIN':
            return True

        if role == 'VENUE_ADMIN':

            if hasattr(obj, 'venue_admin'):
                return obj.venue_admin == user

            if hasattr(obj, 'venue'):
                return getattr(obj.venue, 'venue_admin', None) == user

            if hasattr(obj, 'menu') and hasattr(obj.menu, 'venue'):
                return getattr(obj.menu.venue, 'venue_admin', None) == user

            if hasattr(obj, 'news') and hasattr(obj.news, 'venue'):
                return getattr(obj.news.venue, 'venue_admin', None) == user

        return False


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


class IsOrderOwnerOrVenueAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        order = view.get_object()
        if order.user == request.user:
            return True
        return order.venue.venue_admin == request.user


class IsBookingOwnerOrVenueAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        booking = view.get_object()
        if booking.user == request.user:
            return True

        return booking.table.venue.venue_admin == request.user


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