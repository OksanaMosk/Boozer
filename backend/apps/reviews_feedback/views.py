from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import ReviewModel, FavoriteVenue
from .serializers import ReviewSerializer, FavoriteVenueSerializer
from ..user.permissions import IsAdmin, IsVisitorOrReadOnly, IsGuestReadOnly

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = ReviewModel.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAdmin | IsVisitorOrReadOnly | IsGuestReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['venue', 'user']
    search_fields = ['comment']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = ReviewModel.objects.all()
        venue_id = self.kwargs.get('venue_pk')
        if venue_id:
            queryset = queryset.filter(venue_id=venue_id)
        user_id = self.kwargs.get('user_pk')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    def perform_create(self, serializer):
        venue_id = self.kwargs.get('venue_pk')
        serializer.save(venue_id=venue_id, user=self.request.user)


class FavoriteVenueViewSet(viewsets.ModelViewSet):
    queryset = FavoriteVenue.objects.all()
    serializer_class = FavoriteVenueSerializer
    permission_classes = [IsAdmin | IsVisitorOrReadOnly | IsGuestReadOnly]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['venue', 'user']
    ordering_fields = ['added_at']
    ordering = ['-added_at']

    def get_queryset(self):
        queryset = FavoriteVenue.objects.all()
        venue_id = self.kwargs.get('venue_pk')
        if venue_id:
            queryset = queryset.filter(venue_id=venue_id)
        user_id = self.kwargs.get('user_pk')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    def perform_create(self, serializer):
        venue_id = self.kwargs.get('venue_pk')
        serializer.save(venue_id=venue_id, user=self.request.user)