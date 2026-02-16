from django.urls import path, include
from rest_framework_nested import routers
from .views import VenueViewSet, VenuePhotoViewSet, TableViewSet, TableBookingViewSet, venue_constants, \
    city_coordinates, TagViewSet, VenueTagViewSet
from apps.menu.views import MenuViewSet
from apps.news.views import NewsViewSet
from apps.reviews_feedback.views import ReviewViewSet, FavoriteVenueViewSet
from apps.orders.views import OrderViewSet

router = routers.DefaultRouter()
router.register(r'venues', VenueViewSet, basename='venue')


venues_router = routers.NestedDefaultRouter(router, r'venues', lookup='venue')
venues_router.register(r'photos', VenuePhotoViewSet, basename='venue-photos')
venues_router.register(r'tags', TagViewSet, basename='tags')
venues_router.register(r'venue_tags', VenueTagViewSet, basename='venue-tags')
venues_router.register(r'tables', TableViewSet, basename='venue-tables')
venues_router.register(r'table_booking', TableBookingViewSet, basename='venue-table-booking')
venues_router.register(r'menu', MenuViewSet, basename='venue-menu')
venues_router.register(r'news', NewsViewSet, basename='venue-news')
venues_router.register(r'reviews', ReviewViewSet, basename='venue-reviews')
venues_router.register(r'favorites', FavoriteVenueViewSet, basename='venue-favorites')
venues_router.register(r'orders', OrderViewSet, basename='venue-orders')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(venues_router.urls)),
    path('constants/', venue_constants, name='venue_constants'),
    path('geocode/', city_coordinates, name='city_coordinates'),
]

