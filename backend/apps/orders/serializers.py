from decimal import Decimal

from django.db.backends.postgresql.psycopg_any import DateTimeRange
from rest_framework import serializers
from .models import OrderModel, OrderItemModel, OrderExtraServiceModel, TableBookingModel
from ..menu.models import MenuItemModel
from ..venue.models import TableModel
from django.utils import timezone
from datetime import datetime

class TableBookingSerializer(serializers.ModelSerializer):
    table = serializers.PrimaryKeyRelatedField(queryset=TableModel.objects.filter(is_active=True))

    class Meta:
        model = TableBookingModel
        fields = ['id', 'order', 'table', 'time_range', 'is_active', 'status']
        read_only_fields = ['id']

    def validate(self, data):
        tr_data = data.get('time_range')
        table_id = self.context['view'].kwargs.get('table_pk')
        order_id = self.context['request'].data.get('order')

        if isinstance(tr_data, dict):
            lower_str = tr_data.get('lower')
            upper_str = tr_data.get('upper')

            try:
                lower_dt = datetime.fromisoformat(lower_str.replace('Z', '+00:00'))
                upper_dt = datetime.fromisoformat(upper_str.replace('Z', '+00:00'))
                data['time_range'] = DateTimeRange(lower_dt, upper_dt)
            except (ValueError, TypeError):
                raise serializers.ValidationError({'time_range': 'Invalid date format'})

        if not table_id or table_id == 'all':
            return data

        if TableBookingModel.objects.filter(table_id=table_id, time_range__overlap=data['time_range']).exists():
            raise serializers.ValidationError({'time_range': 'Already booked.'})

        instance = TableBookingModel(
            table_id=table_id,
            order_id=order_id,
            **data
        )
        instance.clean()

        return data


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item = serializers.PrimaryKeyRelatedField(queryset=MenuItemModel.objects.all())
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItemModel
        fields = ['id', 'order', 'menu_item', 'menu_item_name', 'quantity', 'menu_item_price']
        read_only_fields = ['id', 'menu_item_price']


class OrderExtraServiceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_type = serializers.CharField(source='service.service_type', read_only=True)
    row_total = serializers.SerializerMethodField()
    class Meta:
        model = OrderExtraServiceModel
        fields = ['id', 'service', 'service_name', 'service_type', 'quantity',  'price', 'row_total']
        read_only_fields = ['id', 'service_name', 'service_type',  'price', 'row_total']

    def get_row_total(self, obj):
        price = Decimal(str(obj.price))
        qty = obj.quantity
        order = obj.order

        if obj.service.price_type == 'per_day':
            return price * order.guests_count * qty
        return price * qty

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)
    extra_services = OrderExtraServiceSerializer(many=True, required=False)
    tables = TableBookingSerializer(source='table_bookings', many=True, read_only=True)
    venue_impact = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    menu_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    services_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    venue_name = serializers.ReadOnlyField(source='venue.name')
    remaining_seconds = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = OrderModel
        fields = [
            'id', 'venue_name', 'status', 'total_price', 'currency', 'venue_impact',  'menu_total', 'services_total', 'is_expired', 'remaining_seconds','exchange_rate',

             'user_city', 'user_latitude', 'user_longitude', 'venue_latitude', 'venue_longitude', 'distance_km',

            'flight_price', 'transfer_price', 'travel_calculation',

            'start_date', 'end_date', 'guests_count', 'gender_preference', 'payment_type', 'budget_range', 'comment',

            'items', 'extra_services', 'tables', 'user', 'venue',
        ]
        read_only_fields = ['total_price', 'venue_impact', 'user', 'venue', 'venue_latitude', 'venue_longitude']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        extra_services_data = validated_data.pop('extra_services', [])

        user = self.context['request'].user
        venue_id = self.context['view'].kwargs.get('venue_pk')

        from .services.order_service import create_order_with_details
        return create_order_with_details(
            user=user,
            venue_id=venue_id,
            validated_data=validated_data,
            items_data=items_data,
            extra_services_data=extra_services_data
        )

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        extra_services_data = validated_data.pop('extra_services', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                menu_item = item_data.get('menu_item')
                if menu_item:
                    OrderItemModel.objects.create(
                        order=instance,
                        menu_item=menu_item,
                        quantity=item_data.get('quantity', 1),
                        price=menu_item.price
                    )
        if extra_services_data is not None:
            instance.extra_services.all().delete()
            for service_data in extra_services_data:
                service = service_data['service']
                OrderExtraServiceModel.objects.create(
                    order=instance,
                    service=service,
                    quantity=service_data.get('quantity', 1),
                    price=service.price
                )


        from apps.orders.services.order_service import calculate_total
        calculate_total(instance)

        return instance

    def get_remaining_seconds(self, obj):
        if obj.expires_at and obj.status in ['DRAFT', 'HOLD']:
            now = timezone.now()
            diff = (obj.expires_at - now).total_seconds()
            return max(0, int(diff))
        return 0

    def get_is_expired(self, obj):
        if obj.status == 'EXPIRED' or (obj.expires_at and obj.expires_at < timezone.now()):
            return True
        return False