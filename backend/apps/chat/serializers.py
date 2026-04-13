from rest_framework import serializers

from apps.chat.models import ChatRoomModel


class ChatRoomSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    interlocutor = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoomModel
        fields = ['name', 'last_message', 'interlocutor', 'updated_at']

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return msg.text if msg else ""

    def get_interlocutor(self, obj):
        user = self.context['request'].user
        other_user = obj.users.exclude(id=user.id).first()
        return other_user.profile.name if other_user else "Admin"