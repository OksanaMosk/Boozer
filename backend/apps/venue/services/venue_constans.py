from countries_models import COUNTRIES, CITIES_BY_COUNTRY


def get_venue_constants():
    if not COUNTRIES or not CITIES_BY_COUNTRY:
        raise ValueError('One or more constants are empty.')

    return {
        'countries': COUNTRIES,
        'cities_by_country': CITIES_BY_COUNTRY,
    }