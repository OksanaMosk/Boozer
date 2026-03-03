
from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth import get_user_model

from apps.menu.models import MenuItemModel
from apps.orders.models import OrderModel
from django.contrib.postgres.fields import DateTimeRangeField
from django.contrib.postgres.indexes import GistIndex

from apps.venue.services.geocode import geocode_city
from apps.venue.services.venue_service import notify_admin
from core.constants.countries_cities import COUNTRIES
from core.constants.currencies import CURRENCY_CHOICES
from core.services.file_service import upload_venue_photo
from core.models import BaseModel


from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields.ranges import RangeOperators
from django.db.models import Q


User = get_user_model()



class TagModel(models.Model):
    class Meta:
        db_table = 'tags'

    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class VenueModel( BaseModel):
    class Meta:
        db_table = 'venue'

    def __str__(self):
        return f"{self.name} {self.country} {self.city}"

    name = models.CharField(max_length=50)
    venue_admin = models.ForeignKey(get_user_model(), related_name='venues', on_delete=models.CASCADE)

    country = models.CharField(max_length=50, choices=[(b, b) for b in COUNTRIES], default=COUNTRIES[0][0])
    city = models.CharField(max_length=50, default='')
    address = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    background_tables = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    opening_hours = models.JSONField(blank=True, null=True)
    features = models.JSONField(blank=True, null=True)

    average_check = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default="UAH"
    )
    rating = models.FloatField(default=0)
    reviews_count = models.PositiveIntegerField(default=0)


    status = models.CharField(
        max_length=50,
        choices=[('active', 'Active'), ('inactive', 'Inactive'), ('pending', 'Pending')],
        default='pending'
    )
    views = models.PositiveIntegerField(default=0)
    daily_views = models.PositiveIntegerField(default=0)
    weekly_views = models.PositiveIntegerField(default=0)
    monthly_views = models.PositiveIntegerField(default=0)
    edit_attempts = models.PositiveIntegerField(default=0)
    last_exchange_update = models.DateField(null=True, blank=True)
    tags = models.ManyToManyField(
        TagModel,
        through='VenueTagModel',
        blank=True,
        related_name='venues'
    )

    def notify_manager(self):
        notify_admin(self)

    def save(self, *args, **kwargs):

        if not self.latitude or not self.longitude:
            lat, lng = geocode_city(self.city, self.country)
            self.latitude = lat
            self.longitude = lng

        super().save(*args, **kwargs)

class VenuePhotoModel(models.Model):
    class Meta:
        db_table = 'venue_photos'

    venue = models.ForeignKey(VenueModel, related_name='photos', on_delete=models.CASCADE)
    photo = models.ImageField(upload_to=upload_venue_photo)
    is_main = models.BooleanField(default=False)


class VenueTagModel(models.Model):
    venue = models.ForeignKey(VenueModel, on_delete=models.CASCADE)
    tag = models.ForeignKey(TagModel, on_delete=models.CASCADE)

    class Meta:
        db_table = 'venue_tags'
        unique_together = ('venue', 'tag')


class TableModel(models.Model):
    class Meta:
        db_table = 'tables'

    venue = models.ForeignKey(VenueModel, on_delete=models.CASCADE, related_name='tables')
    capacity = models.PositiveIntegerField()
    x = models.FloatField(null=True, blank=True)
    y = models.FloatField(null=True, blank=True)
    width = models.FloatField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Table {self.capacity} at {self.venue.name}"


class TableBookingModel(models.Model):
    order = models.ForeignKey(
        OrderModel,
        on_delete=models.CASCADE,
        related_name='table_bookings'
    )

    table = models.ForeignKey(
        TableModel,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    time_range = DateTimeRangeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

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
            raise ValidationError("Table and order must belong to same venue.")

        start = self.time_range.lower
        end = self.time_range.upper

        if start >= end:
            raise ValidationError("Booking start must be before booking end.")

        if not (self.order.start_date <= start.date() <= self.order.end_date):
            raise ValidationError("Booking start must be within order period.")

        if not (self.order.start_date <= end.date() <= self.order.end_date):
            raise ValidationError("Booking end must be within order period.")

        existing_capacity = sum(
            b.table.capacity
            for b in self.order.table_bookings.exclude(pk=self.pk)
        )
        total_capacity = existing_capacity + self.table.capacity
        if total_capacity < self.order.guests_count:
            raise ValidationError("Not enough seats assigned for this order.")