from django.db.models import Avg

from apps.venue.models import VenueModel


def get_average_price_by_region(region: str, model_name: str | None = None):
    if not region:
        raise ValueError('Region is required')

    venues = VenueModel.objects.filter(location__iexact=region)
    if model_name:
        venues = venues.filter(model__iexact=model_name.strip())

    avg_usd = venues.aggregate(avg_price_usd=Avg('price_usd'))['avg_price_usd'] or 0
    avg_eur = venues.aggregate(avg_price_eur=Avg('price_eur'))['avg_price_eur'] or 0
    avg_uah = venues.aggregate(avg_price_uah=Avg('price'))['avg_price_uah'] or 0

    return {
        'region': region,
        'model': model_name if model_name else 'all',
        'average_price': {
            'USD': round(avg_usd, 2),
            'EUR': round(avg_eur, 2),
            'UAH': round(avg_uah, 2)
        }
    }

def get_average_price_by_model(model_name: str):
    if not model_name:
        raise ValueError('Model is required')

    venues = VenueModel.objects.filter(model__iexact=model_name.strip())

    avg_usd = venues.aggregate(avg_price_usd=Avg('price_usd'))['avg_price_usd'] or 0
    avg_eur = venues.aggregate(avg_price_eur=Avg('price_eur'))['avg_price_eur'] or 0
    avg_uah = venues.aggregate(avg_price_uah=Avg('price'))['avg_price_uah'] or 0

    return {
        'model': model_name,
        'average_price': {
            'USD': round(avg_usd, 2),
            'EUR': round(avg_eur, 2),
            'UAH': round(avg_uah, 2)
        }
    }