import math
import requests

from configs.settings import GOOGLE_MAPS_API_KEY

FLIGHT_RATE = 0.1
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # km

    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.asin(math.sqrt(a))
    return R * c

def calculate_flight_price(distance_km):
    return round(distance_km * FLIGHT_RATE, 2)

def get_route_distance(origin_lat, origin_lng, dest_lat, dest_lng):
    """Повертає відстань по маршруту у км за допомогою Google Maps Directions API"""
    url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": f"{origin_lat},{origin_lng}",
        "destination": f"{dest_lat},{dest_lng}",
        "key":  GOOGLE_MAPS_API_KEY,
        "mode": "driving",
    }
    response = requests.get(url, params=params)
    data = response.json()

    if data["status"] != "OK" or not data["routes"]:
        # fallback: повітряна відстань
        return haversine_distance(origin_lat, origin_lng, dest_lat, dest_lng)

    # Відстань у метрах
    distance_meters = sum(leg["distance"]["value"] for leg in data["routes"][0]["legs"])
    return round(distance_meters / 1000, 2)  # в км

def calculate_order_route(order):
    """Обчислює відстань маршруту та ціну польоту/трансферу"""
    if not all([order.user_latitude, order.user_longitude, order.venue.latitude, order.venue.longitude]):
        return

    distance_km = get_route_distance(
        order.user_latitude,
        order.user_longitude,
        order.venue.latitude,
        order.venue.longitude
    )
    order.distance_km = distance_km
    order.flight_price = calculate_flight_price(distance_km)
    order.transfer_price = round(distance_km * 0.2, 2)  # наприклад ціна трансферу
    order.save()