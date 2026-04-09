
from django.db import transaction

from apps.reviews_feedback.models import ReviewLike, ReviewReport, ReviewModel


class ReviewService:

    @staticmethod
    @transaction.atomic
    def toggle_like(user, review):
        like, created = ReviewLike.objects.get_or_create(user=user, review=review)
        if not created:
            like.delete()
            return False, review.likes.count()
        return True, review.likes.count()


    @staticmethod
    def create_report(user, review, reason, comment=None):
        return ReviewReport.objects.create(
            user=user, review=review, reason=reason, comment=comment
        )

    @staticmethod
    def get_reviews(venue_id=None, user_id=None):
        queryset = ReviewModel.objects.filter(is_published=True).prefetch_related(
            'review_photos',
            'reports',
            'reports__user'
        )
        if venue_id:
            queryset = queryset.filter(venue_id=venue_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset
