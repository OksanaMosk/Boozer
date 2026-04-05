
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
    avatar = serializers.ImageField(required=False, allow_null=True)
    class Meta:
        model = ProfileModel
        fields = (
            'id',
            'user_id',
            'name',
            'surname',
            'avatar',
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
    profile = serializers.SerializerMethodField()
    role = serializers.ChoiceField(choices=ROLE_CHOICES, required=False)
    managed_venue_ids = serializers.SerializerMethodField()
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
            'managed_venue_ids'
        )
        read_only_fields = ('id',  'is_active', 'is_staff', 'role', 'is_superuser', 'created_at', 'updated_at')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def get_profile(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile:
            return ProfileSerializer(profile).data

        return ProfileSerializer(ProfileModel(
            name="Admin" if obj.is_staff or obj.is_superuser else "User"
        )).data

    def get_managed_venue_ids(self, obj):
        from apps.venue.models import VenueModel
        return list(VenueModel.objects.filter(venue_admin_id=obj.id).values_list('id', flat=True))

    def create(self, validated_data):
        profile_raw_data = self.initial_data.get('profile')

        if not profile_raw_data:
            raise serializers.ValidationError({'profile': 'This field is required'})

        profile_serializer = ProfileSerializer(data=profile_raw_data)
        profile_serializer.is_valid(raise_exception=True)

        return UserService.create_user_with_profile(validated_data, profile_serializer.validated_data)


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