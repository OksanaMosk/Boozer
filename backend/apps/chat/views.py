from rest_framework import viewsets, permissions

from .serializers import ChatRoomSerializer
from .services.service import ChatRoomService


class ChatRoomViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_anonymous:
            return self.serializer_class.Meta.model.objects.none()
        return ChatRoomService.get_user_rooms(self.request.user)

