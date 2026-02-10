from rest_framework import serializers
from .models import VenueModel, VenuePhotoModel, VenueTag, TableModel, TableBookingModel, TagModel
from apps.menu.models import MenuModel  # тільки якщо потрібен зв’язок
from apps.orders.models import OrderModel  # теж опційно


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TagModel
        fields = ['id', 'name']

class VenuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenuePhotoModel
        fields = ['id', 'photo']

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableModel
        fields = ['id', 'name', 'capacity', 'x', 'y', 'width', 'height', 'is_active', 'bookings']

class TableBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableBookingModel
        # fields = ['id', 'order', 'table', 'time_range', 'is_active']
        fields = ['id', 'order', 'table', 'booking_datetime', 'duration']

class VenueSerializer(serializers.ModelSerializer):
    photos = VenuePhotoSerializer(many=True, read_only=True)
    tables = TableSerializer(many=True, read_only=True)

    class Meta:
        model = VenueModel
        fields = [
            'id', 'name', 'venue_admin', 'is_main', 'country', 'city', 'address',
            'latitude', 'longitude', 'phone', 'description', 'photo',
            'opening_hours', 'features', 'average_check', 'rating', 'reviews_count',
            'status', 'views', 'daily_views', 'weekly_views', 'monthly_views',
            'edit_attempts', 'last_exchange_update',
            'photos', 'tables' , 'tags'
        ]
