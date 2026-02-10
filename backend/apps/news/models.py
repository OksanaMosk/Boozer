from django.db import models
from core.models import BaseModel


class NewsModel(BaseModel):
    class Meta:
        db_table = 'venue_news'
        ordering = ['-created_at']

    venue = models.ForeignKey( 'venue.VenueModel',on_delete=models.CASCADE, related_name='news')
    title = models.CharField(max_length=255)
    content = models.TextField()
    photo = models.ImageField(upload_to='venue_news/', blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.venue.name})"
