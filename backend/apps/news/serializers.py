from rest_framework import serializers
from .models import NewsModel, NewsImageModel


class NewsImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsImageModel
        fields = ['id', 'image', 'is_cover', 'created_at']


class NewsSerializer(serializers.ModelSerializer):
    images = NewsImageSerializer(many=True, read_only=True)

    class Meta:
        model = NewsModel
        fields = [
            'id',
            'venue',
            'title',
            'content',
            'type',
            'status',
            'end_date',
            'views_count',
            'is_pinned',
            'images',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'venue',
            'status',
            'views_count',
            'created_at',
            'updated_at',
        ]