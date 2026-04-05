from django.contrib.auth import get_user_model

from rest_framework import serializers

UserModel=get_user_model()

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=6)


class AuthResponseSerializer(serializers.Serializer):
    access = serializers.CharField(required=False)
    refresh = serializers.CharField(required=False)

    access_token = serializers.CharField(required=False)
    refresh_token = serializers.CharField(required=False)

    user = serializers.SerializerMethodField()
    needs_profile = serializers.BooleanField(required=False, default=False)

    def get_user(self, obj):
        from apps.user.serializers import UserSerializer
        user_data = obj.get('user')
        if isinstance(user_data, dict):
            return user_data
        return UserSerializer(user_data).data


class TokenSerializer(serializers.Serializer):
    token = serializers.CharField()