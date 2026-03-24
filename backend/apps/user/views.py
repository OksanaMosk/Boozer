from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework import filters, status, viewsets
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView, DestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import UserModel
from apps.user.models import ProfileModel
from apps.reviews_feedback.models import ReviewModel, FavoriteVenue
from apps.reviews_feedback.serializers import ReviewSerializer, FavoriteVenueSerializer
from apps.user.permissions import IsAdmin
from apps.user.services import UserService
from apps.user.serializers import (
    ProfileSerializer,
    UserSerializer,
    UserUpdateSerializer,
    UserActiveSerializer,
    UserRoleSerializer,
)


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
        if self.get_object() == request.user and request.data.get('is_active') is False:
            raise ValidationError("You cannot block yourself.")

        user = self.get_object()
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = UserService.toggle_user_active_status(user, serializer.validated_data['is_active'])
        return Response(UserActiveSerializer(user).data)


class UpdateUserRoleAPIView(APIView, UserUpdateMixin):
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, user_id):
        if int(user_id) == request.user.id and request.data.get('role') != 'admin':
            raise ValidationError("You cannot demote yourself from admin role.")

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

    def perform_destroy(self, instance):
        if instance == self.request.user:
            raise ValidationError("You cannot delete yourself.")
        instance.delete()

class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user_pk = self.kwargs.get('pk')
        return get_object_or_404(ProfileModel, user__id=user_pk)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            target_user_pk = self.kwargs.get('pk')
            if target_user_pk:
                return ProfileModel.objects.filter(user__pk=target_user_pk)
            return ProfileModel.objects.all()
        return ProfileModel.objects.filter(user=user)

    def _check_social_profile(self, serializer):
        user = self.request.user
        if hasattr(user, 'auth_provider') and str(user.auth_provider).lower() != "email":
            birth_date = serializer.validated_data.get('birth_date')
            is_rules_accepted = serializer.validated_data.get('is_rules_accepted')
            if not birth_date or not is_rules_accepted:
                raise ValidationError(
                    'For social login, you must provide your birth date and accept the rules.'
                )

    def perform_create(self, serializer):
        self._check_social_profile(serializer)
        target_user_pk = self.kwargs.get('pk')
        if target_user_pk and (self.request.user.is_staff or self.request.user.is_superuser):
            user = get_object_or_404(UserModel, pk=target_user_pk)
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
            raise PermissionDenied('You can only update this profile.')

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self._check_social_profile(serializer)
        serializer.save()
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.user != request.user and not (request.user.is_staff or request.user.is_superuser):
            raise PermissionDenied('You can only access this profile.')

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            profile = ProfileModel.objects.get(user__id=user_id)
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        except ProfileModel.DoesNotExist:
            return Response({'detail': 'Profile not found.'}, status=404)

    def post(self, request, user_id):
        data = request.data
        data['user'] = user_id
        serializer = ProfileSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def put(self, request, user_id):
        try:
            profile = ProfileModel.objects.get(user__id=user_id)
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except ProfileModel.DoesNotExist:
            return Response({'detail': 'Profile not found.'}, status=404)

    def delete(self, request, user_id):
        try:
            profile = ProfileModel.objects.get(user__id=user_id)
            profile.delete()
            return Response(status=204)
        except ProfileModel.DoesNotExist:
            return Response({'detail': 'Profile not found.'}, status=404)


class UserViewSet(viewsets.ModelViewSet):
    queryset = UserModel.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['is_active', 'role']
    ordering_fields = ['id', 'email', 'role', 'is_active']
    search_fields = ['email']

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


