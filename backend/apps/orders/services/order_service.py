from apps.orders.services.exchange_service import get_private_bank_exchange_rate
from apps.venue.models import OrderModel
from decimal import Decimal

def calculate_total(order: OrderModel):
    rates = get_private_bank_exchange_rate()

    menu_total = sum(
        item.price * item.quantity
        for item in order.items.all()
    )

    extra_services_total = sum(
        es.service.price * es.quantity
        for es in order.extra_services.select_related('service')
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

    elif order.currency == 'USD':
        rate = Decimal(str(rates['USD']))
        order.total_price = (total_uah / rate).quantize(Decimal('0.01'))
        order.exchange_rate = rate

    elif order.currency == 'EUR':
        rate = Decimal(str(rates['EUR']))
        order.total_price = (total_uah / rate).quantize(Decimal('0.01'))
        order.exchange_rate = rate

    order.save(update_fields=['total_price', 'exchange_rate'])
