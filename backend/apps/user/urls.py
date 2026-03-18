from rest_framework_nested import routers
from apps.user.views import ProfileViewSet, UserListCreateAPIView, UpdateUserActiveAPIView, UpdateUserRoleAPIView, \
    DeleteUserAPIView, UpdateUserAPIView, UserViewSet
from apps.reviews_feedback.views import ReviewViewSet, FavoriteVenueViewSet
from django.urls import path, include

from apps.venue.views import VenueUserListView

user_router = routers.DefaultRouter()
user_router.register(r'users', UserViewSet, basename='user')
user_reviews_router = routers.NestedDefaultRouter(user_router, r'users', lookup='user')
user_reviews_router.register(r'reviews', ReviewViewSet, basename='user-reviews')
user_reviews_router.register(r'favorites', FavoriteVenueViewSet, basename='user-favorites')


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
    path('<int:user_id>/venues/', VenueUserListView.as_view(), name='user_venues_list'),
    path('', include(user_router.urls)),
    path('', include(user_reviews_router.urls)),
]