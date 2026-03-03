from rest_framework import serializers
from .models import TravelLogisticsModel, ExtraServiceModel


class TravelLogisticsSerializer(serializers.ModelSerializer):
    step_type_display = serializers.CharField(source='get_step_type_display', read_only=True)

    class Meta:
        model = TravelLogisticsModel
        fields = [
            'id',
            'venue',
            'step_type',
            'step_type_display',
            'price_per_km',
            'currency'
        ]

        extra_kwargs = {
            'venue': {'read_only': True},
            'currency': {'read_only': True}
        }

    def validate_price_per_km(self, value):
        if value < 0:
            raise serializers.ValidationError("Price per kilometer cannot be negative.")
        return value



class ExtraServiceSerializer(serializers.ModelSerializer):
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)
    price_type_display = serializers.CharField(source='get_price_type_display', read_only=True)

    class Meta:
        model = ExtraServiceModel
        fields = [
            'id',
            'venue',
            'name',
            'service_type',
            'service_type_display',
            'price_type',
            'price_type_display',
            'price',
            'currency'
        ]
        extra_kwargs = {
            'venue': {'read_only': True}
        }
