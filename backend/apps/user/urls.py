
from django.urls import path
from apps.user.views import (
    UpdateUserRoleAPIView,
    DeleteUserAPIView,
    UpdateUserActiveAPIView,
    UpdateUserAPIView,
    UserListCreateAPIView,
    ProfileViewSet
)


urlpatterns = [
    path('', UserListCreateAPIView.as_view(), name='user_list_create'),
    path('<int:pk>/profile/', ProfileViewSet.as_view({
        'get': 'retrieve',
        'post': 'create',
        'put': 'update',
        'patch': 'partial_update'
    }), name='user_profile'),

    path('<int:pk>/active/', UpdateUserActiveAPIView.as_view(), name='user_active'),
    path('change-role/<int:user_id>/', UpdateUserRoleAPIView.as_view(), name='change_user_role'),
    path('<int:pk>/update/', UpdateUserAPIView.as_view(), name='user_update'),
    path('<int:pk>/delete/', DeleteUserAPIView.as_view(), name='user_delete'),
]