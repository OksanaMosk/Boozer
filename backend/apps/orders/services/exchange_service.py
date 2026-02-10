import datetime
from decimal import Decimal

from rest_framework.exceptions import ValidationError
import requests


def get_private_bank_exchange_rate():
    response = requests.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
    response.raise_for_status()
    data = response.json()

    usd_rate = next((item for item in data if item['ccy'] == 'USD'), None)
    eur_rate = next((item for item in data if item['ccy'] == 'EUR'), None)

    if not usd_rate or not eur_rate:
        raise ValidationError('Failed to retrieve USD or EUR exchange rate from PrivatBank.')

    return {
        'USD': float(usd_rate['buy']),
        'EUR': float(eur_rate['buy']),
    }


def update_venue_prices(venue, rates=None):
    current_date = datetime.date.today()
    if venue.last_exchange_update == current_date:
        return

    if rates is None:
        rates = get_private_bank_exchange_rate()

    venue.exchange_rate_id = f'Privatbank_{current_date}'

    if venue.currency == 'USD':
        venue.price_usd = Decimal(venue.price).quantize(Decimal('0.01'))
        venue.price_eur = (Decimal(venue.price) * Decimal(rates['EUR']) / Decimal(rates['USD'])).quantize(
            Decimal('0.01'))
    elif venue.currency == 'EUR':
        venue.price_eur = Decimal(venue.price).quantize(Decimal('0.01'))
        venue.price_usd = (Decimal(venue.price) * Decimal(rates['USD']) / Decimal(rates['EUR'])).quantize(
            Decimal('0.01'))
    else:
        venue.price_usd = (Decimal(venue.price) / Decimal(rates['USD'])).quantize(Decimal('0.01'))
        venue.price_eur = (Decimal(venue.price) / Decimal(rates['EUR'])).quantize(Decimal('0.01'))

    venue.last_exchange_update = current_date