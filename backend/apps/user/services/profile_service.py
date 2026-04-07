def validate_social_auth_profile(user, data):
    if hasattr(user, 'auth_provider') and str(user.auth_provider).lower() != 'email':
        if not data.get('birth_date') or not data.get('is_rules_accepted'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Birth date and rules acceptance are required.')

def get_profile_target_user(request_user, target_pk=None):
    if target_pk and (request_user.is_staff or request_user.is_superuser):
        from django.contrib.auth import get_user_model
        from django.shortcuts import get_object_or_404
        return get_object_or_404(get_user_model(), pk=target_pk)
    return request_user