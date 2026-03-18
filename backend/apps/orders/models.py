from django.core.exceptions import ValidationError
from django.db import models
from apps.menu.models import MenuItemModel
from apps.travel_logistics.models import ExtraServiceModel
from core.constants.currencies import CURRENCY_CHOICES
from core.models import BaseModel
from django.conf import settings
from django.contrib.postgres.fields import DateTimeRangeField
from django.contrib.postgres.indexes import GistIndex
from core.constants.order import STATUS_CHOICES, BUDGET_CHOICES, PAYMENT_CHOICES, GENDER_CHOICES
from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields.ranges import RangeOperators
from django.db.models import Q

class OrderModel(BaseModel):
    class Meta:
        db_table = 'orders'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )

    venue = models.ForeignKey(
        'venue.VenueModel',
        on_delete=models.CASCADE,
        related_name='orders',
        default=1
    )

    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default="UAH")

    exchange_rate = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        default=1
    )

    start_date = models.DateField()
    end_date = models.DateField()
    guests_count = models.PositiveIntegerField()
    payment_type = models.CharField(
        max_length=50,
        choices=PAYMENT_CHOICES,
        default='Each pays for themselves'
    )

    budget_range = models.CharField(
        max_length=10,
        choices=BUDGET_CHOICES,
        null=True,
        blank=True
    )

    gender_preference = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        default='ANY'
    )
    comment = models.TextField(blank=True, null=True)

    user_city = models.CharField(max_length=100)
    user_latitude = models.FloatField()
    user_longitude = models.FloatField()
    venue_latitude = models.FloatField(null=True, blank=True)
    venue_longitude = models.FloatField(null=True, blank=True)
    distance_km = models.FloatField(null=True, blank=True)
    flight_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transfer_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    services_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    expires_at = models.DateTimeField(null=True, blank=True)
    travel_calculation = models.JSONField(null=True, blank=True)

    @property
    def menu_total(self):
        return sum(item.price * item.quantity for item in self.items.all())

    def __str__(self):
        return f'Order #{self.id} — {self.venue.name}'

    def clean(self):
        if self.end_date < self.start_date:
            raise ValidationError('End date must be after start date')

    def save(self, *args, **kwargs):
        is_new = self.pk is None

        if is_new and self.venue:
            self.currency = self.venue.currency
            self.venue_latitude = self.venue.latitude
            self.venue_longitude = self.venue.longitude

        if not is_new:
            old = OrderModel.objects.get(pk=self.pk)
            status_changed_to_confirmed = (
                    old.status != self.status and self.status == 'CONFIRMED'
            )
        else:
            status_changed_to_confirmed = self.status == 'CONFIRMED'

        super().save(*args, **kwargs)

        if status_changed_to_confirmed:
            self.table_bookings.all().update(status='CONFIRMED', is_active=True)
            from apps.orders.services.order_service import calculate_total
            calculate_total(self)


class TableBookingModel(models.Model):
    order = models.ForeignKey(
        OrderModel,
        on_delete=models.CASCADE,
        related_name='table_bookings'
    )

    table = models.ForeignKey(
        'venue.TableModel',
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    time_range = DateTimeRangeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')

    class Meta:
        db_table = 'table_bookings'
        indexes = [GistIndex(fields=['table', 'time_range'])]
        constraints = [
            ExclusionConstraint(
                name='prevent_overlapping_bookings',
                expressions=[
                    ('table', RangeOperators.EQUAL),
                    ('time_range', RangeOperators.OVERLAPS),
                ],
                condition=Q(is_active=True),
            ),
        ]
        ordering = ['time_range']

    @property
    def user(self):
        return self.order.user

    def clean(self):
        if self.table.venue_id != self.order.venue_id:
            raise ValidationError('Table and order must belong to same venue.')

        start = self.time_range.lower
        end = self.time_range.upper

        if start >= end:
            raise ValidationError('Booking start must be before booking end.')

        if not (self.order.start_date <= start.date() <= self.order.end_date):
            raise ValidationError('Booking start must be within order period.')

        if not (self.order.start_date <= end.date() <= self.order.end_date):
            raise ValidationError('Booking end must be within order period.')

        existing_capacity = sum(
            b.table.capacity
            for b in self.order.table_bookings.exclude(pk=self.pk)
        )
        total_capacity = existing_capacity + self.table.capacity
        if total_capacity < self.order.guests_count:
            raise ValidationError('Not enough seats assigned for this order.')


class OrderItemModel(BaseModel):
    class Meta:
        db_table = 'order_items'

    order = models.ForeignKey(
        OrderModel,
        on_delete=models.CASCADE,
        related_name='items',
    )

    menu_item = models.ForeignKey(
        MenuItemModel,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.menu_item.name} x{self.quantity}"


class OrderExtraServiceModel(models.Model):
    order = models.ForeignKey(
        OrderModel,
        on_delete=models.CASCADE,
        related_name='extra_services',
    )

    service = models.ForeignKey(
        ExtraServiceModel,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_extra_services'

