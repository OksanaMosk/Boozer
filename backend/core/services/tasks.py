import datetime
from django.utils import timezone
from celery import shared_task
import logging

from apps.orders.models import OrderModel
from apps.orders.services.exchange_service import get_today_rates

logger = logging.getLogger(__name__)


@shared_task
def update_exchange_rate():
    try:
        rates = get_today_rates()
        today = datetime.date.today()
        logger.info(f'Exchange rates updated/cached for {today}: {rates}')

    except Exception as e:
        logger.error(f'Error updating exchange rates: {e}')


@shared_task
def expire_orders_task():
    now = timezone.now()
    orders_to_expire = OrderModel.objects.filter(
        status__in=['DRAFT', 'HOLD'],
        expires_at__lt=now
    )
    if orders_to_expire.exists():
        from apps.orders.models import TableBookingModel
        TableBookingModel.objects.filter(
            order__in=orders_to_expire
        ).update(is_active=False, status='EXPIRED')
        orders_to_expire.update(status='EXPIRED')