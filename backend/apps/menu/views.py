from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MenuModel, MenuItem
from .serializers import MenuSerializer, MenuItemSerializer
from ..user.permissions import IsAdmin, IsVenueAdminOrReadOnly, IsAdminOrVenueAdminOrReadOnly


class MenuViewSet(viewsets.ModelViewSet):
    queryset = MenuModel.objects.all()
    serializer_class = MenuSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['venue', 'title']
    search_fields = ['title', 'description']
    ordering_fields = ['title']
    ordering = ['id']

    def get_queryset(self):
        venue_id = self.kwargs.get('venue_pk')
        return MenuModel.objects.filter(venue_id=venue_id)

    def perform_create(self, serializer):
        venue_id = self.kwargs.get('venue_pk')
        serializer.save(venue_id=venue_id)

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['menu', 'category', 'description']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price']
    ordering = ['id']

    @action(detail=False, methods=['patch'])
    def reorder(self, request):

        for item in request.data:
            MenuItem.objects.filter(id=item['id']).update(
                position=item['position']
            )
        return Response({"status": "ok"})