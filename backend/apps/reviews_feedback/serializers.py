from rest_framework import serializers
from .models import ReviewModel, FavoriteVenue, ReviewPhotoModel


class ReviewPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewPhotoModel
        fields = ['id', 'photo']


class ReviewSerializer(serializers.ModelSerializer):
    review_photos = ReviewPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = ReviewModel
        fields = [
            'id',
            'user',
            'venue',
            'rating',
            'comment',
            'review_photos'
        ]


class FavoriteVenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteVenue
        fields = ['id', 'user', 'venue']

