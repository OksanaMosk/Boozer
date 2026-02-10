from rest_framework import serializers
from .models import OrderModel, OrderItemModel, OrderExtraServiceModel
from .services.order_service import calculate_total


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItemModel
        fields = ['id', 'order', 'menu_item', 'menu_item_name', 'quantity', 'menu_item_price']
        read_only_fields = ['menu_item_price']

class OrderExtraServiceSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_type = serializers.CharField(source='service.service_type', read_only=True)

    class Meta:
        model = OrderExtraServiceModel
        fields = ['service', 'service_name', 'service_type', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    extra_services = OrderExtraServiceSerializer(many=True)

    class Meta:
        model = OrderModel
        fields = [
            'id', 'user', 'venue', 'status', 'currency', 'exchange_rate',
            'flight_price', 'transfer_price', 'total_price',
            'start_date', 'end_date', 'guests_count', 'comment',
            'user_city', 'user_latitude', 'user_longitude', 'distance_km',
            'items', 'extra_services',
        ]
        read_only_fields = ['total_price', 'exchange_rate']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        extra_services_data = validated_data.pop('extra_services', [])
        order = OrderModel.objects.create(**validated_data)

        for item_data in items_data:
            item_data['price'] = item_data['menu_item'].price
            OrderItemModel.objects.create(order=order, **item_data)

        for es_data in extra_services_data:
            OrderExtraServiceModel.objects.create(order=order, **es_data)

        calculate_total(order)

        return order