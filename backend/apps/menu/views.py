from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import MenuModel, MenuItem
from .serializers import MenuSerializer, MenuItemSerializer
from ..user.permissions import IsAdmin, IsVenueAdminOrReadOnly


class MenuViewSet(viewsets.ModelViewSet):
    queryset = MenuModel.objects.all()
    serializer_class = MenuSerializer
    permission_classes = [IsAdmin | IsVenueAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['venue', 'name']
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']

    def get_queryset(self):
        venue_id = self.kwargs.get('venue_pk')
        return MenuModel.objects.filter(venue_id=venue_id)

    def perform_create(self, serializer):
        venue_id = self.kwargs.get('venue_pk')
        serializer.save(venue_id=venue_id)

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAdmin | IsVenueAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['menu', 'category', 'description']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price']
    ordering = ['name']
