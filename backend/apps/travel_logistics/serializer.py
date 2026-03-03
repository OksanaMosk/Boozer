from rest_framework import serializers
from .models import TravelLogisticsModel

class TravelLogisticsSerializer(serializers.ModelSerializer):
    step_type_display = serializers.CharField(source='get_step_type_display', read_only=True)

    class Meta:
        model = TravelLogisticsModel
        fields = [
            'id',
            'venue',
            'step_type',
            'step_type_display',
            'price_per_km'
        ]

        extra_kwargs = {
            'venue': {'read_only': True}
        }

    def validate_price_per_km(self, value):
        if value < 0:
            raise serializers.ValidationError("Price per kilometer cannot be negative.")
        return value