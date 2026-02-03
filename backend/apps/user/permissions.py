from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    message = 'You must be an administrator (staff + superuser) to perform this action.'
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
            and request.user.is_superuser
        )


class IsVenueAdmin(BasePermission):
    message = 'You must be a Venue Admin to perform this action.'
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == request.user.Role.VENUE_ADMIN
        )


class IsVisitor(BasePermission):
    message = 'You must be a Visitor to perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == request.user.Role.VISITOR
        )


class IsVenueAdminOrAdmin(BasePermission):
    message = 'You must be a Venue Admin or an Admin to perform this action.'

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return (
                (request.user.role == request.user.Role.VENUE_ADMIN) or
                (request.user.is_staff and request.user.is_superuser)
        )

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