from django.core.exceptions import PermissionDenied
from rest_framework import viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import VenueModel, TagModel, TableModel, VenuePhotoModel, TableBookingModel
from .serializers import VenueSerializer, TagSerializer, TableSerializer, VenuePhotoSerializer, TableBookingSerializer
from .services.geocode import geocode_city
from .services.venue_constans import get_venue_constants
from ..user.permissions import IsAdmin, IsVenueAdminOrReadOnly, IsAdminOrVenueAdminOrReadOnly


class VenueViewSet(viewsets.ModelViewSet):
    queryset = VenueModel.objects.all()
    serializer_class = VenueSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country', 'city']
    search_fields = ['name', 'description']

    ordering_fields = ['rating', 'average_check', 'reviews_count', 'views']
    ordering = ['-rating']

    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

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


