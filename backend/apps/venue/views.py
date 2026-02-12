
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny

from .models import VenueModel, TagModel, TableModel, VenuePhotoModel, TableBookingModel
from .serializers import VenueSerializer, TagSerializer, TableSerializer, VenuePhotoSerializer, TableBookingSerializer
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



class VenuePhotoViewSet(viewsets.ModelViewSet):
    queryset = VenuePhotoModel.objects.all()
    serializer_class = VenuePhotoSerializer
    permission_classes = [IsAdmin | IsVenueAdminOrReadOnly]
    filterset_fields = ['venue', 'is_main']


class TagViewSet(viewsets.ModelViewSet):
    queryset = TagModel.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

class TableViewSet(viewsets.ModelViewSet):
    queryset = TableModel.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAdmin | IsVenueAdminOrReadOnly]
    filterset_fields = ['venue', 'is_active']


class TableBookingViewSet(viewsets.ModelViewSet):
    queryset = TableBookingModel.objects.all()
    serializer_class = TableBookingSerializer
    permission_classes = [IsAdmin | IsVenueAdminOrReadOnly]
    filterset_fields = ['table', 'order', 'is_active']