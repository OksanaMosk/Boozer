import requests
from configs.settings import GOOGLE_MAPS_API_KEY

def geocode_city(city: str, country: str):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": f"{city}, {country}", "key": GOOGLE_MAPS_API_KEY, "language": "en" }
    response = requests.get(url, params=params).json()

    if response["status"] == "OK":
        location = response["results"][0]["geometry"]["location"]
        return location["lat"], location["lng"]
    return 0, 0
