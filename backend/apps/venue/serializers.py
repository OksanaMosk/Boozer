from rest_framework import serializers
from .models import VenueModel, VenuePhotoModel, TableModel, TableBookingModel, TagModel, VenueTag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TagModel
        fields = ['id', 'name']


class VenueTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueTag
        fields = ['id', 'venue', 'tag']

class VenuePhotoSerializer(serializers.ModelSerializer):
    venue = serializers.PrimaryKeyRelatedField(queryset=VenueModel.objects.all())

    class Meta:
        model = VenuePhotoModel
        fields = ['id', 'photo', 'is_main', 'venue']

class TableBookingSerializer(serializers.ModelSerializer):
    table = serializers.PrimaryKeyRelatedField(queryset=TableModel.objects.filter(is_active=True))

    class Meta:
        model = TableBookingModel
        fields = ['id', 'order', 'table', 'time_range', 'is_active']
        read_only_fields = ['id']

    def validate(self, data):
        instance = TableBookingModel(**data)
        instance.clean()
        return data


class TableSerializer(serializers.ModelSerializer):
    bookings = TableBookingSerializer(many=True, read_only=True)
    class Meta:
        model = TableModel
        fields = ['id', 'capacity', 'x', 'y', 'width', 'height', 'is_active', 'bookings']


class VenueSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()
    photos = VenuePhotoSerializer(many=True, read_only=True)
    tables = TableSerializer(many=True, read_only=True)
    background_tables = serializers.URLField(required=False, allow_null=True)

    class Meta:
        model = VenueModel
        fields = [
            'id', 'name', 'venue_admin', 'country', 'city', 'address',
            'latitude', 'longitude', 'phone', 'description',
            'opening_hours', 'photos', 'tables', 'features', 'average_check', 'rating', 'reviews_count',
            'status', 'views', 'daily_views', 'weekly_views', 'monthly_views',
            'edit_attempts', 'last_exchange_update',
            'tags',"background_tables"
        ]

    def get_tags(self, obj):

        return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]
