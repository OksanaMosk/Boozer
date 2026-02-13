from django.urls import path, include
from rest_framework_nested import routers
from .views import NewsViewSet

router = routers.DefaultRouter()
router.register(r'news', NewsViewSet, basename='news')

urlpatterns = [
    path('', include(router.urls)),
]
