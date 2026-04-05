import logging
import os

from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import redirect
# from django.utils.decorators import method_decorator
from django.conf import settings
from rest_framework import status
from rest_framework.generics import GenericAPIView, get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from apps.user.models import ProfileModel
from core.exceptions.jwt_exception import JWTException
from core.services.email_service import EmailService
from core.services.jwt_service import ActivateToken, JWTService, RecoveryToken, SocketToken
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from apps.auth.serializers import EmailSerializer, PasswordSerializer
from apps.user.serializers import UserSerializer

import requests
from rest_framework.response import Response

UserModel = get_user_model()

logger = logging.getLogger(__name__)


class ActivateUserView(GenericAPIView):
    """
    get:
        Activate a user account using the activation token provided in the URL.
    """
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
    def activate_user(self, token):
        if not token:
            return Response({'detail': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = JWTService.verify_token(token, ActivateToken)
            if user.is_active:
                return Response({'detail': 'Account is already activated.'}, status=status.HTTP_200_OK)
            user.is_active = True
            user.save()
            serializer = UserSerializer(user)
            logger.info(f'User {user.email} activated successfully.')
            return Response({'detail': 'Account activated successfully!', 'user': serializer.data}, status=status.HTTP_200_OK)

        except JWTException:
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)
        except UserModel.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, *args, **kwargs):
        token = kwargs.get('token')
        return self.activate_user(token)

    def get(self, request, *args, **kwargs):
        token = kwargs.get('token')
        response = self.activate_user(token)

        if response.status_code == 200:
            return redirect(f"{settings.BASE_URL}/login?activated=true")
        return response

class RecoveryRequestView(GenericAPIView):
    """
    post:
        Request a password recovery for a user account.
        Provide the user's email in the request body.
    """

    def get_serializer(self):
        return None

    permission_classes = (AllowAny,)
    def post(self, *args, **kwargs):
        data = self.request.data
        serializer = EmailSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = get_object_or_404(UserModel,  email=serializer.data['email'])
        EmailService.recovery(user)
        return Response({'details': 'Link send to email'}, status.HTTP_200_OK)


class RecoveryPasswordView(GenericAPIView):
    """
    post:
        Reset the user's password using the provided token and new password.
        Provide 'token' and 'new_password' in the request body.
    """

    permission_classes = (AllowAny,)
    serializer_class = PasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = PasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = kwargs['token']
        if not token:
            return Response({'detail': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = JWTService.verify_token(token, RecoveryToken)
        user.set_password(serializer.validated_data['password'])
        user.save()
        return Response(UserSerializer(user).data, status.HTTP_200_OK)


class SocketTokenView(GenericAPIView):
    """
    get:
        Generate a socket token for the authenticated user.
    """

    def get_serializer(self):
        return None

    permission_classes = (IsAuthenticated,)
    def get(self, *args, **kwargs):
        token = JWTService.create_token(user=self.request.user,token_class=SocketToken)
        return Response({'token': str(token)}, status.HTTP_200_OK)


# @method_decorator(name='post', decorator=swagger_auto_schema(security=[]))
class RegisterAPIView(GenericAPIView):
    """
    post:
        Register a new user account.
        Provide required user details (e.g., username, email, password) in the request body.
    """
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        # print("Server received body:", request.data)
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = serializer.save()
        except Exception as e:
            # print("Error creating user:", e)
            return Response({'detail': str(e)}, status=400)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    """
    post:
        Authenticate a user and return an access token.
        Provide 'username' and 'password' in the request body.
    """
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            user_data = UserSerializer(user).data
            token = JWTService.create_token(user=user, token_class=AccessToken)
            refresh_token = JWTService.create_token(user=user, token_class=RefreshToken)

            return Response({
                'access': str(token),
                'refresh': str(refresh_token),
                'user': user_data
            }, status=status.HTTP_200_OK)

        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class SocialLoginJWTAPIView(APIView):
    permission_classes = [AllowAny]

    SUPPORTED_PROVIDERS = ['google', 'facebook', 'apple']

    def post(self, request):
        provider = request.data.get('provider')
        access_token = request.data.get('access_token')

        if provider not in self.SUPPORTED_PROVIDERS:
            return Response({'detail': f'{provider} is not supported'}, status=400)

        if not access_token:
            return Response({'detail': 'access_token required'}, status=400)

        return self.handle_social_login(provider, access_token)

    def handle_social_login(self, provider, access_token):
        user_data = self.get_user_data_from_provider(provider, access_token)

        if not user_data or not user_data.get('email'):
            return Response({'detail': 'Invalid token or no email found'}, status=400)

        email = user_data['email']

        user, created = get_user_model().objects.get_or_create(
            email=email,
            defaults={
                'is_active': True
            }
        )

        if not created and not user.is_active:
            user.is_active = True
            user.save()

        profile, profile_created = ProfileModel.objects.get_or_create(user=user)
        if profile_created or not profile.name:
            profile.name = user_data.get('given_name', '') or email.split('@')[0]
        if profile_created or not profile.surname:
            profile.surname = user_data.get('family_name', '') or email.split('@')[0]
        profile.save()

        user_data = UserSerializer(user).data
        user_data['needs_profile'] = not profile.is_rules_accepted or not profile.birth_date
        refresh = RefreshToken.for_user(user)
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': user_data
        }, status=status.HTTP_200_OK)

    def get_user_data_from_provider(self, provider, access_token):

        try:
            if provider == 'google':
                return self.verify_google_token(access_token)
            elif provider == 'facebook':
                return self.verify_facebook_token(access_token)

        except requests.exceptions.RequestException:
            return None

    def verify_google_token(self, token):
        google_url = f'https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}'
        response = requests.get(google_url, timeout=5)

        if response.status_code != 200:
            google_url = f'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}'
            response = requests.get(google_url, timeout=5)

        if response.status_code == 200:
            return response.json()
        # print(f'GOOGLE API ERROR: {response.status_code} - {response.text}')
        return None

    def verify_facebook_token(self, access_token):
        fb_app_id = os.getenv('FACEBOOK_CLIENT_ID')
        fb_app_secret = os.getenv('FACEBOOK_CLIENT_SECRET')

        app_token = f'{fb_app_id}|{fb_app_secret}'

        try:
            debug_url = 'https://graph.facebook.com/debug_token'
            debug_response = requests.get(
                debug_url,
                params={
                    'input_token': access_token,
                    'access_token': app_token
                },
                timeout=5
            ).json()

            if not debug_response.get('data', {}).get('is_valid'):
                return None

            user_response = requests.get(
                'https://graph.facebook.com/me',
                params={
                    'fields': "id,email,first_name,last_name",
                    'access_token': access_token
                },
                timeout=5
            )

            if user_response.status_code == 200:
                return user_response.json()

        except requests.exceptions.RequestException:
            return None

        return None

class CurrentUserAPIView(APIView):
    """
    get:
        Retrieve information about the currently authenticated user.
    """
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
