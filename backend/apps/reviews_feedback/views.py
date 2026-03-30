from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ReviewModel, FavoriteVenue, FavoriteCollection
from .serializers import (
    ReviewSerializer, FavoriteVenueSerializer,
    ReviewReportSerializer, FavoriteCollectionSerializer
)
from .services.favorite_service import FavoriteService, FavoriteCollectionService
from .services.review_service import ReviewService

from ..user.permissions import IsAdmin, IsVisitorOrReadOnly, IsGuestReadOnly

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
        queryset = super().get_queryset()
        venue_id = self.kwargs.get('venue_pk')
        if venue_id:
            queryset = queryset.filter(venue_id=venue_id)
        user_id = self.kwargs.get('user_pk')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, _pk=None, _venue_pk=None):
        review = self.get_object()
        is_liked, count = ReviewService.toggle_like(request.user, review)
        return Response({
            'status': 'liked' if is_liked else 'unliked',
            'likes_count': count
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def report(self, request, _pk=None, _venue_pk=None):
        review = self.get_object()
        serializer = ReviewReportSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            ReviewService.create_report(
                user=request.user,
                review=review,
                reason=serializer.validated_data['reason'],
                comment=serializer.validated_data.get('comment')
            )
            return Response({'status': 'report_sent'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        venue_id = self.kwargs.get('venue_pk')
        serializer.save(venue_id=venue_id, user=self.request.user)

class FavoriteCollectionViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteCollectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return FavoriteCollection.objects.filter(
            user=self.request.user,
            is_staff_top=False
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


    @action(detail=True, methods=['patch'])
    def reorder(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Only admins can reorder collections'}, status=403)

        if not isinstance(request.data, list):
            return Response({'error': 'Expected a list'}, status=400)

        FavoriteService.reorder_collection(
            user=request.user,
            collection_id=pk,
            order_data=request.data
        )

        return Response({'status': 'order updated'})

    @action(detail=False, methods=['get'])
    def staff_top(self, request):
        qs = FavoriteCollectionService.get_staff_top_collections()
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def most_hearted(self, request):
        data = FavoriteCollectionService.get_most_hearted_collections(limit=5)
        return Response(list(data))

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