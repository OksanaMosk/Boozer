import requests
from django.core.management.base import BaseCommand
from apps.travel_logistics.models import AirportModel


class Command(BaseCommand):
    """
    Management command to seed the database with major international airports.
    Downloads data from an open-source repository and saves it to Supabase.
    """
    help = 'Seeds the database with major international airports'

    def handle(self, *args, **kwargs):
        url = "https://raw.githubusercontent.com/mwgg/Airports/master/airports.json"
        self.stdout.write(self.style.NOTICE("Step 1: Downloading airport data..."))

        try:
            response = requests.get(url, timeout=20)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to download data: {e}"))
            return

        self.stdout.write(self.style.NOTICE("Step 2: Processing data..."))

        airports_to_create = []

        items = data if isinstance(data, list) else data.values()

        for info in items:
            if isinstance(info, dict):
                iata_code = info.get('iata')

                if iata_code and isinstance(iata_code, str) and len(iata_code) == 3:
                    airports_to_create.append(
                        AirportModel(
                            name=info.get('name', 'Unknown Airport'),
                            iata_code=iata_code.upper(),
                            city=info.get('city', 'Unknown City'),
                            country=info.get('country', 'Unknown Country'),
                            latitude=float(info.get('lat', 0)),
                            longitude=float(info.get('lon', 0))
                        )
                    )

        found_count = len(airports_to_create)
        self.stdout.write(f"Found {found_count} valid airports.")

        if found_count == 0:
            self.stdout.write(self.style.ERROR("No valid airports found. Check JSON structure."))
            return

        self.stdout.write(self.style.NOTICE("Step 3: Uploading to Supabase (Bulk Create)..."))

        try:
            AirportModel.objects.bulk_create(
                airports_to_create,
                ignore_conflicts=True
            )
            total_in_db = AirportModel.objects.count()
            self.stdout.write(self.style.SUCCESS(
                f"Successfully seeded! Total airports in DB: {total_in_db}"
            ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Database error: {e}"))