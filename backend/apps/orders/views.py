from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import OrderModel
from .serializers import OrderSerializer
from .services.distance_service import calculate_order_route
from .services.order_service import calculate_total

PRICE_AFFECTING_FIELDS = (
    'currency',
    'flight_price',
    'transfer_price',
)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = OrderModel.objects.all()
    serializer_class = OrderSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    filterset_fields = ['status', 'currency', 'user', 'venue', 'start_date', 'end_date']

    search_fields = ['comment', 'user_city', 'venue__name']

    ordering_fields = ['start_date', 'end_date', 'total_price']
    ordering = ['-start_date']

    def perform_create(self, serializer):
        order = serializer.save(user=self.request.user)
        calculate_total(order)
        calculate_order_route(order)

    def perform_update(self, serializer):
        order = serializer.save()
        if any(f in serializer.validated_data for f in PRICE_AFFECTING_FIELDS):
            calculate_total(order)
        calculate_order_route(order)

