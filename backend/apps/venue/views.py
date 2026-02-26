from django.core.exceptions import PermissionDenied
from django.utils.dateparse import parse_datetime
from rest_framework import viewsets, filters, status, permissions, serializers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import VenueModel, TagModel, TableModel, VenuePhotoModel, TableBookingModel, VenueTag
from .serializers import VenueSerializer, TagSerializer, TableSerializer, VenuePhotoSerializer, TableBookingSerializer, \
    VenueTagSerializer
from .services.geocode import geocode_city
from .services.venue_constans import get_venue_constants
from .services.venue_service import get_user_venues
from ..user.permissions import IsAdminOrVenueAdminOrReadOnly, IsVisitorOrReadOnly


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
        qs = super().get_queryset()
        return qs.order_by('id', '-rating')


    def perform_create(self, serializer):
        user = self.request.user
        role = getattr(user, 'role', '').upper()
        if role == 'VENUE_ADMIN':
            serializer.save(venue_admin=user)
        elif role == 'ADMIN':
            serializer.save(venue_admin=user)
        else:
            raise PermissionDenied("You do not have permission to create a venue.")
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
    queryset = VenueTag.objects.all()
    serializer_class = VenueTagSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

class TableViewSet(viewsets.ModelViewSet):
    queryset = TableModel.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]
    filterset_fields = ['venue', 'is_active']
    filter_backends = [DjangoFilterBackend]

    def perform_create(self, serializer):
        venue_pk = self.kwargs.get('venue_pk')
        if not venue_pk:
            raise serializers.ValidationError({"venue": "venue_pk is required in URL"})
        serializer.save(venue_id=venue_pk)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def available(self, request, venue_pk=None):
        if not venue_pk:
            return Response({"error": "venue_pk is required in URL"}, status=400)

        start = request.query_params.get('start')
        end = request.query_params.get('end')
        if not start or not end:
            return Response({"error": "start and end are required"}, status=400)

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
            return Response({"error": "venue_pk is required"}, status=400)
        try:
            venue = VenueModel.objects.get(pk=venue_pk)
        except VenueModel.DoesNotExist:
            return Response({"error": "Venue not found"}, status=404)
        return Response({"url": venue.background_tables.url if venue.background_tables else ""})

    @action(detail=False, methods=['post'], url_path='upload_background')
    def upload_background(self, request, venue_pk=None):
        if not venue_pk:
            return Response({"error": "venue_pk is required"}, status=400)
        try:
            venue = VenueModel.objects.get(pk=venue_pk)
        except VenueModel.DoesNotExist:
            return Response({"error": "Venue not found"}, status=404)

        file = request.FILES.get('background')
        if file:
            venue.background_tables.save(file.name, file, save=True)
        return Response({"url": venue.background_tables.url if venue.background_tables else ""})

class TableBookingViewSet(viewsets.ModelViewSet):
    queryset = TableBookingModel.objects.all()
    serializer_class = TableBookingSerializer
    permission_classes = [IsVisitorOrReadOnly]
    filterset_fields = ['table', 'order', 'is_active']

    def perform_create(self, serializer):
        order = serializer.validated_data['order']
        if order.user != self.request.user:
            raise PermissionError("Cannot book tables for another user's order")
        serializer.save()

    def get_queryset(self):
        qs = super().get_queryset()
        venue_pk = self.kwargs.get('venue_pk')
        if venue_pk:
            qs = qs.filter(table__venue_id=venue_pk)
        return qs

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
    city = request.GET.get("city")
    country = request.GET.get("country")
    if not city or not country:
        return Response({"detail": "City and country are required"}, status=status.HTTP_400_BAD_REQUEST)

    lat, lng = geocode_city(city, country)
    return Response({"latitude": lat, "longitude": lng}, status=status.HTTP_200_OK)


