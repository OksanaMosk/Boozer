from django.core.exceptions import PermissionDenied
from django.db.models.query_utils import Q
from django.utils.dateparse import parse_datetime
from rest_framework import viewsets, filters, status, permissions, serializers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import VenueModel, TagModel, TableModel, VenuePhotoModel, VenueTagModel
from .serializers import VenueSerializer, TagSerializer, TableSerializer, VenuePhotoSerializer, VenueTagSerializer
from .services.geocode import geocode_city
from .services.venue_constants_service import get_venue_constants
from .services.venue_service import get_user_venues, approve_venue_service, get_venue_orders_statistics
from ..user.permissions import IsAdminOrVenueAdminOrReadOnly, IsAdmin
from django.db.models import Exists, OuterRef


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
        from apps.reviews_feedback.models import FavoriteVenue
        qs = VenueModel.objects.all()
        user = self.request.user
        role = getattr(user, 'role', '').upper()

        if role == 'ADMIN' or user.is_staff:
            pass
        elif role == 'VENUE_ADMIN':
            qs = qs.filter(Q(status='active') | Q(venue_admin=user))
        else:
            qs = qs.filter(status='active')

        if user.is_authenticated:
            is_favorite_subquery = FavoriteVenue.objects.filter(
                user=user,
                venue_id=OuterRef('pk'),
                collection__is_staff_top = False
            )
            qs = qs.annotate(is_favorite=Exists(is_favorite_subquery))

        tags_param = self.request.query_params.get('tags__name')
        if tags_param:
            tags_list = [t.strip().lower() for t in tags_param.split(',') if t.strip()]
            if tags_list:
                qs = qs.filter(tags__name__in=tags_list).distinct()

        return qs.order_by('id', '-rating')


    def perform_create(self, serializer):
        user = self.request.user
        role = getattr(user, 'role', '').upper()
        if role == 'VENUE_ADMIN':
            serializer.save(venue_admin=user, status='pending')
        elif role == 'ADMIN':
            serializer.save(venue_admin=user, status='active')
        else:
            raise PermissionDenied('You do not have permission to create a venue.')

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        venue = self.get_object()

        approve_venue_service(venue)

        return Response({
            'status': 'success',
            'message': 'Venue approved and email sent.'
        }, status=200)

    @action(detail=True, methods=['get'], permission_classes=[IsAdminOrVenueAdminOrReadOnly])
    def orders_stats(self, request, pk=None):
        """
        Custom endpoint to fetch venue-specific financial statistics and order history.
        URL: GET /api/venues/{id}/orders_stats/
        """
        venue = self.get_object()
        data = get_venue_orders_statistics(venue)
        from apps.orders.serializers import OrderSerializer
        serializer = OrderSerializer(data['orders'], many=True)

        return Response({
            'stats': data['stats'],
            'orders': serializer.data
        })

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
            raise serializers.ValidationError({'venue': 'venue_pk is required in URL'})
        serializer.save(venue_id=venue_pk)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def available(self, request, venue_pk=None):
        if not venue_pk:
            return Response({'error': 'venue_pk is required in URL'}, status=400)

        start = request.query_params.get('start')
        end = request.query_params.get('end')
        if not start or not end:
            return Response({'error': 'start and end are required'}, status=400)

        start_dt = parse_datetime(start)
        end_dt = parse_datetime(end)

        tables = TableModel.objects.filter(
            venue_id=venue_pk,
            is_active=True
        ).exclude(
            bookings__time_range__overlap=(start_dt, end_dt),
            bookings__is_active=True
        )

        serializer = self.get_serializer(tables, many=True)
        return Response(serializer.data)


class TablesLayoutViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

    @action(detail=False, methods=['get'], url_path='get_background')
    def get_background(self, request, venue_pk=None):
        if not venue_pk:
            return Response({'error': 'venue_pk is required'}, status=400)
        try:
            venue = VenueModel.objects.get(pk=venue_pk)
        except VenueModel.DoesNotExist:
            return Response({'error': 'Venue not found'}, status=404)
        return Response({'url': venue.background_tables or ''})


    @action(detail=False, methods=['post'], url_path='upload_background')
    def upload_background(self, request, venue_pk=None):
        if not venue_pk:
            return Response({'error': 'venue_pk is required'}, status=400)
        try:
            venue = VenueModel.objects.get(pk=venue_pk)
        except VenueModel.DoesNotExist:
            return Response({'error': 'Venue not found'}, status=404)

        url = request.data.get('url')
        if not url:
            return Response({'error': 'URL is required'}, status=400)

        venue.background_tables = url
        venue.save()
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
            return Response({'detail': 'Constants not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(constants, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except KeyError as e:
        return Response({'detail': f'Missing key: {e}'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def city_coordinates(request):
    city = request.GET.get('city')
    country = request.GET.get('country')
    if not city or not country:
        return Response({'detail': 'City and country are required'}, status=status.HTTP_400_BAD_REQUEST)

    lat, lng = geocode_city(city, country)
    return Response({'latitude': lat, 'longitude': lng}, status=status.HTTP_200_OK)


