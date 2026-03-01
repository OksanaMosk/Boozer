from django.db import models
from core.models import BaseModel


class NewsModel(BaseModel):
    class NewsType(models.TextChoices):
        GENERAL = 'general', 'General'
        PROMOTION = 'promotion', 'Promotion'
        EVENT = 'event', 'Event'

    class NewsStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACTIVE = 'active', 'Active'

    class Meta:
        db_table = 'venue_news'
        ordering = ['-created_at']

    venue = models.ForeignKey(
        'venue.VenueModel',
        on_delete=models.CASCADE,
        related_name='news'
    )

    title = models.CharField(max_length=255)
    content = models.TextField()

    type = models.CharField(
        max_length=20,
        choices=NewsType.choices,
        default=NewsType.GENERAL
    )

    status = models.CharField(
        max_length=20,
        choices=NewsStatus.choices,
        default=NewsStatus.PENDING
    )

    end_date = models.DateTimeField(
        blank=True,
        null=True
    )

    views_count = models.PositiveIntegerField(default=0)

    is_pinned = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} ({self.venue.name})"


class NewsImageModel(models.Model):
    news = models.ForeignKey(
        NewsModel,
        on_delete=models.CASCADE,
        related_name='images'
    )

    image = models.ImageField(upload_to='venue_news/')
    is_cover = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'venue_news_images'
        ordering = ['-created_at']

    def __str__(self):
        return f"Image for {self.news.title}"