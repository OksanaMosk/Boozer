from rest_framework import serializers

class StatusMessageSerializer(serializers.Serializer):
    status = serializers.CharField(default="success")
    message = serializers.CharField(required=False)

class URLResponseSerializer(serializers.Serializer):
    url = serializers.URLField(allow_blank=True)

class CountResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    likes_count = serializers.IntegerField()