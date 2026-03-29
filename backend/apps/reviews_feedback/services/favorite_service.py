from django.core.exceptions import ValidationError
from apps.reviews_feedback.models import FavoriteCollection, FavoriteVenue
from django.db.models import Count, OuterRef, Subquery, Case, When, IntegerField
from apps.venue.models import VenuePhotoModel

class FavoriteService:
    @staticmethod
    def get_or_create_collection(user, collection_id=None, name=None, category='general'):
        if collection_id:
            collection = FavoriteCollection.objects.filter(id=collection_id, user=user).first()
            if not collection:
                raise ValidationError("Collection not found or access denied.")
            return collection

        if name:
            collection, _ = FavoriteCollection.objects.get_or_create(
                user=user,
                name=name,
                defaults={'category': category}
            )
            return collection

        return None

    @staticmethod
    def add_venue_to_favorites(user, venue_id, collection=None):
        favorite, created = FavoriteVenue.objects.get_or_create(
            user=user,
            venue_id=venue_id,
            collection=collection
        )
        return favorite


    @staticmethod
    def get_top_candidates_by_category(category='general', limit=20):
        from apps.reviews_feedback.models import FavoriteVenue
        main_photo_subquery = VenuePhotoModel.objects.filter(
            venue_id=OuterRef('venue_id')
        ).annotate(
            priority=Case(
                When(is_main=True, then=0),
                default=1,
                output_field=IntegerField(),
            )
        ).order_by('priority', 'id').values('photo')[:1]

        return FavoriteVenue.objects.all().filter(
            collection__category__iexact=category,
            collection__is_staff_top=False
        ).annotate(
            venue_main_photo=Subquery(main_photo_subquery)
        ).values(
            'venue_id',
            'venue__name',
            'venue__country',
            'venue__city',
            'venue__address',
            'venue_main_photo'
        ).annotate(
            total_votes=Count('id')
        ).order_by('-total_votes')[:limit]

    @staticmethod
    def reorder_collection(user, collection_id, order_data):
        from django.db import transaction
        from apps.reviews_feedback.models import FavoriteVenue

        with transaction.atomic():
            for item in order_data:
                update_fields = {'position': item['position']}

                if 'new_collection_id' in item:
                    update_fields['collection_id'] = item['new_collection_id']
                filter_kwargs = {
                    'id': item['id'],
                    'collection_id': collection_id
                }
                if not user.is_staff:
                    filter_kwargs['user'] = user

                FavoriteVenue.objects.filter(**filter_kwargs).update(**update_fields)
        return True