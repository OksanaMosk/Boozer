from rest_framework import serializers
from .models import ReviewModel, FavoriteVenue, ReviewPhotoModel, FavoriteCollection, ReviewReport
from .services.favorite_service import FavoriteService
from ..venue.serializers import VenueSerializer


class ReviewPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewPhotoModel
        fields = ['id', 'photo']


class ReviewSerializer(serializers.ModelSerializer):
    review_photos = ReviewPhotoSerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = ReviewModel
        fields = [
            'id', 'author_name', 'venue', 'order', 'rating', 'comment',
            'review_photos', 'likes_count', 'is_liked', 'owner_reply', 'created_at'
        ]
        read_only_fields = ['user', 'venue', 'order']

    def get_is_liked(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False

    def get_author_name(self, obj):
        name = f"{obj.user.name or ''} {obj.user.surname or ''}".strip()
        return name or obj.user.username


class ReviewReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReport
        fields = ['id', 'review', 'reason', 'comment']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class FavoriteCollectionSerializer(serializers.ModelSerializer):
    venues = serializers.SerializerMethodField()
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    category_display = serializers.CharField(source='get_category_label', read_only=True)

    class Meta:
        model = FavoriteCollection
        fields = ['id', 'name', 'category', 'category_display', 'is_staff_top', 'order', 'items_count', 'venues']

    def validate(self, attrs):
        # 1. List of system categories that cannot be marked as Staff Top
        SYSTEM_CATEGORIES = ['wedding', 'corporate', 'birthday', 'general']

        # 2. Get current values (handling both POST and PATCH requests)
        # Use existing instance data if fields are missing in the request
        name = attrs.get('name', self.instance.name if self.instance else "")
        category = attrs.get('category', self.instance.category if self.instance else "")
        is_staff_top = attrs.get('is_staff_top', self.instance.is_staff_top if self.instance else False)

        # 3. Validation logic
        if is_staff_top:
            if name.lower() in SYSTEM_CATEGORIES or category.lower() in SYSTEM_CATEGORIES:
                raise serializers.ValidationError({
                    "is_staff_top": (
                        f"System category '{name}' cannot be marked as Staff Top. "
                        f"These names are reserved for base user collections to prevent logic conflicts."
                    )
                })

        return attrs

    def get_venues(self, obj):
        items = obj.items.select_related('venue').all().order_by('position')
        venues_list = [item.venue for item in items]
        return VenueSerializer(venues_list, many=True, context=self.context).data


class FavoriteVenueSerializer(serializers.ModelSerializer):
    collection_id = serializers.IntegerField(required=False, write_only=True)
    new_collection_name = serializers.CharField(required=False, write_only=True)
    collection_category = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = FavoriteVenue
        fields = [
            'id', 'user', 'venue', 'collection',
            'collection_id', 'new_collection_name', 'collection_category'
        ]
        read_only_fields = ['user']

    def create(self, validated_data):
        user = self.context['request'].user
        venue = validated_data.get('venue')

        collection = FavoriteService.get_or_create_collection(
            user=user,
            collection_id=validated_data.pop('collection_id', None),
            name=validated_data.pop('new_collection_name', None),
            category=validated_data.pop('collection_category', 'general')
        )

        return FavoriteService.add_venue_to_favorites(
            user=user,
            venue_id=venue.id,
            collection=collection
        )