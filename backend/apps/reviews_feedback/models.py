from django.db import models

from apps.venue.models import User
from core.models import BaseModel
from core.services.file_service import upload_review_photo


class ReviewModel(BaseModel):
    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        unique_together = ('user', 'venue')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    venue = models.ForeignKey('venue.VenueModel', on_delete=models.CASCADE, related_name='reviews')

    rating = models.PositiveIntegerField()
    comment = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to=upload_review_photo, blank=True)

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


class FavoriteVenue(BaseModel):
    class Meta:
        db_table = 'favorite_venues'
        unique_together = ('user', 'venue')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    venue = models.ForeignKey('venue.VenueModel', on_delete=models.CASCADE, related_name='favorite_by')

    def __str__(self):
        return f"{self.user.username} → {self.venue.name}"


