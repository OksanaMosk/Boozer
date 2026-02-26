from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path



# from drf_yasg import openapi
# from drf_yasg.views import get_schema_view


def home(request):
    return HttpResponse('Welcome to the home page!')
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home),
    path('api/auth/', include('apps.auth.urls')),
    path('api/users/', include('apps.user.urls')),
    path('api/', include('apps.venue.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/reviews-feedback/', include('apps.reviews_feedback.urls')),
    path('api/news/', include('apps.news.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)