from decimal import Decimal
from apps.orders.services.exchange_service import get_today_rates
from datetime import timedelta
from django.utils import timezone
from django.db import transaction

def create_order_with_details(user, venue_id, validated_data, items_data, extra_services_data):
    with transaction.atomic():
        from apps.orders.models import OrderModel, OrderExtraServiceModel, OrderItemModel

        validated_data['expires_at'] = timezone.now() + timedelta(minutes=30)

        order = OrderModel.objects.create(
            user=user,
            venue_id=venue_id,
            **validated_data
        )

        for item_data in items_data:
            item_data['price'] = item_data['menu_item'].price
            OrderItemModel.objects.create(order=order, **item_data)

        for es_data in extra_services_data:
            es_data['price'] = es_data['service'].price
            OrderExtraServiceModel.objects.create(order=order, **es_data)

        from apps.travel_logistics.services import TravelCalculationService
        travel_service = TravelCalculationService(order.venue)
        travel_service.apply_to_order(order)

        calculate_total(order)
        return order


def calculate_total(order):
    order.refresh_from_db()
    from apps.orders.models import OrderExtraServiceModel
    rates = get_today_rates()

    s_sum = Decimal('0.00')
    services = OrderExtraServiceModel.objects.filter(order=order).select_related('service')

    for s in services:
        price = Decimal(str(s.price))
        qty = s.quantity
        if s.service.price_type == 'per_day':
            s_sum += price * order.guests_count * qty
        else:
            s_sum += price * qty

    order.services_total = s_sum

    base_sum = (
            order.menu_total +
            order.services_total +
            Decimal(str(order.flight_price or 0)) +
            Decimal(str(order.transfer_price or 0))
    )

    venue_curr = order.venue.currency if order.venue else "UAH"
    user_curr = order.currency or venue_curr

    if user_curr == venue_curr:
        order.total_price = base_sum.quantize(Decimal('0.01'))
        order.exchange_rate = Decimal('1.00')
    else:
        rate_from = Decimal(str(rates.get(venue_curr, 1.00)))
        rate_to = Decimal(str(rates.get(user_curr, 1.00)))
        conversion_rate = rate_from / rate_to
        order.total_price = (base_sum * conversion_rate).quantize(Decimal('0.01'))
        order.exchange_rate = conversion_rate

    order.save(update_fields=['total_price', 'services_total', 'exchange_rate'])


@transaction.atomic
def confirm_order(order):
    if order.status != 'CONFIRMED':
        order.status = 'CONFIRMED'
        order.save(update_fields=['status'])
        calculate_total(order)

    return order


