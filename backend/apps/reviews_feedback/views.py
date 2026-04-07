from django.shortcuts import get_object_or_404
from rest_framework import viewsets, filters, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ReviewModel, FavoriteVenue, ReviewPhotoModel
from .serializers import (
    ReviewSerializer, FavoriteVenueSerializer,
    ReviewReportSerializer, FavoriteCollectionSerializer, ReviewPhotoSerializer
)
from .services.favorite_service import FavoriteService, FavoriteCollectionService
from .services.review_service import ReviewService
from rest_framework.exceptions import PermissionDenied
from ..user.permissions import IsAdmin, IsVisitorOrReadOnly, IsGuestReadOnly

class ReviewImageViewSet(viewsets.ModelViewSet):
    queryset = ReviewPhotoModel.objects.all()
    serializer_class = ReviewPhotoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return self.queryset.filter(review_id=self.kwargs['review_pk'])

    def perform_create(self, serializer):
        review = get_object_or_404(ReviewModel, id=self.kwargs['review_pk'], user=self.request.user)
        serializer.save(review=review)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = ReviewModel.objects.filter(is_published=True)
    serializer_class = ReviewSerializer
    permission_classes = [IsAdmin | IsVisitorOrReadOnly | IsGuestReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['venue', 'user']
    search_fields = ['comment']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']


    def get_queryset(self):
        return ReviewService.get_reviews(
            venue_id=self.kwargs.get('venue_pk'),
            user_id=self.kwargs.get('user_pk')
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None, venue_pk=None):
        review = self.get_object()
        is_liked, count = ReviewService.toggle_like(request.user, review)
        from apps.common.serializers import CountResponseSerializer
        serializer = CountResponseSerializer({
            'status': 'liked' if is_liked else 'unliked',
            'likes_count': count
        })
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def report(self, request, pk=None, venue_pk=None):
        review = self.get_object()
        data = request.data.copy()
        data['review'] = review.id
        serializer = ReviewReportSerializer(data=data, context={'request': request})

        serializer.is_valid(raise_exception=True)

        ReviewService.create_report(
            user=request.user,
            review=review,
            reason=serializer.validated_data['reason'],
            comment=serializer.validated_data.get('comment')
        )

        from apps.common.serializers import StatusMessageSerializer
        response_serializer = StatusMessageSerializer({
            'status': 'success',
            'message': 'Report sent'
        })
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


    def perform_create(self, serializer):
        venue_id = self.kwargs.get('venue_pk')
        serializer.save(venue_id=venue_id)

class FavoriteCollectionViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteCollectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return FavoriteCollectionService.get_collections_for_user(
            user=self.request.user,
            action=self.action
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def reorder(self, request, pk=None):
        if not request.user.is_staff:
            raise PermissionDenied('Only admins can reorder collections')

        if not isinstance(request.data, list):
            raise serializers.ValidationError({'detail': 'Expected a list'})
        success = FavoriteService.reorder_collection(
            collection_id=pk,
            order_data=request.data
        )

        if success:
            from apps.common.serializers import StatusMessageSerializer
            serializer = StatusMessageSerializer({'message': 'Order updated successfully'})
            return Response(serializer.data)
        else:
            raise serializers.ValidationError({'detail': 'Failed to update order'})


    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def staff_top(self, request):
        qs = FavoriteCollectionService.get_staff_top_collections()
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def most_hearted(self, request):
        data = FavoriteCollectionService.get_most_hearted_collections(limit=5)
        return Response(list(data))

    @action(detail=True, methods=["delete"], url_path="remove-venue")
    def remove_venue(self, request, pk=None):
        venue_id = request.query_params.get("venue_id")

        if not venue_id:
            raise serializers.ValidationError({'detail': 'venue_id required'})

        deleted = FavoriteService.remove_venue_from_collection(
            user=request.user,
            venue_id=venue_id,
            collection_id=pk
        )

        from apps.common.serializers import StatusMessageSerializer
        serializer = StatusMessageSerializer({
            'message': 'Venue removed' if deleted else 'Venue not found in collection'
        })
        return Response(serializer.data)

class FavoriteVenueViewSet(viewsets.ModelViewSet):
    queryset = FavoriteVenue.objects.all()
    serializer_class = FavoriteVenueSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        queryset = FavoriteVenue.objects.filter(user=self.request.user)
        venue_id = self.kwargs.get('venue_pk')
        if venue_id:
            queryset = queryset.filter(venue_id=venue_id)
        return queryset

    def perform_create(self, serializer):
        venue_id = self.kwargs.get('venue_pk')
        serializer.save(venue_id=venue_id, user=self.request.user)

    @action(detail=False, methods=['delete'])
    def delete_favorite(self, request, *args, **kwargs):
        instance = self.get_queryset().first()
        if instance:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Not found"}, status=404)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def candidates(self, request):
        self.filter_backends = []
        category = request.query_params.get('category', 'general')
        data = FavoriteService.get_top_candidates_by_category(category=category)

        return Response(data, status=status.HTTP_200_OK)


# from django.shortcuts import get_object_or_404
# from rest_framework import viewsets, filters, status, permissions, serializers
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from django_filters.rest_framework import DjangoFilterBackend
# from .models import ReviewModel, FavoriteVenue, FavoriteCollection, ReviewPhotoModel
# from .serializers import (
#     ReviewSerializer, FavoriteVenueSerializer,
#     ReviewReportSerializer, FavoriteCollectionSerializer, ReviewPhotoSerializer
# )
# from .services.favorite_service import FavoriteService, FavoriteCollectionService
# from .services.review_service import ReviewService
# from rest_framework.exceptions import PermissionDenied
# from ..user.permissions import IsAdmin, IsVisitorOrReadOnly, IsGuestReadOnly
#
# class ReviewImageViewSet(viewsets.ModelViewSet):
#     queryset = ReviewPhotoModel.objects.all()
#     serializer_class = ReviewPhotoSerializer
#     permission_classes = [permissions.IsAuthenticatedOrReadOnly]
#
#     def get_queryset(self):
#         return self.queryset.filter(review_id=self.kwargs['review_pk'])
#
#     def perform_create(self, serializer):
#         review = get_object_or_404(ReviewModel, id=self.kwargs['review_pk'], user=self.request.user)
#         serializer.save(review=review)
#
# class ReviewViewSet(viewsets.ModelViewSet):
#     queryset = ReviewModel.objects.filter(is_published=True)
#     serializer_class = ReviewSerializer
#     permission_classes = [IsAdmin | IsVisitorOrReadOnly | IsGuestReadOnly]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
#     filterset_fields = ['venue', 'user']
#     search_fields = ['comment']
#     ordering_fields = ['created_at', 'rating']
#     ordering = ['-created_at']
#
#     def get_queryset(self):
#         queryset = super().get_queryset().prefetch_related(
#             'review_photos',
#             'reports',
#             'reports__user'
#         )
#
#         venue_id = self.kwargs.get('venue_pk')
#         if venue_id:
#             queryset = queryset.filter(venue_id=venue_id)
#         user_id = self.kwargs.get('user_pk')
#         if user_id:
#             queryset = queryset.filter(user_id=user_id)
#         return queryset
#
#     @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
#     def like(self, request, pk=None, venue_pk=None):
#         review = self.get_object()
#         is_liked, count = ReviewService.toggle_like(request.user, review)
#         from apps.common.serializers import CountResponseSerializer
#         serializer = CountResponseSerializer({
#             'status': 'liked' if is_liked else 'unliked',
#             'likes_count': count
#         })
#         return Response(serializer.data)
#
#     @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
#     def report(self, request, pk=None, venue_pk=None):
#         review = self.get_object()
#         data = request.data.copy()
#         data['review'] = review.id
#         serializer = ReviewReportSerializer(data=data, context={'request': request})
#
#         serializer.is_valid(raise_exception=True)
#
#         ReviewService.create_report(
#             user=request.user,
#             review=review,
#             reason=serializer.validated_data['reason'],
#             comment=serializer.validated_data.get('comment')
#         )
#
#         from apps.common.serializers import StatusMessageSerializer
#         response_serializer = StatusMessageSerializer({
#             'status': 'success',
#             'message': 'Report sent'
#         })
#         return Response(response_serializer.data, status=status.HTTP_201_CREATED)
#
#
#     def perform_create(self, serializer):
#         venue_id = self.kwargs.get('venue_pk')
#         serializer.save(venue_id=venue_id)
#
# class FavoriteCollectionViewSet(viewsets.ModelViewSet):
#     serializer_class = FavoriteCollectionSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     pagination_class = None
#
#     def get_queryset(self):
#         user = self.request.user
#         detail_actions = ['retrieve', 'update', 'partial_update', 'destroy', 'reorder', 'remove_venue']
#
#         if self.action in detail_actions and (user.is_staff or user.is_superuser):
#             return FavoriteCollection.objects.filter(user=user)
#
#         return FavoriteCollection.objects.filter(
#             user=self.request.user,
#             is_staff_top=False
#         )
#
#     def perform_create(self, serializer):
#         serializer.save(user=self.request.user)
#
#     @action(detail=True, methods=['patch'])
#     def reorder(self, request, pk=None):
#         if not request.user.is_staff:
#             raise PermissionDenied('Only admins can reorder collections')
#
#         if not isinstance(request.data, list):
#             raise serializers.ValidationError({'detail': 'Expected a list'})
#         success = FavoriteService.reorder_collection(
#             collection_id=pk,
#             order_data=request.data
#         )
#
#         if success:
#             from apps.common.serializers import StatusMessageSerializer
#             serializer = StatusMessageSerializer({'message': 'Order updated successfully'})
#             return Response(serializer.data)
#         else:
#             raise serializers.ValidationError({'detail': 'Failed to update order'})
#
#
#     @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
#     def staff_top(self, request):
#         qs = FavoriteCollectionService.get_staff_top_collections()
#         serializer = self.get_serializer(qs, many=True)
#         return Response(serializer.data)
#
#     @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
#     def most_hearted(self, request):
#         data = FavoriteCollectionService.get_most_hearted_collections(limit=5)
#         return Response(list(data))
#
#     @action(detail=True, methods=["delete"], url_path="remove-venue")
#     def remove_venue(self, request, pk=None):
#         venue_id = request.query_params.get("venue_id")
#
#         if not venue_id:
#             raise serializers.ValidationError({'detail': 'venue_id required'})
#
#         deleted = FavoriteService.remove_venue_from_collection(
#             user=request.user,
#             venue_id=venue_id,
#             collection_id=pk
#         )
#
#         from apps.common.serializers import StatusMessageSerializer
#         serializer = StatusMessageSerializer({
#             'message': 'Venue removed' if deleted else 'Venue not found in collection'
#         })
#         return Response(serializer.data)
#
# class FavoriteVenueViewSet(viewsets.ModelViewSet):
#     queryset = FavoriteVenue.objects.all()
#     serializer_class = FavoriteVenueSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     pagination_class = None
#
#     def get_queryset(self):
#         queryset = FavoriteVenue.objects.filter(user=self.request.user)
#         venue_id = self.kwargs.get('venue_pk')
#         if venue_id:
#             queryset = queryset.filter(venue_id=venue_id)
#         return queryset
#
#     def perform_create(self, serializer):
#         venue_id = self.kwargs.get('venue_pk')
#         serializer.save(venue_id=venue_id, user=self.request.user)
#
#     @action(detail=False, methods=['delete'])
#     def delete_favorite(self, request, *args, **kwargs):
#         instance = self.get_queryset().first()
#         if instance:
#             instance.delete()
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         return Response({"detail": "Not found"}, status=404)
#
#     @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
#     def candidates(self, request):
#         self.filter_backends = []
#         category = request.query_params.get('category', 'general')
#         data = FavoriteService.get_top_candidates_by_category(category=category)
#
#         return Response(data, status=status.HTTP_200_OK)