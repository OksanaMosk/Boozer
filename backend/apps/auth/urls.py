from django.urls import path, re_path

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.auth.views import (
    ActivateUserView,
    CurrentUserAPIView,
    LoginAPIView,
    RecoveryPasswordView,
    RecoveryRequestView,
    RegisterAPIView,
    SocketTokenView, SocialLoginJWTAPIView,
)

urlpatterns = [
    path('', TokenObtainPairView.as_view(), name='auth_login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('social_jwt/', SocialLoginJWTAPIView.as_view(), name='social_login_jwt'),
    path('socket/', SocketTokenView.as_view(), name='socket-token'),
    re_path(r'^activate/(?P<token>.+)/$', ActivateUserView.as_view(), name='activate'),
    path('recovery/', RecoveryRequestView.as_view(), name='recovery_request'),
    re_path(r'^recovery/(?P<token>.+)/$', RecoveryPasswordView.as_view(), name='recovery_password'),
    path('me/', CurrentUserAPIView.as_view(), name='current_user'),
]