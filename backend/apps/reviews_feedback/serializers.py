from rest_framework import serializers
from .models import ReviewModel, FavoriteVenue, ReviewPhotoModel, FavoriteCollection, ReviewReport
from .services.favorite_service import FavoriteService
from ..venue.serializers import VenueSerializer
from rest_framework.validators import UniqueTogetherValidator


class ReviewPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewPhotoModel
        fields = ['id', 'photo']

    def validate(self, data):
        review_id = self.context['view'].kwargs.get('review_pk')
        if ReviewPhotoModel.objects.filter(review_id=review_id).count() >= 7:
            raise serializers.ValidationError("Limit reached: Maximum 7 photos allowed.")

        return data

class ReviewSerializer(serializers.ModelSerializer):
    review_photos = ReviewPhotoSerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    report_details = serializers.SerializerMethodField()

    class Meta:
        model = ReviewModel
        fields = [
            'id', 'author_name', 'user', 'venue', 'order', 'rating', 'food_rating', 'service_rating', 'atmosphere_rating',
            'cleanliness_rating', 'value_rating', 'comment',
            'review_photos', 'likes_count', 'is_liked', 'report_details', 'owner_reply', 'created_at'
        ]
        read_only_fields = ['user', 'venue']

        validators = [
            UniqueTogetherValidator(
                queryset=ReviewModel.objects.all(),
                fields=['user', 'order'],
                message="You have already submitted a review for this order."
            )
        ]

    def get_report_details(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return None

        user = request.user
        reports = obj.reports.all()
        if not reports.exists():
            return None

        if user.is_superuser or getattr(user, 'role', '').upper() == 'ADMIN':
            return [
                {
                    "id": r.id,
                    "reason": r.reason,
                    "comment": r.comment,
                    "reporter": getattr(r.user, 'email', str(r.user)),
                    "date": r.created_at,
                    "is_resolved": getattr(r, 'is_resolved', False)
                } for r in reports
            ]

        user_role = getattr(user, 'role', '').upper()
        is_venue_admin = user_role == 'VENUE_ADMIN' and obj.venue.venue_admin == user

        if user.is_staff or is_venue_admin:
            return {
                "has_reports": True,
                "reasons": list(reports.values_list('reason', flat=True).distinct())
            }

        return None

    def get_is_liked(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False

    def get_author_name(self, obj):
        profile = getattr(obj.user, 'profile', None)
        if profile:
            name = f"{getattr(profile, 'name', '') or ''} {getattr(profile, 'surname', '') or ''}".strip()
            if name:
                return name
        return getattr(obj.user, 'username', None) or obj.user.email


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
        SYSTEM_CATEGORIES = ['wedding', 'corporate', 'birthday',
            'date', 'party', 'meeting', 'general']

        name = attrs.get('name', self.instance.name if self.instance else "")
        category = attrs.get('category', self.instance.category if self.instance else "")
        is_staff_top = attrs.get('is_staff_top', self.instance.is_staff_top if self.instance else False)

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
    is_staff_top = serializers.BooleanField(source='collection.is_staff_top', read_only=True)

    class Meta:
        model = FavoriteVenue
        fields = [
            'id', 'user', 'venue', 'collection', 'is_staff_top',
            'collection_id', 'new_collection_name', 'collection_category'
        ]
        read_only_fields = ['user', 'is_staff_top']

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