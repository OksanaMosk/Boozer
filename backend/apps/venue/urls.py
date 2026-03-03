from django.urls import path, include
from rest_framework_nested import routers
from .views import VenueViewSet, VenuePhotoViewSet, TableViewSet, TableBookingViewSet, venue_constants, \
    city_coordinates, TagViewSet, VenueTagViewSet, TablesLayoutViewSet
from apps.menu.views import MenuViewSet, MenuItemViewSet
from apps.news.views import NewsViewSet, NewsImageViewSet
from apps.reviews_feedback.views import ReviewViewSet, FavoriteVenueViewSet
from apps.orders.views import OrderViewSet
from ..travel_logistics.views import TravelLogisticsViewSet, ExtraServiceViewSet

router = routers.DefaultRouter()
router.register(r'venues', VenueViewSet, basename='venue')


venues_router = routers.NestedDefaultRouter(router, r'venues', lookup='venue')
venues_router.register(r'photos', VenuePhotoViewSet, basename='venue-photos')
venues_router.register(r'tags', TagViewSet, basename='tags')
venues_router.register(r'venue_tags', VenueTagViewSet, basename='venue-tags')
venues_router.register(r'tables', TableViewSet, basename='venue-tables')
venues_router.register(r'menu', MenuViewSet, basename='venue-menu')
venues_router.register(r'news', NewsViewSet, basename='venue-news')
venues_router.register(r'reviews', ReviewViewSet, basename='venue-reviews')
venues_router.register(r'travel_logistics', TravelLogisticsViewSet, basename='venue-travel-logistics')
venues_router.register(r'extra_services', ExtraServiceViewSet, basename='venue-extra-services')
venues_router.register(r'favorites', FavoriteVenueViewSet, basename='venue-favorites')
venues_router.register(r'orders', OrderViewSet, basename='venue-orders')
venues_router.register(r'tables_layout', TablesLayoutViewSet, basename='venue-tables-layout')

menus_router = routers.NestedDefaultRouter(
    venues_router,
    r'menu',
    lookup='menu'
)
tables_router = routers.NestedDefaultRouter(
    venues_router,
    r'tables',
    lookup='table'
)
news_router = routers.NestedDefaultRouter(
    venues_router,
    r'news',
    lookup='news'
)
menus_router.register(r'items', MenuItemViewSet, basename='venue-menu-items')
tables_router.register(r'bookings', TableBookingViewSet, basename='table-bookings')
news_router.register(r'images', NewsImageViewSet, basename='news-images')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(venues_router.urls)),
    path('', include(menus_router.urls)),
    path('', include(tables_router.urls)),
    path('', include(news_router.urls)),
    path('constants/', venue_constants, name='venue_constants'),
    path('geocode/', city_coordinates, name='city_coordinates'),
]

