from django.db.models import Q
from apps.chat.models import ChatRoomModel
from apps.venue.models import VenueModel


class ChatRoomService:
    @staticmethod
    def get_user_rooms(user):
        if user.is_superuser:
            return ChatRoomModel.objects.all().order_by('-updated_at')

        user_query = Q(name__endswith=f'_user_{user.id}')

        managed_venue_ids = VenueModel.objects.filter(venue_admin=user).values_list('id', flat=True)

        venue_query = Q()
        for v_id in managed_venue_ids:
            venue_query |= Q(name__startswith=f'venue_{v_id}_')

        return ChatRoomModel.objects.filter(user_query | venue_query).distinct().order_by('-updated_at')
