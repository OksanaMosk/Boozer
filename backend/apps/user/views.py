from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework import filters, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied

from apps.user.models import ProfileModel
from apps.reviews_feedback.models import ReviewModel, FavoriteVenue
from apps.reviews_feedback.serializers import ReviewSerializer, FavoriteVenueSerializer
from apps.user.permissions import IsAdmin
from rest_framework.decorators import action

from apps.user.serializers import (
    ProfileSerializer,
    UserSerializer
)
from apps.user.services.profile_service import validate_social_auth_profile, get_profile_target_user
from apps.user.services.user_service import UserService

UserModel = get_user_model()

class UserUpdateMixin:

    serializer_class = None

    def update_instance(self, request, instance):
        serializer = self.serializer_class(
            instance,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)



class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user_pk = self.kwargs.get('pk')
        return get_object_or_404(ProfileModel, user__id=user_pk)

    def get_queryset(self):
        user = self.request.user

        if user.is_anonymous: return ProfileModel.objects.none()

        if user.is_staff or user.is_superuser:
            target_user_pk = self.kwargs.get('pk')
            if target_user_pk:
                return ProfileModel.objects.filter(user__pk=target_user_pk)
            return ProfileModel.objects.all()
        return ProfileModel.objects.filter(user=user)

    def perform_create(self, serializer):
        validate_social_auth_profile(self.request.user, serializer.validated_data)
        user = get_profile_target_user(self.request.user, self.kwargs.get('pk'))
        serializer.save(user=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()

        if instance.user != request.user and not (request.user.is_staff or request.user.is_superuser):
            raise PermissionDenied('You can only update this profile.')

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        validate_social_auth_profile(self.request.user, serializer.validated_data)
        serializer.save()
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.user != request.user and not (request.user.is_staff or request.user.is_superuser):
            raise PermissionDenied('You can only access this profile.')

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = UserModel.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['is_active', 'role']
    ordering_fields = ['id', 'email', 'role', 'is_active']
    search_fields = ['email']

    @action(detail=True, methods=['patch'], url_path='active')
    def active(self, request, pk=None):
        user = self.get_object()

        if user == request.user and request.data.get('is_active') is False:
            raise ValidationError({'detail': 'You cannot block yourself.'})

        UserService.toggle_user_active_status(user, request.data.get('is_active'))
        return Response({'status': 'active updated'})

    @action(detail=True, methods=['patch'], url_path='change-role')
    def change_role(self, request, pk=None):
        user = self.get_object()

        if user == request.user and request.data.get('role') != UserModel.Role.ADMIN:
            raise ValidationError({'detail': 'You cannot demote yourself from admin role.'})

        UserService.change_user_role(
            requesting_user=self.request.user,
            target_user_id=pk,
            new_role=request.data.get('role')
        )
        return Response({'status': 'role updated'})

    def perform_destroy(self, instance):
        if instance == self.request.user:
            raise ValidationError({'detail': 'You cannot delete yourself.'})
        instance.delete()

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdmin()]

    def reviews(self, request, user_pk=None):
        user = get_object_or_404(UserModel, pk=user_pk)
        queryset = ReviewModel.objects.filter(user=user)
        serializer = ReviewSerializer(queryset, many=True)
        return Response(serializer.data)

    def favorites(self, request, user_pk=None):
        user = get_object_or_404(UserModel, pk=user_pk)
        queryset = FavoriteVenue.objects.filter(user=user)
        serializer = FavoriteVenueSerializer(queryset, many=True)
        return Response(serializer.data)
