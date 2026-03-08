from typing import cast

from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import OrderModel, TableBookingModel
from .serializers import OrderSerializer, TableBookingSerializer
from .services.table_booking_service import create_bulk_table_bookings
from ..user.permissions import IsAdminOrVenueAdminOrReadOnly, IsOrderOwnerOrVenueAdmin, \
    IsBookingOwnerOrVenueAdmin
from rest_framework.exceptions import PermissionDenied
from django.db.backends.postgresql.psycopg_any import DateTimeRange
from datetime import datetime


# PRICE_AFFECTING_FIELDS = (
#     'currency',
#     'flight_price',
#     'transfer_price'
# )


class OrderViewSet(viewsets.ModelViewSet):
    """
       ViewSet for managing Orders.
       Supports nested routing via /api/venues/{venue_pk}/orders/
       and direct access via /api/orders/.
       """
    queryset = OrderModel.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'currency', 'user', 'venue', 'start_date', 'end_date']
    search_fields = ['comment', 'user_city', 'venue__name']
    ordering = ['-start_date']
    ordering_fields = ['start_date', 'end_date', 'total_price']

    def get_permissions(self):
        """
        Manage access rights based on actions:
        - List/Create: Authenticated users only.
        - Update/Delete: Order owners or Venue Admins.
        - Others: Admin/Staff only.
        """
        if self.action in ['create', 'list']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsOrderOwnerOrVenueAdmin()]
        return [IsAdminOrVenueAdminOrReadOnly()]

    def get_queryset(self):
        """
        Queryset filtering logic:
        1. Regular users see only their own orders.
        2. Staff/Admins see all orders in the system.
        3. If accessed via nested URL, filter by specific venue_id.
        """
        user = self.request.user
        venue_id = self.kwargs.get('venue_pk')

        if user.is_staff:
            qs = OrderModel.objects.all()
        else:
            qs = OrderModel.objects.filter(user=user)
        if venue_id:
            qs = qs.filter(venue_id=venue_id)
        return qs.select_related('user', 'venue').prefetch_related('items', 'extra_services')

    def perform_create(self, serializer):
        """
        Save the order. The core logic (Timer initialization, Google Maps routing,
        and Price calculation) is handled within OrderSerializer.create and its services.
        """
        serializer.save()

    def perform_update(self, serializer):
        """
        Update the order. Price re-calculation logic is triggered automatically
        if price-affecting fields are modified.
        """
        serializer.save()


class TableBookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Table Bookings within an Order.
    Supports nested routing via /api/venues/{venue_pk}/tables/{table_pk}/bookings/
    """
    queryset = TableBookingModel.objects.all()
    serializer_class = TableBookingSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['table', 'order', 'is_active']

    def get_permissions(self):
        """
        Access control for bookings:
        - List/Create: Authenticated users.
        - Update/Delete: Booking owners or Venue Admins.
        """
        if self.action in ['create', 'list', 'bulk_create']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsBookingOwnerOrVenueAdmin()]
        return [IsAdminOrVenueAdminOrReadOnly()]

    def get_queryset(self):
        """
        Filter bookings based on venue context and time range overlap.
        """
        request = cast(Request, self.request)
        venue_pk = self.kwargs.get('venue_pk')
        table_pk = self.kwargs.get('table_pk')

        lower = request.query_params.get('lower')
        upper = request.query_params.get('upper')

        qs = TableBookingModel.objects.all()
        if venue_pk:
            qs = qs.filter(table__venue_id=venue_pk)
        if lower and upper:
            try:
                l_dt = datetime.fromisoformat(lower.replace('Z', '+00:00'))
                u_dt = datetime.fromisoformat(upper.replace('Z', '+00:00'))

                if l_dt > u_dt:
                    return qs.none()

                search_range = DateTimeRange(l_dt, u_dt)
                qs = qs.filter(time_range__overlap=search_range)
            except (ValueError, TypeError):
                pass

        if table_pk and table_pk.isdigit():
            qs = qs.filter(table_id=table_pk)

        if self.action in ['update', 'partial_update', 'destroy'] and not self.request.user.is_staff:
            qs = qs.filter(order__user=self.request.user)

        return qs.select_related('order', 'table')

    def perform_create(self, serializer):
        """
        Verify that the user is the owner of the order or a staff member
        before creating a booking.
        """
        table_id = self.kwargs.get('table_pk')
        order = serializer.validated_data['order']
        user = self.request.user

        if order.user != user and not user.is_staff:
            raise PermissionDenied("You cannot book a table for another user's order.")

        serializer.save(table_id=table_id)

    @action(detail=False, methods=['post'], url_path='bulk-create')
    def bulk_create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            bookings = create_bulk_table_bookings(
                order_id=request.data.get('order'),
                table_ids=request.data.get('tables', []),
                time_range=serializer.validated_data['time_range'],
                venue_id=self.kwargs.get('venue_pk'),
                user=request.user
            )

            return Response({
                "status": "success",
                "booking_ids": [b.id for b in bookings]
            }, status=201)

        except (ValidationError, PermissionDenied) as e:

            raise e