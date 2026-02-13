from django.urls import path, include
from rest_framework_nested import routers
from .views import MenuViewSet, MenuItemViewSet

router = routers.DefaultRouter()
router.register(r'menus', MenuViewSet, basename='menu')

menus_router = routers.NestedDefaultRouter(router, r'menus', lookup='menu')
menus_router.register(r'items', MenuItemViewSet, basename='menu-items')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(menus_router.urls)),
]
