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



# from django.db import transaction
# from rest_framework import viewsets, filters
# from django_filters.rest_framework import DjangoFilterBackend
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from .models import MenuModel, MenuItemModel
# from .serializers import MenuSerializer, MenuItemSerializer
# from ..user.permissions import IsAdminOrVenueAdminOrReadOnly
# from django.shortcuts import get_object_or_404
# from rest_framework import serializers
#
# from ..venue.models import VenueModel
#
#
# class MenuViewSet(viewsets.ModelViewSet):
#     queryset = MenuModel.objects.all()
#     serializer_class = MenuSerializer
#     permission_classes = [IsAdminOrVenueAdminOrReadOnly]
#
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
#     filterset_fields = ['venue', 'title', 'is_published']
#     search_fields = ['title', 'description']
#     ordering_fields = ['title']
#     ordering = ['id']
#
#     def get_queryset(self):
#         venue_id = self.kwargs.get('venue_pk')
#         user = self.request.user
#
#         if not user.is_authenticated:
#             return MenuModel.objects.filter(venue_id=venue_id, is_published=True)
#
#         role = getattr(user, 'role', '').upper()
#
#         if user.is_superuser or role == 'ADMIN':
#             return MenuModel.objects.filter(venue_id=venue_id)
#
#         if role == 'VENUE_ADMIN':
#
#             is_owner = VenueModel.objects.filter(id=venue_id, venue_admin=user).exists()
#
#             if is_owner:
#                 return MenuModel.objects.filter(venue_id=venue_id)
#
#         return MenuModel.objects.filter(venue_id=venue_id, is_published=True)
#
#     def perform_create(self, serializer):
#         venue_id = self.kwargs.get('venue_pk')
#         venue = get_object_or_404(VenueModel, id=venue_id)
#         self.check_object_permissions(self.request, venue)
#         serializer.save(venue_id=venue_id)
#
# class MenuItemViewSet(viewsets.ModelViewSet):
#     serializer_class = MenuItemSerializer
#     permission_classes = [IsAdminOrVenueAdminOrReadOnly]
#
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
#     filterset_fields = ['menu', 'description', 'position', 'category']
#     search_fields = ['name', 'description']
#     ordering_fields = ['name', 'price', 'position', 'category']
#     ordering = ['category', 'position', 'id']
#     pagination_class = None
#
#     def get_queryset(self):
#         venue_pk = self.kwargs.get('venue_pk')
#         menu_pk = self.kwargs.get('menu_pk')
#
#         return MenuItemModel.objects.filter(
#             menu_id=menu_pk,
#             menu__venue_id=venue_pk
#         )
#
#     def perform_create(self, serializer):
#         venue_pk = self.kwargs.get('venue_pk')
#         menu_pk = self.kwargs.get('menu_pk')
#
#         menu = get_object_or_404(MenuModel, id=menu_pk, venue_id=venue_pk)
#         serializer.save(menu=menu)
#
#     @action(detail=False, methods=['patch'])
#     def reorder(self, request, **kwargs):
#         venue_pk = self.kwargs.get('venue_pk')
#         menu_pk = self.kwargs.get('menu_pk')
#         menu = get_object_or_404(MenuModel, id=menu_pk, venue_id=venue_pk)
#         self.check_object_permissions(request, menu)
#
#         if not isinstance(request.data, list):
#             raise serializers.ValidationError({'detail': 'List expected'})
#
#         with transaction.atomic():
#             for item in request.data:
#                 if 'id' not in item or 'position' not in item:
#                     continue
#
#                 update_data = {'position': item['position']}
#
#                 if 'category' in item:
#                     update_data['category'] = item['category']
#
#                 MenuItemModel.objects.filter(
#                     id=item['id'],
#                     menu__id=menu_pk,
#                     menu__venue__id=venue_pk
#                 ).update(**update_data)
#
#         from apps.common.serializers import StatusMessageSerializer
#         serializer = StatusMessageSerializer({'message': 'Menu items reordered successfully'})
#         return Response(serializer.data)