import datetime
import requests
from decimal import Decimal
from rest_framework.exceptions import ValidationError

_last_rates_cache = None
_last_rates_date = None


def get_private_bank_exchange_rate():
    response = requests.get(
        'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5'
    )
    response.raise_for_status()
    data = response.json()

    usd_rate = next((item for item in data if item['ccy'] == 'USD'), None)
    eur_rate = next((item for item in data if item['ccy'] == 'EUR'), None)

    if not usd_rate or not eur_rate:
        raise ValidationError('Failed to retrieve USD or EUR exchange rate.')

    return {
        'USD': Decimal(usd_rate['buy']),
        'EUR': Decimal(eur_rate['buy']),
    }


def get_today_rates():
    global _last_rates_cache, _last_rates_date

    today = datetime.date.today()

    if _last_rates_cache and _last_rates_date == today:
        return _last_rates_cache

    rates = get_private_bank_exchange_rate()
    _last_rates_cache = rates
    _last_rates_date = today

    return rates