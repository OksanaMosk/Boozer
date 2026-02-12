from django.core.exceptions import ValidationError

from apps.venue.models import VenueModel, VenuePhotoModel


class VenuePhotoService:

    MAX_PHOTOS = 7

    @staticmethod
    def add_photo(venue: VenueModel, photo_file) -> VenuePhotoModel:
        current_count = venue.photos.count()
        if current_count >= VenuePhotoService.MAX_PHOTOS:
            raise ValidationError(f'Cannot add more than {VenuePhotoService.MAX_PHOTOS} photos per venue.')

        is_first = current_count == 0
        new_photo = VenuePhotoModel.objects.create(
            venue=venue,
            photo=photo_file,
            is_main=is_first
        )
        return new_photo

    @staticmethod
    def get_photos(venue: VenueModel):
        return venue.photos.all()

    @staticmethod
    def set_main_photo(photo: VenuePhotoModel):
        VenuePhotoModel.objects.filter(venue=photo.venue).update(is_main=False)
        photo.is_main = True
        photo.save()
        return photo

    @staticmethod
    def remove_photo(photo: VenuePhotoModel):
        venue = photo.venue
        was_main = photo.is_main
        photo.delete()

        if was_main:
            first_photo = venue.photos.first()
            if first_photo:
                first_photo.is_main = True
                first_photo.save()
