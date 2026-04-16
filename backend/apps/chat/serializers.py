from rest_framework import serializers
from django.core.cache import cache
from apps.chat.models import ChatRoomModel, MessageModel


class ChatRoomSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    interlocutor = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoomModel
        fields = ['name', 'last_message', 'interlocutor', 'updated_at', 'unread_count']

    def get_unread_count(self, obj):
        user = self.context['request'].user
        if user.is_anonymous:
            return 0

        cache_key = f"last_seen_{user.id}_{obj.name}"
        last_seen = cache.get(cache_key)

        if not last_seen:
            return obj.messages.exclude(user=user).count()

        return obj.messages.exclude(user=user).filter(created_at__gt=last_seen).count()

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return msg.text if msg else ""

    def get_interlocutor(self, obj):
        user = self.context['request'].user

        try:
            parts = obj.name.split('_')
            venue_id = parts[1]
            visitor_id = parts[3]
        except (IndexError, ValueError):
            return "Chat"

        if str(user.id) == str(visitor_id):
            from apps.venue.models import VenueModel
            venue = VenueModel.objects.filter(id=venue_id).first()
            return venue.name if venue else f"Venue #{venue_id}"

        else:
            from django.contrib.auth import get_user_model
            from apps.venue.models import VenueModel
            User = get_user_model()
            visitor = User.objects.filter(id=visitor_id).first()
            venue = VenueModel.objects.filter(id=venue_id).first()
            venue_name = venue.name if venue else f"#{venue_id}"
            if visitor:
                profile = getattr(visitor, 'profile', None)
                first_name = getattr(profile, 'name', '') or ''
                last_name = getattr(profile, 'surname', '') or ''
                full_name = f"{first_name} {last_name}".strip()

                display_name = full_name if full_name else visitor.email
                return f"{display_name} (re: {venue_name})"

            return "Guest"


class MessageSerializer(serializers.ModelSerializer):
    is_read = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = MessageModel
        fields = ['id', 'user_id', 'text', 'created_at', 'is_read']

    def get_is_read(self, obj):
        recipient = obj.room.users.exclude(id=obj.user.id).first()
        if not recipient:
            return False

        cache_key = f"last_seen_{recipient.id}_{obj.room.id}"
        last_seen = cache.get(cache_key)

        if not last_seen:
            return False

        return last_seen >= obj.created_at