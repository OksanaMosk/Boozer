from django.db import models

from core.models import BaseModel


class TravelLogisticsModel(BaseModel):
    class Meta:
        db_table = 'travel_logistics'
        unique_together = ('venue', 'step_type')

    TO_AIRPORT = 'to_airport'
    FLIGHT = 'flight'
    FROM_AIRPORT = 'from_airport'

    STEP_TYPES = [
        (TO_AIRPORT, 'Transfer to airport'),
        (FLIGHT, 'Flight'),
        (FROM_AIRPORT, 'Transfer from airport'),
    ]

    venue = models.ForeignKey(
        'venue.VenueModel',
        related_name='travel_logistics',
        on_delete=models.CASCADE
    )

    step_type = models.CharField(
        max_length=20,
        choices=STEP_TYPES,
        default=TO_AIRPORT
    )

    price_per_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )


    def __str__(self):
        return f"{self.venue.name} | {self.get_step_type_display()} | {self.price_per_km}/km"


class AirportModel(BaseModel):
    name = models.CharField(max_length=255)
    iata_code = models.CharField(max_length=3, unique=True)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()

    class Meta:
        db_table = 'airports'
        verbose_name = "Airport"
        verbose_name_plural = "Airports"

    def __str__(self):
        return f"{self.name} ({self.iata_code})"