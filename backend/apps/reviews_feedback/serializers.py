from rest_framework import serializers
from .models import ReviewModel, FavoriteVenue

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewModel
        fields = ['id', 'user', 'venue', 'rating', 'comment', 'created_at']

class FavoriteVenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteVenue
        fields = ['id', 'user', 'venue', 'added_at']
