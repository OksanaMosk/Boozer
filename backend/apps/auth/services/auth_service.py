from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from core.services.jwt_service import ActivateToken, RecoveryToken

User = get_user_model()


def activate_user_by_token(token):
    from core.services.jwt_service import JWTService
    try:
        user = JWTService.verify_token(token, ActivateToken)
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=['is_active'])
            return user, "activated"
        return user, "already_active"
    except Exception:
        raise ValidationError({'detail': 'Invalid or expired token.'})


def reset_user_password(token, new_password):
    from core.services.jwt_service import JWTService
    user = JWTService.verify_token(token, RecoveryToken)
    user.set_password(new_password)
    user.save()
    return user


def handle_social_user_data(email, user_data):
    from apps.user.models import ProfileModel
    user, created = User.objects.get_or_create(
        email=email,
        defaults={'is_active': True}
    )

    if not created and not user.is_active:
        user.is_active = True
        user.save(update_fields=['is_active'])

    profile, profile_created = ProfileModel.objects.get_or_create(user=user)

    if profile_created or not profile.name:
        profile.name = user_data.get('given_name', '') or email.split('@')[0]

    if profile_created or not profile.surname:
        profile.surname = user_data.get('family_name', '') or email.split('@')[0]

    profile.save()

    return user, profile