import googlemaps
from django.conf import settings
from math import radians, cos, sin, asin, sqrt
from .models import AirportModel

class TravelCalculationService:
    def __init__(self, venue):
        self.venue = venue
        self.gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)

    def _haversine(self, lat1, lon1, lat2, lon2):
        R = 6371
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        a = sin((lat2 - lat1) / 2) ** 2 + cos(lat1) * cos(lat2) * sin((lon2 - lon1) / 2) ** 2
        return 2 * R * asin(sqrt(a))

    def _find_closest_airport(self, lat, lng):
        airports = AirportModel.objects.all()
        if not airports.exists():
            return None
        return min(airports, key=lambda p: self._haversine(lat, lng, p.latitude, p.longitude))

    def calculate_trip(self, v_lat, v_lng):
        start_airport = self._find_closest_airport(v_lat, v_lng)
        end_airport = self._find_closest_airport(self.venue.latitude, self.venue.longitude)

        if not start_airport or not end_airport:
            return {"error": "Airports database is empty"}

        # Get pricing from TravelLogisticsModel via related_name
        pricing = {p.step_type: float(p.price_per_km) for p in self.venue.travel_logistics.all()}

        # Correct Google Distance Matrix parsing: [0]['elements'][0]
        try:
            # Segment 1: Visitor to Airport
            res_to = self.gmaps.distance_matrix((v_lat, v_lng), (start_airport.latitude, start_airport.longitude))
            dist_to = res_to['rows'][0]['elements'][0]['distance']['value'] / 1000

            # Segment 2: Flight (Air distance)
            dist_flight = self._haversine(start_airport.latitude, start_airport.longitude,
                                         end_airport.latitude, end_airport.longitude)

            # Segment 3: Airport to Venue
            res_from = self.gmaps.distance_matrix((end_airport.latitude, end_airport.longitude),
                                                (self.venue.latitude, self.venue.longitude))
            dist_from = res_from['rows'][0]['elements'][0]['distance']['value'] / 1000
        except (KeyError, IndexError):
            return {"error": "Google Maps could not calculate road distance"}

        cost_to = dist_to * pricing.get('to_airport', 0)
        cost_flight = dist_flight * pricing.get('flight', 0)
        cost_from = dist_from * pricing.get('from_airport', 0)

        return {
            "airports": {"start": start_airport.iata_code, "end": end_airport.iata_code},
            "segments": [
                {"type": "To Airport", "km": round(dist_to, 2), "price": round(cost_to, 2)},
                {"type": "Flight", "km": round(dist_flight, 2), "price": round(cost_flight, 2)},
                {"type": "From Airport", "km": round(dist_from, 2), "price": round(cost_from, 2)}
            ],
            "total_price": round(cost_to + cost_flight + cost_from, 2)
        }