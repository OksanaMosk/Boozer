from rest_framework import serializers
from .models import OrderModel, OrderItemModel, OrderExtraServiceModel, TableBookingModel
# from .services.order_service import calculate_total, create_order_with_details
from ..menu.models import MenuItemModel
from ..venue.models import TableModel
from django.utils import timezone

class TableBookingSerializer(serializers.ModelSerializer):
    table = serializers.PrimaryKeyRelatedField(queryset=TableModel.objects.filter(is_active=True))

    class Meta:
        model = TableBookingModel
        fields = ['id', 'order', 'table', 'time_range', 'is_active']
        read_only_fields = ['id', 'order']

    def validate(self, data):
        instance = TableBookingModel(**data)
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

    class Meta:
        model = OrderExtraServiceModel
        fields = ['id', 'service', 'service_name', 'service_type', 'quantity',  'price']
        read_only_fields = ['id', 'service_name', 'service_type',  'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    extra_services = OrderExtraServiceSerializer(many=True)
    remaining_seconds = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = OrderModel
        fields = [
            'id', 'user', 'venue', 'status', 'currency', 'exchange_rate',
            'flight_price', 'transfer_price', 'total_price',
            'start_date', 'end_date', 'guests_count', 'gender_preference', 'payment_type', 'budget_range', 'comment',
            'user_city', 'user_latitude', 'user_longitude', 'distance_km',
            'items', 'extra_services', 'remaining_seconds', 'is_expired'
        ]
        read_only_fields = ['total_price', 'exchange_rate', 'user', 'venue']

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

    # "Time's up! Your reservation has expired. Please start a new order."