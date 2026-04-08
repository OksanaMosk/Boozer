from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django.utils import timezone

from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncDay, TruncHour
from rest_framework.exceptions import PermissionDenied, ValidationError

from better_profanity import profanity

from core.services.email_service import EmailService

from apps.venue.models import VenueModel, VenueTraffic

profanity.load_censor_words()

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

    last_update = venue.updated_at or now

    if last_update.date() != now.date():
        venue.daily_views = 0
    if last_update.isocalendar()[:2] != now.isocalendar()[:2]:
        venue.weekly_views = 0
    if last_update.month != now.month:
        venue.monthly_views = 0

    venue.views += 1
    venue.daily_views += 1
    venue.weekly_views += 1
    venue.monthly_views += 1
    venue.updated_at = now

    venue.save(update_fields=[
        'views', 'daily_views', 'weekly_views',
        'monthly_views', 'updated_at'
    ])

    cache.set(cache_key, True, timeout=24 * 60 * 60)


def create_venue_with_logic(user, serializer):
    description = serializer.validated_data.get('description', '')

    if description and profanity.contains_profanity(description):
        serializer.save(venue_admin=user, status='pending', edit_attempts=1)
        return

    serializer.save(venue_admin=user, status="active", edit_attempts=0)

MAX_EDIT_ATTEMPTS = 3

def handle_venue_update_profanity(venue, serializer, user):
    description = serializer.validated_data.get('description')
    user_role = getattr(user, 'role', '')

    if venue.edit_attempts >= MAX_EDIT_ATTEMPTS and user_role != 'admin':
        raise ValidationError({'detail': 'This ad is locked and cannot be edited. Your venue status: Inactive. Please contact the Admin.'})

    if user_role.lower() == 'admin' or user.is_staff:
        venue.edit_attempts = 0
        venue.save(update_fields=['edit_attempts', 'status'])
        return

    if not (description and profanity.contains_profanity(description)):
        venue.edit_attempts = 0
        venue.save(update_fields=['edit_attempts'])
        return

    venue.edit_attempts += 1
    venue.status = 'inactive' if venue.edit_attempts >= MAX_EDIT_ATTEMPTS else 'pending'
    venue.save(update_fields=['edit_attempts', 'status'])

    if venue.edit_attempts == MAX_EDIT_ATTEMPTS:
        EmailService.send_profanity_notification(venue)

    raise ValidationError({'description': 'Description contains prohibited words. Please contact the Admin.'})


def get_venue_stats_for_user(venue_id, user):
    if not user.is_authenticated:
        raise PermissionDenied('Authentication required')

    venue = get_object_or_404(VenueModel, id=venue_id)

    return {
        'total_views': venue.views,
        'daily_views': venue.daily_views,
        'weekly_views': venue.weekly_views,
        'monthly_views': venue.monthly_views
    }

def get_venue_analytics(venue):
    now = timezone.now()
    actual_total_count = VenueTraffic.objects.filter(venue=venue).count()

    def aggregate(delta, trunc_func):
        return (
            VenueTraffic.objects.filter(venue=venue, timestamp__gte=now - delta)
            .annotate(name=trunc_func('timestamp'))
            .values('name')
            .annotate(value=Count('id'))
            .order_by('name')
        )

    daily_qs = aggregate(timedelta(hours=24), TruncHour)
    weekly_qs = aggregate(timedelta(days=7), TruncDay)
    monthly_qs = aggregate(timedelta(days=30), TruncDay)

    return {
        "total_views": actual_total_count,
        "daily_views": venue.daily_views,
        "weekly_views": venue.weekly_views,
        "monthly_views": venue.monthly_views,
        "daily": [{"name": v['name'].strftime("%H:00"), "value": v['value']} for v in daily_qs],
        "weekly": [{"name": v['name'].strftime("%a"), "value": v['value']} for v in weekly_qs],
        "monthly": [{"name": v['name'].strftime("%d %b"), "value": v['value']} for v in monthly_qs],
    }