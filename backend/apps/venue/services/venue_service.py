from decimal import Decimal

from django.core.mail import send_mail
from django.db.models.aggregates import Sum, Avg, Count

from apps.orders.services.exchange_service import get_today_rates
from core.services.email_service import EmailService


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
    venue.save()

    if venue.venue_admin and venue.venue_admin.email:
        EmailService.venue_approval(venue)

    return venue


def get_venue_orders_statistics(venue):

    orders_qs = venue.orders.all().order_by('-id')
    rates = get_today_rates()
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