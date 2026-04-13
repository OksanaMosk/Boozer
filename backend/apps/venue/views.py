from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from django.utils.dateparse import parse_datetime
from rest_framework import viewsets, filters, status, permissions, serializers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.generics import ListAPIView

from .filters import VenueFilter
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
    queryset = VenueModel.objects.all()
    serializer_class = VenueSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = VenueFilter
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'rating', 'created_at', 'converted_check', 'distance', 'average_check', 'reviews_count', 'views']
    ordering = ['-rating', '-id']

    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

    def get_queryset(self):
        target_curr = self.request.query_params.get('currency', 'UAH').upper()
        qs = get_venues_list(
            user=self.request.user,
            tags_param=self.request.query_params.get('tags__name'),
            lat = self.request.query_params.get('lat'),
            lon = self.request.query_params.get('lon'),
            target_currency=target_curr
        )
        ordering = self.request.query_params.get('ordering')

        if ordering:

            return qs.order_by(ordering, '-id')

        return qs.order_by('-rating', '-id')


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


class VenueUserListView(ListAPIView):
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]
    serializer_class = VenueSerializer

    def get_queryset(self):
        return get_user_venues(self.request.user, self.kwargs.get('user_id'))

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        if isinstance(response.data, dict) and 'data' in response.data:
            response.data['venues'] = response.data.pop('data')
        elif isinstance(response.data, list):
            response.data = {'venues': response.data}

        return response


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
