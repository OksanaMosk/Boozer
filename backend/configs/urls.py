from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path

from apps.orders.views import ExchangeRateView


from rest_framework.permissions import AllowAny

from drf_yasg import openapi
from drf_yasg.views import get_schema_view


schema_view = get_schema_view(
    openapi.Info(
        title="VIP Boozer API",
        default_version='v1',
    ),
    public=True,
    permission_classes=[AllowAny],
)


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
    path('api/rooms/', include('apps.chat.urls')),
    path('api/exchange-rates/', ExchangeRateView.as_view(), name='exchange_rates'),
    path('api/doc/', schema_view.with_ui('swagger', cache_timeout=0), name='schema_swagger'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)