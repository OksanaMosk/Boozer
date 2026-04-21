from rest_framework_nested import routers
from apps.user.views import ProfileViewSet,  UserViewSet
from apps.reviews_feedback.views import ReviewViewSet, FavoriteVenueViewSet
from django.urls import path, include

from apps.venue.views import VenueUserListView

user_router = routers.DefaultRouter()
user_router.register(r'', UserViewSet)
user_reviews_router = routers.NestedDefaultRouter(user_router, r'', lookup='user')
user_reviews_router.register(r'reviews', ReviewViewSet, basename='user-reviews')
user_reviews_router.register(r'favorites', FavoriteVenueViewSet, basename='user-favorites')


urlpatterns = [
    path('<int:pk>/profile/', ProfileViewSet.as_view({
        'get': 'retrieve',
        'post': 'create',
        'put': 'update',
        'patch': 'partial_update'
    }), name='user_profile'),


    path('<int:user_id>/venues/', VenueUserListView.as_view(), name='user_venues_list'),
    path('', include(user_router.urls)),
    path('', include(user_reviews_router.urls)),
]