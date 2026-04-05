from django.db import models

from apps.venue.models import User
from core.models import BaseModel
from core.services.file_service import upload_review_photo

from django.core.validators import MaxValueValidator

class SubRatingsMixin(models.Model):
    food_rating = models.PositiveSmallIntegerField(default=0, validators=[MaxValueValidator(5)])
    service_rating = models.PositiveSmallIntegerField(default=0, validators=[MaxValueValidator(5)])
    atmosphere_rating = models.PositiveSmallIntegerField(default=0, validators=[MaxValueValidator(5)])
    cleanliness_rating = models.PositiveSmallIntegerField(default=0, validators=[MaxValueValidator(5)])
    value_rating = models.PositiveSmallIntegerField(default=0, validators=[MaxValueValidator(5)])

    class Meta:
        abstract = True

class ReviewModel(SubRatingsMixin, BaseModel):
    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'order'],
                name='unique_review_per_order',
                condition=models.Q(order__isnull=False)
            )
        ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    venue = models.ForeignKey('venue.VenueModel', on_delete=models.CASCADE, related_name='reviews')
    order = models.OneToOneField(
        'orders.OrderModel',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='review'
    )
    rating = models.DecimalField(max_digits=2, decimal_places=1)
    comment = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to=upload_review_photo, blank=True)

    is_published = models.BooleanField(default=True)
    owner_reply = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} — {self.venue.name} ({self.rating})"


class ReviewPhotoModel(models.Model):
    review = models.ForeignKey(
        ReviewModel,
        related_name='review_photos',
        on_delete=models.CASCADE
    )
    photo = models.ImageField(upload_to=upload_review_photo)

    class Meta:
        db_table = 'review_photos'


class ReviewLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_likes')
    review = models.ForeignKey(ReviewModel, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'review_likes'
        unique_together = ('user', 'review')

class ReviewReport(models.Model):
    REPORT_REASONS = [
        ('Spam', 'Spam'),
        ('Fake', 'Fake'),
        ('Abuse', 'Abuse'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_reports')
    review = models.ForeignKey(ReviewModel, on_delete=models.CASCADE, related_name='reports')
    reason = models.CharField(max_length=20, choices=REPORT_REASONS)
    comment = models.TextField(blank=True, null=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'review_reports'


class FavoriteCollection(BaseModel):
    TOP_CATEGORIES = [
        ('wedding', 'Wedding'),
        ('corporate', 'Corporate'),
        ('birthday', 'Birthday'),
        ('date', 'Date'),
        ('party', 'Party'),
        ('meeting', 'Business Meeting'),
        ('general', 'General'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_collections')
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=50, default='general')

    is_staff_top = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    def get_category_label(self):
        return dict(self.TOP_CATEGORIES).get(self.category, self.category.capitalize())

    class Meta:
        db_table = 'favorite_collections'
        unique_together = ('user', 'name')

    def __str__(self):
        return f"{self.name} ({self.get_category_label()})"



class FavoriteVenue(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    venue = models.ForeignKey('venue.VenueModel', on_delete=models.CASCADE, related_name='favorite_by')
    collection = models.ForeignKey(
        FavoriteCollection,
        on_delete=models.CASCADE,
        related_name='items',
        null=True,
        blank=True
    )
    position = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'favorite_venues'
        unique_together = ('user', 'venue', 'collection')

    def __str__(self):
        full_name = f"{self.user.name or ''} {self.user.surname or ''}".strip()
        return f"{full_name or self.user.username} → {self.venue.name}"

