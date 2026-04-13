from rest_framework import viewsets, permissions

from .serializers import ChatRoomSerializer

class ChatRoomViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        return self.request.user.chat_rooms.all().order_by('-updated_at')
