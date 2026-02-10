from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet, FavoriteVenueViewSet

router = DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='reviews')
router.register(r'favorites', FavoriteVenueViewSet, basename='favorites')

urlpatterns = [
    path('', include(router.urls)),
]
#
# GET /reviews/ – всі відгуки
# GET /reviews/?venue=1 – відгуки конкретного закладу
# GET /reviews/5/ – деталі одного відгуку
# POST /reviews/ – створення відгуку (автоматично прив’язано до поточного користувача)
# PATCH /reviews/5/ – редагування власного відгуку
# DELETE /reviews/5/ – видалення власного відгуку
#
# Favorites
# GET /favorites/ – всі закладки користувачів
# GET /favorites/?user=1 – закладки конкретного користувача
# POST /favorites/ – додати заклад у фаворити (автоматично користувач = current)
# DELETE /favorites/5/ – видалити зі своїх фаворитів