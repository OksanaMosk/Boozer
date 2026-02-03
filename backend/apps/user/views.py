from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework import filters, status, viewsets
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView, DestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import ValidationError

from apps.user.models import ProfileModel
from apps.user.serializers import (
    ProfileSerializer,
    UserSerializer,
    UserUpdateSerializer,
    UserActiveSerializer,
    UserRoleSerializer,
)
from apps.user.permissions import IsAdmin
from apps.user.services import UserService

UserModel = get_user_model()

class UserUpdateMixin:
    """
    Універсальний міксин для оновлення будь-яких полів користувача.
    Використовує серіалізатор, переданий у view.
    """
    serializer_class = None  # повинен бути визначений у view

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

class UserListCreateAPIView(ListCreateAPIView):
    queryset = UserModel.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active']
    ordering_fields = ['id', 'email', 'role', 'is_active']
    ordering = ['id']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]


class UpdateUserActiveAPIView(RetrieveUpdateAPIView, UserUpdateMixin):
    queryset = UserModel.objects.all()
    serializer_class = UserActiveSerializer
    permission_classes = [IsAdmin]
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = UserService.toggle_user_active_status(user, serializer.validated_data['is_active'])
        return Response(UserActiveSerializer(user).data)


class UpdateUserRoleAPIView(APIView, UserUpdateMixin):
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, user_id):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = UserService.change_user_role(request.user, user_id, serializer.validated_data['role'])
        return Response(UserSerializer(user).data)


class UpdateUserAPIView(RetrieveUpdateAPIView, UserUpdateMixin):
    queryset = UserModel.objects.all()
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    lookup_field = "pk"

    def patch(self, request, *args, **kwargs):
        return self.update_instance(request, self.get_object())


class DeleteUserAPIView(DestroyAPIView):
    queryset = UserModel.objects.all()
    permission_classes = [IsAdmin]
    lookup_field = 'pk'


class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.is_superuser:
            user_pk = self.kwargs.get('user_pk')
            return ProfileModel.objects.filter(user__pk=user_pk) if user_pk else ProfileModel.objects.all()
        return ProfileModel.objects.filter(user=self.request.user)

    def _check_social_profile(self, serializer):
        """Перевірка для соцлогіну: має бути birth_date і is_rules_accepted"""
        user = self.request.user
        if user.auth_provider != user.AuthProvider.EMAIL:
            birth_date = serializer.validated_data.get('birth_date')
            is_rules_accepted = serializer.validated_data.get('is_rules_accepted')
            if not birth_date or not is_rules_accepted:
                raise ValidationError(
                    'For social login, you must provide your birth date and accept the rules.'
                )

    def perform_create(self, serializer):
        self._check_social_profile(serializer)
        user_pk = self.kwargs.get('user_pk')

        if user_pk and (self.request.user.is_staff or self.request.user.is_superuser):
            user = get_object_or_404(UserModel, pk=user_pk)
        else:
            user = self.request.user

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
            raise PermissionDenied("You can only update your own profile.")

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self._check_social_profile(serializer)
        serializer.save()
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user and not (request.user.is_staff or request.user.is_superuser):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only access your own profile.")
        serializer = self.get_serializer(instance)
        return Response(serializer.data)