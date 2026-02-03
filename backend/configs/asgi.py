"""
ASGI config for configs project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from django.urls import path

from channels.routing import ProtocolTypeRouter, URLRouter
from core.middlewares.socket_middleware import AuthSocketMiddleware

from apps.chat.consumers import ChatConsumer
from apps.chat.routing import websocket_urlpatterns as chat_routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configs.settings')

websocket_urlpatterns = [
    path('chat/<str:room>/', ChatConsumer.as_asgi()),
    *chat_routing,
]

# application = get_asgi_application()
application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthSocketMiddleware(URLRouter(websocket_urlpatterns))
})
