from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import TravelLogisticsModel, ExtraServiceModel
from .serializer import TravelLogisticsSerializer, ExtraServiceSerializer
from .services import TravelCalculationService

from ..user.permissions import IsAdminOrVenueAdminOrReadOnly
from ..venue.models import VenueModel


class TravelLogisticsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing travel logistics steps linked to a specific venue.
    Accessible via: /api/venues/{venue_pk}/travel-logistics/
    """
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]
    serializer_class = TravelLogisticsSerializer

    def get_queryset(self):
        """
        Filter travel steps specifically for the venue ID provided in the URL.
        'venue_pk' is passed automatically by the nested router.
        """
        return TravelLogisticsModel.objects.filter(venue_id=self.kwargs['venue_pk'])

    def perform_create(self, serializer):
        """
        Associate the new logistics step with the venue ID from the URL context.
        """
        serializer.save(venue_id=self.kwargs['venue_pk'])

    def create(self, request, *args, **kwargs):
        """
        Custom validation to prevent duplicate step types for a single venue.
        Ensures a venue cannot have two 'flight' or 'to_airport' entries.
        """
        venue_id = self.kwargs.get('venue_pk')
        step_type = request.data.get('step_type')

        if TravelLogisticsModel.objects.filter(venue_id=venue_id, step_type=step_type).exists():
            return Response(
                {'error': f"Step type '{step_type}' already exists for this venue."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['post'], url_path='update-prices')
    def update_prices(self, request, venue_pk=None):
        """
        Custom action for Venue Admin to set or update all prices at once.
        Endpoint: POST /api/venues/{venue_pk}/travel-logistics/update-prices/
        """
        venue_id = venue_pk
        prices_data = request.data

        if not isinstance(prices_data, list):
            return Response({'error': 'Expected a list of price objects'}, status=status.HTTP_400_BAD_REQUEST)

        results = []
        for item in prices_data:
            step, created = TravelLogisticsModel.objects.update_or_create(
                venue_id=venue_id,
                step_type=item.get('step_type'),
                defaults={'price_per_km': item.get('price_per_km')}
            )
            results.append({
                'step_type': step.step_type,
                'price_per_km': step.price_per_km,
                'currency': step.currency
            })

        return Response(results, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='calculate', permission_classes=[IsAdminOrVenueAdminOrReadOnly])
    def calculate(self, request, venue_pk=None):
        """
        Public endpoint for customers to calculate trip cost.
        URL: /api/venues/{venue_pk}/travel-logistics/calculate/?lat=...&lng=...
        """
        v_lat = request.query_params.get('lat')
        v_lng = request.query_params.get('lng')

        if not v_lat or not v_lng:
            return Response({'error': 'Latitude and longitude are required'}, status=400)
        try:
            venue = VenueModel.objects.get(pk=venue_pk)
        except VenueModel.DoesNotExist:
            return Response({'error': 'Venue not found'}, status=404)

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
        """
        """
        prices_data = request.data

        if not isinstance(prices_data, list):
            return Response({'error': 'Expected a list of service objects'}, status=status.HTTP_400_BAD_REQUEST)

        results = []
        for item in prices_data:
            service, created = ExtraServiceModel.objects.update_or_create(
                venue_id=venue_pk,
                service_type=item.get('service_type'),
                defaults={
                    'name': item.get('name', item.get('service_type')),
                    'price': item.get('price'),
                    'price_type': item.get('price_type', 'fixed')
                }
            )
            results.append({
                'service_type': service.service_type,
                'price': service.price,
                'price_type': service.price_type,
                'currency': service.currency
            })

        return Response(results, status=status.HTTP_200_OK)

