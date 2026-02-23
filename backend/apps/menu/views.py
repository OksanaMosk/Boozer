from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MenuModel, MenuItem
from .serializers import MenuSerializer, MenuItemSerializer
from ..user.permissions import IsAdminOrVenueAdminOrReadOnly
from django.shortcuts import get_object_or_404


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
    serializer_class = MenuItemSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['menu', 'description', 'position']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'position']
    ordering = ['position', 'id']

    def get_queryset(self):
        venue_pk = self.kwargs.get('venue_pk')
        menu_pk = self.kwargs.get('menu_pk')

        return MenuItem.objects.filter(
            menu_id=menu_pk,
            menu__venue_id=venue_pk
        )

    def perform_create(self, serializer):
        venue_pk = self.kwargs.get('venue_pk')
        menu_pk = self.kwargs.get('menu_pk')

        menu = get_object_or_404(MenuModel, id=menu_pk, venue_id=venue_pk)
        serializer.save(menu=menu)

    @action(detail=False, methods=['patch'])
    def reorder(self, request, **kwargs):  # <-- додано **kwargs
        venue_pk = self.kwargs.get('venue_pk')
        menu_pk = self.kwargs.get('menu_pk')

        if not isinstance(request.data, list):
            return Response({"error": "List expected"}, status=400)

        for item in request.data:
            MenuItem.objects.filter(
                id=item['id'],
                menu__id=menu_pk,
                menu__venue__id=venue_pk
            ).update(position=item['position'])
        return Response({"status": "ok"})