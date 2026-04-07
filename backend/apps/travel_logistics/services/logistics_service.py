from django.db import transaction

from apps.travel_logistics.models import TravelLogisticsModel, ExtraServiceModel


def check_logistics_step_exists(venue_id, step_type):
    return TravelLogisticsModel.objects.filter(venue_id=venue_id, step_type=step_type).exists()

@transaction.atomic
def bulk_update_logistics_prices(venue_id, prices_data):
    updated_steps = []
    for item in prices_data:
        step, _ = TravelLogisticsModel.objects.update_or_create(
            venue_id=venue_id,
            step_type=item.get('step_type'),
            defaults={'price_per_km': item.get('price_per_km')}
        )
        updated_steps.append(step)
    return updated_steps

@transaction.atomic
def bulk_update_extra_services(venue_id, services_data):
    updated_services = []
    for item in services_data:
        service, _ = ExtraServiceModel.objects.update_or_create(
            venue_id=venue_id,
            service_type=item.get('service_type'),
            defaults={
                'name': item.get('name', item.get('service_type')),
                'price': item.get('price'),
                'price_type': item.get('price_type', 'fixed')
            }
        )
        updated_services.append(service)
    return updated_services