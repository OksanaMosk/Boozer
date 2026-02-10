from django.db import models

from apps.venue.models import User
from core.models import BaseModel


class ReviewModel(BaseModel):
    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        unique_together = ('user', 'venue')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    venue = models.ForeignKey('venue.VenueModel', on_delete=models.CASCADE, related_name='reviews')

    rating = models.PositiveIntegerField()
    comment = models.TextField(blank=True, null=True)
    def __str__(self):
        return f"{self.user.username} — {self.venue.name} ({self.rating})"


class FavoriteVenue(BaseModel):
    class Meta:
        db_table = 'favorite_venues'
        unique_together = ('user', 'venue')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    venue = models.ForeignKey('venue.VenueModel', on_delete=models.CASCADE, related_name='favorited_by')

    def __str__(self):
        return f"{self.user.username} → {self.venue.name}"


