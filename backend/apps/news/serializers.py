from rest_framework import serializers
from .models import NewsModel


class NewsSerializer(serializers.ModelSerializer):
    venue_name = serializers.CharField(source='venue.name', read_only=True)

    class Meta:
        model = NewsModel
        fields = ['id', 'venue', 'venue_name', 'title', 'content', 'created_at', 'updated_at']
