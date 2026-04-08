from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from django.utils.dateparse import parse_datetime
from rest_framework import viewsets, filters, status, permissions, serializers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import VenueModel, TagModel, TableModel, VenuePhotoModel, VenueTagModel, VenueTraffic
from .serializers import VenueSerializer, TagSerializer, TableSerializer, VenuePhotoSerializer, VenueTagSerializer, \
    VenueOrdersStatsResponseSerializer, VenueTrafficSerializer
from .services.geocode import geocode_city
from .services.stats_service import update_venue_stats, handle_venue_update_profanity, get_venue_analytics, \
    get_venue_stats_for_user
from .services.table_service import get_available_tables_by_time
from .services.venue_constants_service import get_venue_constants
from .services.venue_service import get_user_venues, approve_venue_service, get_venue_orders_statistics, \
    get_venues_list, get_venue_create_data, update_venue_background_url
from ..common.serializers import StatusMessageSerializer, URLResponseSerializer
from ..user.permissions import IsAdminOrVenueAdminOrReadOnly, IsAdmin
from rest_framework.exceptions import NotFound, ValidationError


class VenueViewSet(viewsets.ModelViewSet):
    queryset = VenueModel.objects.all().order_by('id')
    serializer_class = VenueSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country', 'city']
    search_fields = ['name', 'description']
    ordering_fields = ['rating', 'average_check', 'reviews_count', 'views']
    ordering = [ 'id', '-rating',]

    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

    def get_queryset(self):
        return get_venues_list(
            user=self.request.user,
            tags_param=self.request.query_params.get('tags__name')
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        VenueTraffic.objects.create(venue=instance)
        update_venue_stats(instance, request)
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        description = serializer.validated_data.get('description', '')
        create_data = get_venue_create_data(self.request.user, description)

        if not create_data:
            raise PermissionDenied('You do not have permission to create a venue.')

        name = serializer.validated_data.get('name')
        if VenueModel.objects.filter(name=name, venue_admin=self.request.user).exists():
            raise ValidationError({'name': 'Venue with this name already exists.'})

        serializer.save(**create_data)

    def perform_update(self, serializer):
        instance = self.get_object()
        handle_venue_update_profanity(instance, serializer, self.request.user)
        serializer.save(edit_attempts=instance.edit_attempts, status=instance.status)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        venue = self.get_object()
        approve_venue_service(venue)

        serializer = StatusMessageSerializer({
            'message': 'Venue approved and email sent.'
        })
        return Response(serializer.data, status=200)

    @action(detail=True, methods=['get'], permission_classes=[IsAdminOrVenueAdminOrReadOnly])
    def orders_stats(self, request, pk=None):
        """
        Custom endpoint to fetch venue-specific financial statistics and order history.
        URL: GET /api/venues/{id}/orders_stats/
        """
        venue = self.get_object()
        data = get_venue_orders_statistics(venue)

        serializer = VenueOrdersStatsResponseSerializer({
            'stats': data['stats'],
            'orders': data['orders']
        })
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='traffic')
    def get_traffic_data(self, request, pk=None):
        venue = self.get_object()
        stats_data = get_venue_analytics(venue)
        serializer = VenueTrafficSerializer(stats_data)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='stats')
    def get_stats(self, request, pk=None):
        venue = self.get_object()
        data = get_venue_stats_for_user(venue.id, request.user)
        return Response(data)

class VenuePhotoViewSet(viewsets.ModelViewSet):
    queryset = VenuePhotoModel.objects.all()
    serializer_class = VenuePhotoSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]
    filterset_fields = ['venue', 'is_main']


class TagViewSet(viewsets.ModelViewSet):
    queryset = TagModel.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]


class VenueTagViewSet(viewsets.ModelViewSet):
    queryset = VenueTagModel.objects.all()
    serializer_class = VenueTagSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]


class TableViewSet(viewsets.ModelViewSet):
    queryset = TableModel.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]
    filterset_fields = ['venue', 'is_active']
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        venue_pk = self.kwargs.get('venue_pk')
        if venue_pk:
            return TableModel.objects.filter(venue_id=venue_pk)
        return TableModel.objects.none()

    def perform_create(self, serializer):
        venue_pk = self.kwargs.get('venue_pk')
        if not venue_pk:
            raise serializers.ValidationError({'detail': 'venue_pk is required in URL'})
        serializer.save(venue_id=venue_pk)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def available(self, request, venue_pk=None):
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        if not (venue_pk and start and end):
            raise serializers.ValidationError({'detail': 'Missing params'})

        tables = get_available_tables_by_time(venue_pk, parse_datetime(start), parse_datetime(end))
        serializer = self.get_serializer(tables, many=True)
        return Response(serializer.data)


class TablesLayoutViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

    @action(detail=False, methods=['get'], url_path='get_background')
    def get_background(self, request, venue_pk=None):
        if not venue_pk:
            raise serializers.ValidationError({'detail': 'venue_pk is required'})

        from django.shortcuts import get_object_or_404
        venue = get_object_or_404(VenueModel, pk=venue_pk)

        self.check_object_permissions(request, venue)

        serializer = URLResponseSerializer({'url': venue.background_tables or ''})
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='upload_background')
    def upload_background(self, request, venue_pk=None):
        venue = get_object_or_404(VenueModel, pk=venue_pk)
        self.check_object_permissions(request, venue)
        url = request.data.get('url')
        if not url: raise serializers.ValidationError({'detail': 'URL is required'})

        update_venue_background_url(venue, url)
        return Response({'url': venue.background_tables})

class VenueUserListView(APIView):
    """
    get:
        Retrieve a list of venues belonging to the authenticated user.
        Only accessible to logged-in users.
    """

    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

    def get(self, request, user_id):
        venues = get_user_venues(request.user, user_id)
        serializer = VenueSerializer(venues, many=True)
        return Response({'venues': serializer.data})


@api_view(['GET'])
@permission_classes([AllowAny])
def venue_constants(request):
    try:
        constants = get_venue_constants()

        if not constants:
            raise NotFound(detail='Constants not found')

        return Response(constants)

    except (ValueError, KeyError) as e:
        raise ValidationError(detail=str(e))

@api_view(['GET'])
@permission_classes([AllowAny])
def city_coordinates(request):
    city = request.GET.get('city')
    country = request.GET.get('country')
    if not city or not country:
        raise serializers.ValidationError({'detail': 'City and country are required'})

    lat, lng = geocode_city(city, country)
    return Response({'latitude': lat, 'longitude': lng}, status=status.HTTP_200_OK)


# from django.core.exceptions import PermissionDenied
# from django.db.models.query_utils import Q
# from django.utils.dateparse import parse_datetime
# from rest_framework import viewsets, filters, status, permissions, serializers
# from django_filters.rest_framework import DjangoFilterBackend
# from rest_framework.decorators import api_view, permission_classes, action
# from rest_framework.permissions import AllowAny
# from rest_framework.response import Response
# from rest_framework.views import APIView
#
# from .models import VenueModel, TagModel, TableModel, VenuePhotoModel, VenueTagModel
# from .serializers import VenueSerializer, TagSerializer, TableSerializer, VenuePhotoSerializer, VenueTagSerializer, \
#     VenueOrdersStatsResponseSerializer
# from .services.geocode import geocode_city
# from .services.venue_constants_service import get_venue_constants
# from .services.venue_service import get_user_venues, approve_venue_service, get_venue_orders_statistics
# from ..common.serializers import StatusMessageSerializer, URLResponseSerializer
# from ..user.permissions import IsAdminOrVenueAdminOrReadOnly, IsAdmin
# from django.db.models import Exists, OuterRef
# from rest_framework.exceptions import NotFound, ValidationError
#
#
# class VenueViewSet(viewsets.ModelViewSet):
#     queryset = VenueModel.objects.all().order_by('id')
#     serializer_class = VenueSerializer
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
#     filterset_fields = ['country', 'city']
#     search_fields = ['name', 'description']
#     ordering_fields = ['rating', 'average_check', 'reviews_count', 'views']
#     ordering = [ 'id', '-rating',]
#
#     permission_classes = [IsAdminOrVenueAdminOrReadOnly]
#
#     def get_queryset(self):
#         from apps.reviews_feedback.models import FavoriteVenue
#         qs = VenueModel.objects.all()
#         user = self.request.user
#         role = getattr(user, 'role', '').upper()
#
#         if role == 'ADMIN' or user.is_staff:
#             pass
#         elif role == 'VENUE_ADMIN':
#             qs = qs.filter(Q(status='active') | Q(venue_admin=user))
#         else:
#             qs = qs.filter(status='active')
#
#         if user.is_authenticated:
#             is_favorite_subquery = FavoriteVenue.objects.filter(
#                 user=user,
#                 venue_id=OuterRef('pk'),
#                 collection__is_staff_top = False
#             )
#             qs = qs.annotate(is_favorite=Exists(is_favorite_subquery))
#
#         tags_param = self.request.query_params.get('tags__name')
#         if tags_param:
#             tags_list = [t.strip().lower() for t in tags_param.split(',') if t.strip()]
#             if tags_list:
#                 qs = qs.filter(tags__name__in=tags_list).distinct()
#
#         return qs.order_by('id', '-rating')
#
#
#     def perform_create(self, serializer):
#         user = self.request.user
#         role = getattr(user, 'role', '').upper()
#         if role == 'VENUE_ADMIN':
#             serializer.save(venue_admin=user, status='pending')
#         elif role == 'ADMIN':
#             serializer.save(venue_admin=user, status='active')
#         else:
#             raise PermissionDenied('You do not have permission to create a venue.')
#
#     @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
#     def approve(self, request, pk=None):
#         venue = self.get_object()
#
#         approve_venue_service(venue)
#
#         serializer = StatusMessageSerializer({
#             'message': 'Venue approved and email sent.'
#         })
#         return Response(serializer.data, status=200)
#
#     @action(detail=True, methods=['get'], permission_classes=[IsAdminOrVenueAdminOrReadOnly])
#     def orders_stats(self, request, pk=None):
#         """
#         Custom endpoint to fetch venue-specific financial statistics and order history.
#         URL: GET /api/venues/{id}/orders_stats/
#         """
#         venue = self.get_object()
#         data = get_venue_orders_statistics(venue)
#
#         serializer = VenueOrdersStatsResponseSerializer({
#             'stats': data['stats'],
#             'orders': data['orders']
#         })
#         return Response(serializer.data)
#
# class VenuePhotoViewSet(viewsets.ModelViewSet):
#     queryset = VenuePhotoModel.objects.all()
#     serializer_class = VenuePhotoSerializer
#     permission_classes = [IsAdminOrVenueAdminOrReadOnly]
#     filterset_fields = ['venue', 'is_main']
#
#
# class TagViewSet(viewsets.ModelViewSet):
#     queryset = TagModel.objects.all()
#     serializer_class = TagSerializer
#     permission_classes = [AllowAny]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
#
#
# class VenueTagViewSet(viewsets.ModelViewSet):
#     queryset = VenueTagModel.objects.all()
#     serializer_class = VenueTagSerializer
#     permission_classes = [IsAdminOrVenueAdminOrReadOnly]
#
#
# class TableViewSet(viewsets.ModelViewSet):
#     queryset = TableModel.objects.all()
#     serializer_class = TableSerializer
#     permission_classes = [IsAdminOrVenueAdminOrReadOnly]
#     filterset_fields = ['venue', 'is_active']
#     filter_backends = [DjangoFilterBackend]
#
#     def get_queryset(self):
#         venue_pk = self.kwargs.get('venue_pk')
#         if venue_pk:
#             return TableModel.objects.filter(venue_id=venue_pk)
#         return TableModel.objects.none()
#
#     def perform_create(self, serializer):
#         venue_pk = self.kwargs.get('venue_pk')
#         if not venue_pk:
#             raise serializers.ValidationError({'detail': 'venue_pk is required in URL'})
#         serializer.save(venue_id=venue_pk)
#
#     @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
#     def available(self, request, venue_pk=None):
#         if not venue_pk:
#             raise serializers.ValidationError({'detail': 'venue_pk is required in URL'})
#
#         start = request.query_params.get('start')
#         end = request.query_params.get('end')
#         if not start or not end:
#             raise serializers.ValidationError({'detail': 'start and end are required'})
#
#         start_dt = parse_datetime(start)
#         end_dt = parse_datetime(end)
#
#         tables = TableModel.objects.filter(
#             venue_id=venue_pk,
#             is_active=True
#         ).exclude(
#             bookings__time_range__overlap=(start_dt, end_dt),
#             bookings__is_active=True
#         )
#
#         serializer = self.get_serializer(tables, many=True)
#         return Response(serializer.data)
#
#
# class TablesLayoutViewSet(viewsets.ViewSet):
#     permission_classes = [IsAdminOrVenueAdminOrReadOnly]
#
#     @action(detail=False, methods=['get'], url_path='get_background')
#     def get_background(self, request, venue_pk=None):
#         if not venue_pk:
#             raise serializers.ValidationError({'detail': 'venue_pk is required'})
#
#         from django.shortcuts import get_object_or_404
#         venue = get_object_or_404(VenueModel, pk=venue_pk)
#
#         self.check_object_permissions(request, venue)
#
#         serializer = URLResponseSerializer({'url': venue.background_tables or ''})
#         return Response(serializer.data)
#
#     @action(detail=False, methods=['post'], url_path='upload_background')
#     def upload_background(self, request, venue_pk=None):
#         if not venue_pk:
#             raise serializers.ValidationError({'detail': 'venue_pk is required'})
#
#         from django.shortcuts import get_object_or_404
#         venue = get_object_or_404(VenueModel, pk=venue_pk)
#
#         self.check_object_permissions(request, venue)
#
#         url = request.data.get('url')
#         if not url:
#             raise serializers.ValidationError({'detail': 'URL is required'})
#
#         venue.background_tables = url
#         venue.save()
#
#         serializer = URLResponseSerializer({'url': venue.background_tables})
#         return Response(serializer.data)
#
# class VenueUserListView(APIView):
#     """
#     get:
#         Retrieve a list of venues belonging to the authenticated user.
#         Only accessible to logged-in users.
#     """
#
#     permission_classes = [IsAdminOrVenueAdminOrReadOnly]
#
#     def get(self, request, user_id):
#         venues = get_user_venues(request.user, user_id)
#         serializer = VenueSerializer(venues, many=True)
#         return Response({'venues': serializer.data})
#
#
# @api_view(['GET'])
# @permission_classes([AllowAny])
# def venue_constants(request):
#     try:
#         constants = get_venue_constants()
#
#         if not constants:
#             raise NotFound(detail='Constants not found')
#
#         return Response(constants)
#
#     except (ValueError, KeyError) as e:
#         raise ValidationError(detail=str(e))
#
# @api_view(['GET'])
# @permission_classes([AllowAny])
# def city_coordinates(request):
#     city = request.GET.get('city')
#     country = request.GET.get('country')
#     if not city or not country:
#         raise serializers.ValidationError({'detail': 'City and country are required'})
#
#     lat, lng = geocode_city(city, country)
#     return Response({'latitude': lat, 'longitude': lng}, status=status.HTTP_200_OK)
#
#
