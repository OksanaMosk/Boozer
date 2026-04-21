from rest_framework import viewsets, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import TravelLogisticsModel, ExtraServiceModel
from .serializer import TravelLogisticsSerializer, ExtraServiceSerializer

from .services.logistics_service import check_logistics_step_exists, bulk_update_logistics_prices, \
    bulk_update_extra_services
from .services.travel_calculation_service import TravelCalculationService

from ..user.permissions import IsAdminOrVenueAdminOrReadOnly
from ..venue.models import VenueModel
from django.shortcuts import get_object_or_404

class TravelLogisticsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing travel logistics steps linked to a specific venue.
    Accessible via: /api/venues/{venue_pk}/travel-logistics/
    """
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]
    serializer_class = TravelLogisticsSerializer

    # def get_queryset(self):
    #     """
    #     Filter travel steps specifically for the venue ID provided in the URL.
    #     'venue_pk' is passed automatically by the nested router.
    #     """
    #     return TravelLogisticsModel.objects.filter(venue_id=self.kwargs['venue_pk'])

    def get_queryset(self):
        """
        Filter travel steps specifically for the venue ID provided in the URL.
        'venue_pk' is passed automatically by the nested router.
        """
        venue_pk = self.kwargs.get('venue_pk')
        return TravelLogisticsModel.objects.filter(venue_id=venue_pk) if venue_pk else TravelLogisticsModel.objects.none()



    def perform_create(self, serializer):
        """
        Associate the new logistics step with the venue ID from the URL context.
        """
        serializer.save(venue_id=self.kwargs['venue_pk'])

    def create(self, request, *args, **kwargs):
        venue_id = self.kwargs.get('venue_pk')
        venue = get_object_or_404(VenueModel, id=venue_id)
        self.check_object_permissions(request, venue)

        step_type = request.data.get('step_type')
        if check_logistics_step_exists(venue_id, step_type):
            raise serializers.ValidationError({'error': f"Step type '{step_type}' already exists."})

        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['post'], url_path='update-prices')
    def update_prices(self, request, venue_pk=None):
        venue = get_object_or_404(VenueModel, id=venue_pk)
        self.check_object_permissions(request, venue)

        if not isinstance(request.data, list):
            raise serializers.ValidationError({'error': 'Expected a list of price objects'})

        updated_steps = bulk_update_logistics_prices(venue.id, request.data)

        serializer = self.get_serializer(updated_steps, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='calculate', permission_classes=[IsAdminOrVenueAdminOrReadOnly])
    def calculate(self, request, venue_pk=None):
        """
        Public endpoint for customers to calculate trip cost.
        URL: /api/venues/{venue_pk}/travel-logistics/calculate/?lat=...&lng=...
        """
        v_lat = request.query_params.get('lat')
        v_lng = request.query_params.get('lng')

        if not v_lat or not v_lng:
            raise serializers.ValidationError({'error': 'Latitude and longitude are required'})
        try:
            venue = get_object_or_404(VenueModel, pk=venue_pk)
        except (ValueError, TypeError):
            raise serializers.ValidationError({'error': 'Coordinates must be numbers'})

        service = TravelCalculationService(venue)
        result = service.calculate_trip(float(v_lat), float(v_lng))

        return Response(result)


class ExtraServiceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]
    serializer_class = ExtraServiceSerializer

    def get_queryset(self):
        return ExtraServiceModel.objects.filter(venue_id=self.kwargs.get('venue_pk'))

    def perform_create(self, serializer):
        serializer.save(venue_id=self.kwargs.get('venue_pk'))

    @action(detail=False, methods=['post'], url_path='update-prices')
    def update_prices(self, request, venue_pk=None):
        venue = get_object_or_404(VenueModel, id=venue_pk)
        self.check_object_permissions(request, venue)

        if not isinstance(request.data, list):
            raise serializers.ValidationError({'error': 'Expected a list of service objects'})
        updated_services = bulk_update_extra_services(venue.id, request.data)

        serializer = self.get_serializer(updated_services, many=True)
        return Response(serializer.data)
