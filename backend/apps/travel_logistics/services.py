import googlemaps
from decimal import Decimal
from django.conf import settings
from math import radians, cos, sin, asin, sqrt
from .models import AirportModel


class TravelCalculationService:
    def __init__(self, venue):
        self.venue = venue
        self.gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)

    @staticmethod
    def _haversine(lat1, lon1, lat2, lon2):
        r = 6371
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        a = sin((lat2 - lat1) / 2) ** 2 + cos(lat1) * cos(lat2) * sin((lon2 - lon1) / 2) ** 2
        return 2 * r * asin(sqrt(a))

    def _find_closest_airport(self, lat, lng):
        airports = AirportModel.objects.all()
        if not airports.exists():
            return None
        return min(airports, key=lambda p: self._haversine(lat, lng, p.latitude, p.longitude))

    def calculate_trip(self, v_lat, v_lng, time_range=None):
        start_airport = self._find_closest_airport(v_lat, v_lng)
        end_airport = self._find_closest_airport(self.venue.latitude, self.venue.longitude)

        if not start_airport or not end_airport:
            return {'error': 'Airports database is empty'}

        pricing = {p.step_type: float(p.price_per_km) for p in self.venue.travel_logistics.all()}

        try:
            # noinspection PyUnresolvedReferences
            res_to = self.gmaps.distance_matrix((v_lat, v_lng), (start_airport.latitude, start_airport.longitude), language='en')

            if res_to['rows'][0]['elements'][0]['status'] != 'OK':
                return {'error': 'Road not found to the starting airport'}

            dist_to = res_to['rows'][0]['elements'][0]['distance']['value'] / 1000

            dist_flight = self._haversine(start_airport.latitude, start_airport.longitude,
                                          end_airport.latitude, end_airport.longitude)
            # noinspection PyUnresolvedReferences
            res_from = self.gmaps.distance_matrix((end_airport.latitude, end_airport.longitude),
                                                  (self.venue.latitude, self.venue.longitude))
            if res_from['rows'][0]['elements'][0]['status'] != 'OK':
                return {'error': 'Road not found from airport to the venue'}

            dist_from = res_from['rows'][0]['elements'][0]['distance']['value'] / 1000

        except (KeyError, IndexError, Exception) as e:
            return {'error': f'Travel service error: {str(e)}'}

        cost_to = dist_to * pricing.get('to_airport', 0)
        cost_flight = dist_flight * pricing.get('flight', 0)
        cost_from = dist_from * pricing.get('from_airport', 0)

        travel_total = cost_to + cost_flight + cost_from

        days = 1
        if time_range and hasattr(time_range, 'lower') and time_range.lower and time_range.upper:
            delta = time_range.upper - time_range.lower
            days = max(delta.days, 1)

        extra_segments = []
        total_extra = 0

        for service in self.venue.extra_services.all():
            price = float(service.price)
            current_cost = price * days if service.price_type == 'per_day' else price

            total_extra += current_cost
            extra_segments.append({
                'type': service.get_service_type_display(),
                'name': service.name,
                'price': round(current_cost, 2),
                'calculation': f"{price} x {days}d" if service.price_type == 'per_day' else 'Fixed'
            })
        res_currency = self.venue.currency
        return {
            'currency': res_currency,
            'venue': {
                "city": self.venue.city,
            },
            'airports': {
                'start': {
                    'code': start_airport.iata_code,
                    'lat': start_airport.latitude,
                    'lng': start_airport.longitude,
                    'city': start_airport.city,
                },
                'end': {
                    'code': end_airport.iata_code,
                    'lat': end_airport.latitude,
                    'lng': end_airport.longitude,
                    'city': end_airport.city,
                }
            },
            'travel_segments': [
                {'type': 'To Airport', 'km': round(dist_to, 2), 'price': round(cost_to, 2)},
                {'type': 'Flight', 'km': round(dist_flight, 2), 'price': round(cost_flight, 2)},
                {'type': 'From Airport', 'km': round(dist_from, 2), 'price': round(cost_from, 2)}
            ],
            'extra_services': extra_segments,
            'total_price': round(travel_total + total_extra, 2)
        }

    def apply_to_order(self, order):
        if not all([order.user_latitude, order.user_longitude]):
            return

        res = self.calculate_trip(order.user_latitude, order.user_longitude)

        if 'error' in res:
            return

        seg_dict = {s.get('type'): s.get('price', 0) for s in res.get('travel_segments', []) if isinstance(s, dict)}

        order.transfer_price = Decimal(str(seg_dict.get('To Airport', 0) + seg_dict.get('From Airport', 0)))
        order.flight_price = Decimal(str(seg_dict.get('Flight', 0)))

        order.distance_km = sum(s.get('km', 0) for s in res.get('travel_segments', []))

        order.travel_calculation = res

        order.save(update_fields=['transfer_price', 'flight_price', 'distance_km', 'travel_calculation', 'venue_latitude',
        'venue_longitude'])
