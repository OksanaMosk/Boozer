from django.urls import path, include
from rest_framework_nested import routers
from .views import ReviewViewSet, FavoriteVenueViewSet, FavoriteCollectionViewSet

router = routers.DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='reviews')
router.register(r'collections', FavoriteCollectionViewSet, basename='collections')
router.register(r'favorites', FavoriteVenueViewSet, basename='favorites')

urlpatterns = [
    path('', include(router.urls)),
]
