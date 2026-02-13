
from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth import get_user_model

from apps.menu.models import MenuItem
from apps.orders.models import OrderModel
from django.contrib.postgres.fields import DateTimeRangeField
from django.contrib.postgres.indexes import GistIndex

from apps.venue.services.venue_service import notify_admin
from core.services.file_service import upload_venue_photo
from core.models import BaseModel
from countries_cities import COUNTRIES

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

    description = models.TextField(blank=True, null=True)
    opening_hours = models.JSONField(blank=True, null=True)
    features = models.JSONField(blank=True, null=True)

    average_check = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
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
        through='VenueTag',
        blank=True,
        related_name='venues'
    )

    def notify_manager(self):
        notify_admin(self)



class VenuePhotoModel(models.Model):
    class Meta:
        db_table = 'venue_photos'

    venue = models.ForeignKey(VenueModel, related_name='photos', on_delete=models.CASCADE)
    photo = models.ImageField(upload_to=upload_venue_photo)
    is_main = models.BooleanField(default=False)


class VenueTag(models.Model):
    venue = models.ForeignKey(VenueModel, on_delete=models.CASCADE)
    tag = models.ForeignKey(TagModel, on_delete=models.CASCADE)

    class Meta:
        db_table = 'venue_tags'
        unique_together = ('venue', 'tag')


class TableModel(models.Model):
    class Meta:
        unique_together = ('venue', 'name')

    venue = models.ForeignKey(VenueModel, on_delete=models.CASCADE, related_name='tables')
    name = models.CharField(max_length=50)
    capacity = models.PositiveIntegerField()
    x = models.FloatField(null=True, blank=True)
    y = models.FloatField(null=True, blank=True)
    width = models.FloatField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Table {self.name} at {self.venue.name}"

class TableBookingModel(models.Model):
    order = models.OneToOneField(
        OrderModel,
        on_delete=models.CASCADE,
        related_name='table_booking'
    )

    table = models.ForeignKey(
        TableModel,
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    time_range = DateTimeRangeField(
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'table_bookings'
        indexes = [
            GistIndex(fields=['table', 'time_range']),
        ]
        constraints = [
            # DB-level constraint для запобігання overlap
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

    def clean(self):
        start_date = self.time_range.lower.date()
        end_date = self.time_range.upper.date()

        if not (self.order.start_date <= start_date <= self.order.end_date):
            raise ValidationError("Booking start must be within order period.")

        if not (self.order.start_date <= end_date <= self.order.end_date):
            raise ValidationError("Booking end must be within order period.")

        if self.time_range.lower >= self.time_range.upper:
            raise ValidationError("Booking start must be before booking end.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        start = self.time_range.lower.strftime('%Y-%m-%d %H:%M')
        end = self.time_range.upper.strftime('%Y-%m-%d %H:%M')
        return f"Booking for {self.table.name} ({start} → {end})"






# class TableBooking(models.Model):
#     order = models.OneToOneField(OrderModel, on_delete=models.CASCADE, related_name='table_booking')
#     table = models.ForeignKey(TableModel, on_delete=models.CASCADE, related_name='bookings')
#     time_range = DateTimeRangeField()
#     is_active = models.BooleanField(default=True)
#
#     class Meta:
#         db_table = 'table_bookings'
#         indexes = [
#             GistIndex(fields=['table', 'time_range']),
#         ]
#         ordering = ['time_range']
#
#     def clean(self):
#         # Перевірка, що бронювання всередині періоду замовлення
#         if not (self.order.start_date <= self.time_range.lower.date() <= self.order.end_date):
#             raise ValidationError("Booking start must be within order period.")
#         if not (self.order.start_date <= self.time_range.upper.date() <= self.order.end_date):
#             raise ValidationError("Booking end must be within order period.")
#
#         # Перевірка на перетин з іншими бронюваннями
#         conflicts = TableBooking.objects.filter(
#             table=self.table,
#             time_range__overlap=self.time_range
#         ).exclude(id=self.id).exists()
#
#         if conflicts:
#             raise ValidationError("This table is already booked for this time.")
#
#     def save(self, *args, **kwargs):
#         self.full_clean()
#         super().save(*args, **kwargs)
#
#     def __str__(self):
#         start = self.time_range.lower.strftime('%Y-%m-%d %H:%M')
#         end = self.time_range.upper.strftime('%Y-%m-%d %H:%M')
#         return f"Booking for {self.table.name} ({start} → {end})"
