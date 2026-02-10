from django.core.exceptions import ValidationError
from django.db import models
from apps.menu.models import MenuItem
from core.models import BaseModel
from django.conf import settings

class OrderModel(BaseModel):
    class Meta:
        db_table = 'orders'

    STATUS_CHOICES = (
        ('new', 'New'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )

    venue = models.ForeignKey(
        'venue.VenueModel',
        on_delete=models.CASCADE,
        related_name='orders'
    )

    currency = models.CharField(
        max_length=3,
        choices=[('UAH', 'UAH'), ('USD', 'USD'), ('EUR', 'EUR')],
        default='UAH'
    )

    exchange_rate = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        default=1
    )

    start_date = models.DateField()
    end_date = models.DateField()
    guests_count = models.PositiveIntegerField()
    comment = models.TextField(blank=True, null=True)

    user_city = models.CharField(max_length=100)
    user_latitude = models.FloatField()
    user_longitude = models.FloatField()

    distance_km = models.FloatField(null=True, blank=True)
    flight_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transfer_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)


    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new'
    )

    def __str__(self):
        return f"Order #{self.id} — {self.venue.name}"

    def clean(self):
        if self.end_date < self.start_date:
            raise ValidationError("End date must be after start date")



class OrderItemModel(BaseModel):
    class Meta:
        db_table = 'order_items'

    order = models.ForeignKey(
        OrderModel,
        on_delete=models.CASCADE,
        related_name='items'
    )

    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # фіксована ціна на момент замовлення

    def __str__(self):
        return f"{self.menu_item.name} x{self.quantity}"

class ExtraServiceModel(models.Model):
    class Meta:
        db_table = 'extra_services'

    SERVICE_TYPES = (
        ('hotel', 'Hotel Stay'),
        ('insurance', 'Insurance'),
        ('decoration', 'Decoration'),
    )

    name = models.CharField(max_length=100)
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class OrderExtraServiceModel(models.Model):
    order = models.ForeignKey(
        OrderModel,
        on_delete=models.CASCADE,
        related_name='extra_services'
    )

    service = models.ForeignKey(
        ExtraServiceModel,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'order_extra_services'
