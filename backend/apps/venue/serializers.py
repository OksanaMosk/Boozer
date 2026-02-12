from rest_framework import serializers
from .models import VenueModel, VenuePhotoModel, TableModel, TableBookingModel, TagModel


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TagModel
        fields = ['id', 'name']

class VenuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenuePhotoModel
        fields = ['id', 'photo', 'is_main', 'venue']


class TableBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableBookingModel
        fields = ['id', 'order', 'table', 'time_range', 'is_active']

class TableSerializer(serializers.ModelSerializer):
    bookings = TableBookingSerializer(many=True, read_only=True)
    class Meta:
        model = TableModel
        fields = ['id', 'name', 'capacity', 'x', 'y', 'width', 'height', 'is_active', 'bookings']

class VenueSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = VenueModel
        fields = [
            'id', 'name', 'venue_admin', 'country', 'city', 'address',
            'latitude', 'longitude', 'phone', 'description',
            'opening_hours', 'features', 'average_check', 'rating', 'reviews_count',
            'status', 'views', 'daily_views', 'weekly_views', 'monthly_views',
            'edit_attempts', 'last_exchange_update',
            'tags'
        ]