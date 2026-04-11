from decimal import Decimal
from django.db.models import Q, Exists, OuterRef
from django.core.mail import send_mail
from django.db.models.aggregates import Count
from better_profanity import profanity
from apps.orders.services.exchange_service import get_today_rates
from django.utils import timezone
from core.services.email_service import EmailService
from django.db.models import F, FloatField, ExpressionWrapper, Case, When
from django.db.models.functions import ACos, Cos, Radians, Sin


def get_venues_list(user, tags_param=None, lat=None, lon=None, target_currency='UAH'):
    from apps.venue.models import VenueModel
    from apps.reviews_feedback.models import FavoriteVenue
    qs = VenueModel.objects.all()
    role = getattr(user, 'role', '').upper()

    if role == 'ADMIN' or getattr(user, 'is_staff', False):
        pass
    elif role == 'VENUE_ADMIN':
        qs = qs.filter(Q(status='active') | Q(venue_admin=user))
    else:
        qs = qs.filter(status='active')

    if user.is_authenticated:
        is_favorite_subquery = FavoriteVenue.objects.filter(
            user=user,
            venue_id=OuterRef('pk'),
            collection__is_staff_top=False
        )
        qs = qs.annotate(is_favorite=Exists(is_favorite_subquery))

    if tags_param:
        tags_list = [t.strip().lower() for t in tags_param.split(',') if t.strip()]
        if tags_list:
            qs = qs.filter(tags__name__in=tags_list).distinct()

    rates = get_today_rates()

    def r(curr):
        if curr == 'UAH': return 1.0
        return float(rates.get(curr, 1.0))

    t_rate = r(target_currency)
    qs = qs.annotate(
        converted_check=Case(
            When(currency='USD',
                 then=ExpressionWrapper(F('average_check') * r('USD') / t_rate, output_field=FloatField())),
            When(currency='EUR',
                 then=ExpressionWrapper(F('average_check') * r('EUR') / t_rate, output_field=FloatField())),
            When(currency='UAH',
                 then=ExpressionWrapper(F('average_check') * r('UAH') / t_rate, output_field=FloatField())),
            default=F('average_check'),
            output_field=FloatField()
        )
    )


    if lat and lon:
        try:
            u_lat, u_lon = float(lat), float(lon)
            qs = qs.annotate(
                distance=ExpressionWrapper(
                    6371 * ACos(
                        Cos(Radians(u_lat)) * Cos(Radians(F('latitude'))) *
                        Cos(Radians(F('longitude')) - Radians(u_lon)) +
                        Sin(Radians(u_lat)) * Sin(Radians(F('latitude')))
                    ),
                    output_field=FloatField()
                )
            )
        except (ValueError, TypeError):
            pass

    return qs



def get_venue_create_data(user, description=''):
    role = getattr(user, 'role', '').upper()

    if role == 'VENUE_ADMIN':
        status = 'pending'
    elif role == 'ADMIN':
        status = 'active'
    else:
        return None

    if description and profanity.contains_profanity(description):
        return {
            'venue_admin': user,
            'status': 'pending',
            'edit_attempts': 1
        }

    return {
        'venue_admin': user,
        'status': status,
        'edit_attempts': 0
    }


def update_venue_background_url(venue, url):
    venue.background_tables = url
    venue.save(update_fields=['background_tables'])
    return venue



def get_user_venues(user, user_id):
    from apps.venue.models import VenueModel
    if user.role in ['admin']:
        return VenueModel.objects.filter(venue_admin__id=user_id)
    if user.role == 'venue_admin' and user.id == user_id:
        return VenueModel.objects.filter(venue_admin__id=user_id)
    return VenueModel.objects.none()

def notify_admin(venue):
    send_mail(
        subject='Venue listing needs attention',
        message=f'The Venue listing with ID {venue.id} has failed the profanity check 3 times.',
        from_email='no-reply@platform.com',
        recipient_list=['manager@example.com']
    )


def approve_venue_service(venue):
    venue.status = 'active'
    venue.edit_attempts = 0
    venue.save(update_fields=['status', 'edit_attempts'])

    if venue.venue_admin and venue.venue_admin.email:
        EmailService.venue_approval(venue)

    return venue


def get_venue_orders_statistics(venue):
    orders_qs = venue.orders.all().order_by('-id')
    rates = get_today_rates()

    venue.last_exchange_update = timezone.now()
    venue.save(update_fields=['last_exchange_update'])

    venue_curr = venue.currency or "UAH"
    success_statuses = ['CONFIRMED']
    total_revenue_venue_curr = Decimal('0.00')
    success_count = 0

    for order in orders_qs:
        if order.status in success_statuses:
            amount = Decimal(str(order.total_price or 0))
            order_curr = order.currency or venue_curr

            if order_curr == venue_curr:
                converted_amount = amount
            else:
                rate_order = Decimal(str(rates.get(order_curr, 1.0)))
                rate_venue = Decimal(str(rates.get(venue_curr, 1.0)))
                converted_amount = (amount * rate_order) / rate_venue

            order.venue_impact = round(converted_amount, 2)

            total_revenue_venue_curr += converted_amount
            success_count += 1

    avg_check = total_revenue_venue_curr / success_count if success_count > 0 else 0
    venue.average_check = round(avg_check, 2)
    venue.save(update_fields=['average_check', 'last_exchange_update'])

    budget_dist = list(orders_qs.values('budget_range').annotate(count=Count('id')).order_by('-count'))
    gender_dist = list(orders_qs.values('gender_preference').annotate(count=Count('id')).order_by('-count'))
    payment_dist = list(orders_qs.values('payment_type').annotate(count=Count('id')).order_by('-count'))

    return {
        'orders': orders_qs,
        'stats': {
            'total_revenue': round(total_revenue_venue_curr, 2),
            'average_check': round(avg_check, 2),
            'currency': venue_curr,

            'success_orders_count': success_count,
            'total_orders_count': orders_qs.count(),

            'budget_distribution': budget_dist,
            'gender_distribution': gender_dist,
            'payment_distribution': payment_dist
        }
    }
