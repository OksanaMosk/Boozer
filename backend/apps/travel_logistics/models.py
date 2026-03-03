from django.db import models

from core.constants.currencies import CURRENCY_CHOICES
from core.constants.extra_services import SERVICE_TYPES, PRICE_TYPES, FIXED
from core.constants.travel_logistics import STEP_TYPES, TO_AIRPORT
from core.models import BaseModel

class TravelLogisticsModel(BaseModel):
    class Meta:
        db_table = 'travel_logistics'
        unique_together = ('venue', 'step_type')

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
    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default="UAH",
        editable=False
    )

    def save(self, *args, **kwargs):
        self.currency = self.venue.currency
        super().save(*args, **kwargs)

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


class ExtraServiceModel(BaseModel):
    class Meta:
        db_table = 'extra_services'
        unique_together = ('venue', 'service_type')

    venue = models.ForeignKey(
        'venue.VenueModel',
        related_name='extra_services',
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=100)

    service_type = models.CharField(
        max_length=50,
        choices=SERVICE_TYPES
    )

    price_type = models.CharField(
        max_length=20,
        choices=PRICE_TYPES,
        default=FIXED
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default="UAH",
        editable=False
    )

    def save(self, *args, **kwargs):
        self.currency = self.venue.currency
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.venue.name} | {self.name} | {self.price}"