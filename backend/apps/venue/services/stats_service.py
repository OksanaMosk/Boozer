from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

from rest_framework.exceptions import PermissionDenied, ValidationError

from better_profanity import profanity

from core.services.email_service import EmailService

from apps.venue.models import VenueModel


def get_client_ip(request):
    django_request = request._request
    x_forwarded_for = django_request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = django_request.META.get('REMOTE_ADDR')
    return ip

def update_venue_stats(venue, request):
    now = timezone.now()
    ip = get_client_ip(request)
    cache_key = f"venue_view:{venue.id}:{ip}:{now.date()}"

    if cache.get(cache_key):
        return

    if venue.updated_at.date() != now.date():
        venue.daily_views = 0
    if venue.updated_at.isocalendar()[1] != now.isocalendar()[1]:
        venue.weekly_views = 0
    if venue.updated_at.month != now.month:
        venue.monthly_views = 0

    venue.views += 1
    venue.daily_views += 1
    venue.weekly_views += 1
    venue.monthly_views += 1
    venue.updated_at = now
    venue.save()

    cache.set(cache_key, True, timeout=24*60*60)

def create_venue_with_logic(user, serializer):

    description = serializer.validated_data.get('description', '')
    if description and profanity.contains_profanity(description):
        serializer.save(seller=user, status='pending', edit_attempts=1)
    else:
        serializer.save(seller=user, status="active", edit_attempts=0)


def handle_venue_update_profanity(venue, serializer, user):
    description = serializer.validated_data.get('description')
    if venue.edit_attempts >= 3 and user.role not in ['admin']:
        raise ValidationError('This ad is locked and cannot be edited.')

    if user.role in ['manager', 'admin'] and serializer.validated_data.get('status') == 'active':
        venue.edit_attempts = 0
        venue.save(update_fields=['edit_attempts'])

    if description and profanity.contains_profanity(description):
        venue.edit_attempts += 1
        venue.status = 'inactive' if venue.edit_attempts >= 3 else 'pending'
        venue.save(update_fields=['edit_attempts', 'status'])

        if venue.edit_attempts == 3:
            EmailService._EmailService__send_email(
                to=settings.MANAGER_EMAIL,
                template_name='manager_email.html',
                context={
                    'ad_id': venue.id,
                    'frontend_url': f"{settings.BASE_URL}/ads/{venue.id}"
                },
                subject='Ad requires review'
            )

        raise ValidationError('Description contains prohibited words.')

def get_venue_stats_for_user(venue_id, user):
    if not user.is_authenticated or user.account_type != 'premium':
        raise PermissionDenied('Premium account required')
    try:
        venue = VenueModel.objects.get(id=venue_id)
    except VenueModel.DoesNotExist:
        raise VenueModel.DoesNotExist('Vevenue not found')

    return {
        'total_views': venue.views,
        'daily_views': venue.daily_views,
        'weekly_views': venue.weekly_views,
        'monthly_views': venue.monthly_views
    }