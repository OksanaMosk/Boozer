from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VenueViewSet, TagViewSet, TableViewSet

router = DefaultRouter()
router.register(r'venues', VenueViewSet, basename='venue')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'tables', TableViewSet, basename='table')

urlpatterns = [
    path('', include(router.urls)),
]
