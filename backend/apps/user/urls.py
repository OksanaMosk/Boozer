
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from apps.user.views import ProfileViewSet
from apps.user.views import (
    UpdateUserRoleAPIView,
    DeleteUserAPIView,
    UpdateUserActiveAPIView,
    UpdateUserAPIView,
    UserListCreateAPIView,
)


router = DefaultRouter()
router.register(r'users', UserListCreateAPIView, basename='user')

users_router = NestedDefaultRouter(router, r'users', lookup='user')
users_router.register(r'profile', ProfileViewSet, basename='user-profile')
urlpatterns = router.urls + users_router.urls + [
    path('<int:pk>/active/', UpdateUserActiveAPIView.as_view(), name='user_active'),
    path('change-role/<int:user_id>/', UpdateUserRoleAPIView.as_view(), name='change_user_role'),
    path('<int:pk>/update/', UpdateUserAPIView.as_view(), name='user_update'),
    path('<int:pk>/delete/', DeleteUserAPIView.as_view(), name='user_delete'),
]