from django.core.exceptions import ValidationError
from django.db import transaction

from apps.reviews_feedback.models import ReviewLike, ReviewModel, ReviewPhotoModel, ReviewReport


class ReviewService:
    MAX_PHOTOS = 3

    @staticmethod
    @transaction.atomic
    def toggle_like(user, review):
        like, created = ReviewLike.objects.get_or_create(user=user, review=review)
        if not created:
            like.delete()
            return False, review.likes.count()
        return True, review.likes.count()

    @staticmethod
    @transaction.atomic
    def add_photo(review: ReviewModel, photo_file) -> ReviewPhotoModel:
        review = ReviewModel.objects.select_for_update().get(id=review.id)
        if review.review_photos.count() >= ReviewService.MAX_PHOTOS:
            raise ValidationError(
                f'Cannot add more than {ReviewService.MAX_PHOTOS} photos per review.'
            )
        return ReviewPhotoModel.objects.create(review=review, photo=photo_file)

    @staticmethod
    def remove_photo(photo: ReviewPhotoModel):
        photo.delete()

    @staticmethod
    def get_photos(review: ReviewModel):
        return review.review_photos.all()

    @staticmethod
    def create_report(user, review, reason, comment=None):
        return ReviewReport.objects.create(
            user=user, review=review, reason=reason, comment=comment
        )
