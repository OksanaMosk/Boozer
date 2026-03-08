from decimal import Decimal
from apps.orders.services.exchange_service import get_today_rates
from datetime import timedelta
from django.utils import timezone
from django.db import transaction


def create_order_with_details(user, venue_id, validated_data, items_data, extra_services_data):
    with transaction.atomic():
        from apps.orders.models import OrderModel, OrderExtraServiceModel, OrderItemModel

        validated_data['expires_at'] = timezone.now() + timedelta(minutes=10)

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
    rates = get_today_rates()

    menu_total = sum(
        item.price * item.quantity
        for item in order.items.select_related('menu_item')
    )

    extra_services_total = sum(
        es.price * es.quantity
        for es in order.extra_services.all()
    )

    total_uah = (
        menu_total
        + extra_services_total
        + order.transfer_price
        + order.flight_price
    )

    if order.currency == 'UAH':
        order.total_price = total_uah
        order.exchange_rate = Decimal('1')
    else:
        if order.currency not in rates:
            raise ValueError(f"Exchange rate for {order.currency} not available")
        rate = Decimal(str(rates[order.currency]))
        order.total_price = (total_uah / rate).quantize(Decimal('0.01'))
        order.exchange_rate = rate

    order.save(update_fields=['total_price', 'exchange_rate'])


@transaction.atomic
def confirm_order(order):
    if order.status != 'CONFIRMED':
        order.status = 'CONFIRMED'
        order.save(update_fields=['status'])
        calculate_total(order)

    return order


