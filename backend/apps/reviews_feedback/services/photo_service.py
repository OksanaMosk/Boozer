from django.core.exceptions import ValidationError
from apps.reviews_feedback.models import ReviewPhotoModel, ReviewModel
from django.db import transaction

class ReviewPhotoService:

    MAX_PHOTOS = 3

    @staticmethod
    @transaction.atomic
    def add_photo(review: ReviewModel, photo_file) -> ReviewPhotoModel:
        review = ReviewModel.objects.select_for_update().get(id=review.id)

        if review.review_photos.count() >= ReviewPhotoService.MAX_PHOTOS:
            raise ValidationError(
                f'Cannot add more than {ReviewPhotoService.MAX_PHOTOS} photos per review.'
            )

        return ReviewPhotoModel.objects.create(
            review=review,
            photo=photo_file,
        )

    @staticmethod
    def get_photos(review: ReviewModel):
        return review.review_photos.all()

    @staticmethod
    def remove_photo(photo: ReviewPhotoModel):
        photo.delete()
