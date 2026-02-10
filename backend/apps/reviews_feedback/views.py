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

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteVenueViewSet(viewsets.ModelViewSet):
    queryset = FavoriteVenue.objects.all()
    serializer_class = FavoriteVenueSerializer
    permission_classes = [IsAdmin | IsVisitorOrReadOnly | IsGuestReadOnly]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['venue', 'user']
    ordering_fields = ['added_at']
    ordering = ['-added_at']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

