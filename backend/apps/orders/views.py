
from rest_framework import viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action

from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework import serializers

from core.services.email_service import EmailService
from .models import OrderModel, TableBookingModel
from .serializers import OrderSerializer, TableBookingSerializer
from .services.exchange_service import get_private_bank_exchange_rate
from .services.order_service import get_orders_for_user
from .services.table_booking_service import create_bulk_table_bookings, apply_time_range_filter
from ..user.permissions import IsAdminOrVenueAdminOrReadOnly, IsOrderOwnerOrVenueAdmin, \
    IsBookingOwnerOrVenueAdmin
from rest_framework.exceptions import PermissionDenied

from django.utils import timezone
from rest_framework.exceptions import APIException


class ReservationExpired(APIException):
    status_code = 410
    default_detail = 'Reservation expired'
    default_code = 'EXPIRED'


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
    ordering = ['-id']
    ordering_fields = ['id', 'start_date', 'end_date', 'total_price']

    def get_permissions(self):
        """
        Manage access rights based on actions:
        - List/Create: Authenticated users only.
        - Update/Delete: Order owners or Venue Admins.
        - Others: Admin/Staff only.
        """
        if self.request.user.is_staff or (
                hasattr(self.request.user, 'role') and self.request.user.role.lower() == 'admin'):
            return [IsAuthenticated()]

        if self.action in ['create', 'list']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsOrderOwnerOrVenueAdmin()]

        return [IsAdminOrVenueAdminOrReadOnly()]

    def get_queryset(self):
        return get_orders_for_user(
            self.request.user,
            self.kwargs.get('venue_pk')
        ).order_by('-id')

    def perform_create(self, serializer):
        """
        Save the order. The core logic (Timer initialization, Google Maps routing,
        and Price calculation) is handled within OrderSerializer.create and its services.
        """
        serializer.save()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.expires_at and timezone.now() > instance.expires_at:
            raise ReservationExpired()
        return super().retrieve(request, *args, **kwargs)

    def perform_update(self, serializer):
        order = self.get_object()
        new_comment = serializer.validated_data.get('comment', '')
        new_status = serializer.validated_data.get('status', '')

        if "[REFUND]" in new_comment:
            OrderModel.objects.filter(pk=order.pk).update(comment=new_comment)
            order.comment = new_comment
            EmailService.refund_request(user=order.user, order=order)
            return

        if new_status == 'CANCELLED':
            serializer.save()
            return

        if order.expires_at and timezone.now() > order.expires_at:
            raise ValidationError({'detail': 'Order expired'})

        serializer.save()


class TableBookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Table Bookings within an Order.
    Supports nested routing via /api/venues/{venue_pk}/tables/{table_pk}/bookings/
    """
    pagination_class = None
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
        venue_pk = self.kwargs.get('venue_pk')
        table_pk = self.kwargs.get('table_pk')

        qs = TableBookingModel.objects.select_related('order', 'table')

        if venue_pk:
            qs = qs.filter(table__venue_id=venue_pk)
        if table_pk and table_pk.isdigit():
            qs = qs.filter(table_id=table_pk)

        qs = apply_time_range_filter(
            qs,
            self.request.query_params.get('lower'),
            self.request.query_params.get('upper')
        )

        if self.action in ['update', 'partial_update', 'destroy'] and not self.request.user.is_staff:
            qs = qs.filter(order__user=self.request.user)

        return qs

    def perform_create(self, serializer):
        """
        Verify that the user is the owner of the order or a staff member
        before creating a booking.
        """
        table_id = self.kwargs.get('table_pk')
        order = serializer.validated_data['order']
        user = self.request.user

        if order.user != user and not user.is_staff:
            raise PermissionDenied('You cannot book a table for another user\'s order.')

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
                'status': 'success',
                'booking_ids': [b.id for b in bookings]
            }, status=201)

        except (ValidationError, PermissionDenied) as e:

            raise e

class ExchangeRateView(APIView):
    """
    get:
        Retrieve current exchange rates from the private bank.
        Accessible to all users (no authentication required).
    """
    permission_classes =(AllowAny,)

    def get(self, request, *args, **kwargs):
        try:
            rates = get_private_bank_exchange_rate()
            return Response(rates, status=status.HTTP_200_OK)
        except ValidationError as e:
            raise serializers.ValidationError({'detail': str(e)})
