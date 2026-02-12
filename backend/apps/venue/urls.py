from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VenueViewSet, TagViewSet, TableViewSet, VenuePhotoViewSet, TableBookingViewSet

router = DefaultRouter()
router.register(r'venues', VenueViewSet, basename='venue')
router.register(r'photos', VenuePhotoViewSet, basename='venue-photo')
router.register(r'tables', TableViewSet, basename='table')
router.register(r'bookings', TableBookingViewSet, basename='table-booking')
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = [
    path('', include(router.urls)),
]
