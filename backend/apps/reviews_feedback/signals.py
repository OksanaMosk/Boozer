from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg

from apps.reviews_feedback.models import ReviewModel


@receiver([post_save, post_delete], sender=ReviewModel)
def update_venue_rating(sender, instance, **kwargs):
    venue = instance.venue
    stats = venue.reviews.filter(is_published=True).aggregate(avg=Avg('rating'))

    raw_avg = stats['avg'] or 0
    venue.rating = round(raw_avg, 1)


    venue.reviews_count = venue.reviews.filter(is_published=True).count()
    venue.save(update_fields=['rating', 'reviews_count'])
