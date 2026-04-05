
from django.db import transaction

from apps.reviews_feedback.models import ReviewLike, ReviewReport


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
