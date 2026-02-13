from django.urls import path, include
from rest_framework_nested import routers
from .views import ReviewViewSet, FavoriteVenueViewSet

router = routers.DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='reviews')
router.register(r'favorites', FavoriteVenueViewSet, basename='favorites')

urlpatterns = [
    path('', include(router.urls)),
]
