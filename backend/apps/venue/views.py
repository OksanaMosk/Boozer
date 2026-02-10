
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import VenueModel, TagModel, TableModel
from .serializers import VenueSerializer, TagSerializer, TableSerializer
from ..user.permissions import IsAdmin, IsVenueAdminOrReadOnly, IsVisitorOrReadOnly, IsGuestReadOnly


class VenueViewSet(viewsets.ModelViewSet):
    queryset = VenueModel.objects.all()
    serializer_class = VenueSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country', 'city']
    search_fields = ['name', 'description']

    ordering_fields = ['rating', 'average_check', 'reviews_count', 'views']
    ordering = ['-rating']

    permission_classes = [IsAdmin | IsVenueAdminOrReadOnly | IsVisitorOrReadOnly | IsGuestReadOnly]



class TagViewSet(viewsets.ModelViewSet):
    queryset = TagModel.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsGuestReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

class TableViewSet(viewsets.ModelViewSet):
    queryset = TableModel.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAdmin | IsVenueAdminOrReadOnly]
    filterset_fields = ['venue', 'is_active']