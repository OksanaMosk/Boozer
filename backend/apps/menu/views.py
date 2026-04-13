from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MenuModel, MenuItemModel
from .serializers import MenuSerializer, MenuItemSerializer
from .services.menu_service import MenuService, MenuItemService
from ..user.permissions import IsAdminOrVenueAdminOrReadOnly
from django.shortcuts import get_object_or_404
from rest_framework import serializers

from ..venue.models import VenueModel


class MenuViewSet(viewsets.ModelViewSet):
    queryset = MenuModel.objects.all()
    serializer_class = MenuSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['venue', 'title', 'is_published']
    search_fields = ['title', 'description']
    ordering_fields = ['title']
    ordering = ['id']

    def get_queryset(self):
        return MenuService.get_menus_for_user(
            self.request.user,
            self.kwargs.get('venue_pk')
        )

    def perform_create(self, serializer):
        venue_id = self.kwargs.get('venue_pk')
        venue = get_object_or_404(VenueModel, id=venue_id)
        self.check_object_permissions(self.request, venue)
        serializer.save(venue_id=venue_id)

class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['menu', 'description', 'position', 'category']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'position', 'category']
    ordering = ['category', 'position', 'id']
    pagination_class = None

    def get_queryset(self):
        venue_pk = self.kwargs.get('venue_pk')
        menu_pk = self.kwargs.get('menu_pk')

        return MenuItemModel.objects.filter(
            menu_id=menu_pk,
            menu__venue_id=venue_pk
        )

    def perform_create(self, serializer):
        venue_pk = self.kwargs.get('venue_pk')
        menu_pk = self.kwargs.get('menu_pk')

        menu = get_object_or_404(MenuModel, id=menu_pk, venue_id=venue_pk)
        serializer.save(menu=menu)

    @action(detail=False, methods=['patch'])
    def reorder(self, request, **kwargs):
        if not isinstance(request.data, list):
            raise serializers.ValidationError({'detail': 'List expected'})

        menu = get_object_or_404(MenuModel, id=self.kwargs.get('menu_pk'), venue_id=self.kwargs.get('venue_pk'))
        self.check_object_permissions(request, menu)

        MenuItemService.reorder_items(
            self.kwargs.get('venue_pk'),
            self.kwargs.get('menu_pk'),
            request.data
        )

        return Response({'message': 'Menu items reordered successfully'})
