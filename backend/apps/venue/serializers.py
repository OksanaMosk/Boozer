from rest_framework import serializers
from .models import VenueModel, VenuePhotoModel, TableModel, TagModel, VenueTagModel
from ..orders.serializers import TableBookingSerializer
from django.db import transaction


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TagModel
        fields = ['id', 'name']


class VenueTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueTagModel
        fields = ['id', 'venue', 'tag']

class VenuePhotoSerializer(serializers.ModelSerializer):
    venue = serializers.PrimaryKeyRelatedField(queryset=VenueModel.objects.all())

    class Meta:
        model = VenuePhotoModel
        fields = ['id', 'photo', 'is_main', 'venue']


class TableSerializer(serializers.ModelSerializer):
    bookings = TableBookingSerializer(many=True, read_only=True)
    class Meta:
        model = TableModel
        fields = ['id', 'capacity', 'x', 'y', 'width', 'height', 'is_active', 'bookings', 'venue']


class VenueSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()
    input_tags = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    photos = VenuePhotoSerializer(many=True, read_only=True)
    tables = TableSerializer(many=True, read_only=True)
    background_tables = serializers.URLField(required=False, allow_null=True)

    class Meta:
        model = VenueModel
        fields = [
            'id', 'name', 'venue_admin', 'country', 'city', 'address',
            'latitude', 'longitude', 'phone', 'description',
            'opening_hours', 'photos', 'tables', 'features', 'average_check',  'currency', 'rating', 'reviews_count',
            'status', 'views', 'daily_views', 'weekly_views', 'monthly_views',
            'edit_attempts', 'last_exchange_update',
            'tags','input_tags', 'background_tables'
        ]

    def get_tags(self, obj):
        return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]

    def create(self, validated_data):
        tag_names = validated_data.pop('input_tags', [])

        with transaction.atomic():
            venue = VenueModel.objects.create(**validated_data)

            for name in tag_names:
                clean_name = name.strip().lower()
                if clean_name:
                    tag, _ = TagModel.objects.get_or_create(name=clean_name)
                    venue.tags.add(tag)

            return venue

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('input_tags', None)
        with transaction.atomic():
            instance = super().update(instance, validated_data)
            if tag_names is not None:
                instance.tags.clear()
                for name in tag_names:
                    clean_name = name.strip().lower()
                    if clean_name:
                        tag, _ = TagModel.objects.get_or_create(name=clean_name)
                        instance.tags.add(tag)

            return instance