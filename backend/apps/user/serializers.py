
from datetime import date

from django.contrib.auth import get_user_model

from rest_framework import serializers

from apps.user.constants import ROLE_CHOICES
from apps.user.models import ProfileModel
from core.enums.regex_enum import phone_validator
from apps.user.services import UserService

UserModel = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.ReadOnlyField(source='user.id')
    is_rules_accepted = serializers.BooleanField(write_only=True)
    phone = serializers.CharField(
        validators=[phone_validator],
        style={'placeholder': '+xx (xxx) xxx-xx-xx'}
    )

    class Meta:
        model = ProfileModel
        fields = (
            'id',
            'user_id',
            'name',
            'surname',
            'phone',
            'birth_date',
            'is_rules_accepted',
            'is_critic',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at', 'user_id')



    @staticmethod
    def validate_birth_date(value):
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError('You must be at least 18 years old to register')
        return value

    @staticmethod
    def validate_is_rules_accepted(value):
        if not value:
            raise serializers.ValidationError(
                'You must confirm that the data you entered is correct and that you are over 18.')
        return value


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    role = serializers.ChoiceField(choices=ROLE_CHOICES, required=False)
    class Meta:
        model = UserModel
        fields = (
            'id',
            'email',
            'password',
            'role',
            'is_active',
            'is_staff',
            'is_superuser',
            'created_at',
            'updated_at',
            'profile',
        )
        read_only_fields = ('id',  'is_active', 'is_staff', 'is_superuser', 'created_at', 'updated_at')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')
        return UserService.create_user_with_profile(validated_data, profile_data)


class UserRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=ROLE_CHOICES)

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = (
            'email',

        )
        extra_kwargs = {
            'email': {'required': False},
        }


class UserActiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ('is_active',)

    def update(self, instance, validated_data):
        instance.is_active = validated_data['is_active']
        instance.save()
        return instance


class UserRoleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ('role',)

    def validate_role(self, value):
        request = self.context.get('request')
        current_user = getattr(request, 'user', None)

        if value in [UserModel.Role.ADMIN]:
            if not current_user or not current_user.is_superuser:
                raise serializers.ValidationError(
                    'Only admins can assign ADMIN roles.'
                )
        return value

    def update(self, instance, validated_data):
        instance.role = validated_data['role']
        instance.save()
        return instance