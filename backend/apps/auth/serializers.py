from django.contrib.auth import get_user_model

from rest_framework import serializers

UserModel=get_user_model()

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=6)