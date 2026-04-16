import datetime

from django.contrib.auth import get_user_model
from django.utils import timezone
from channels.db import database_sync_to_async
from djangochannelsrestframework.decorators import action
from djangochannelsrestframework.generics import GenericAsyncAPIConsumer
from django.core.cache import cache
from apps.chat.models import ChatRoomModel, MessageModel

UserModel = get_user_model()


@database_sync_to_async
def get_profile_name(user):
    if hasattr(user, 'profile') and user.profile:
        return user.profile.name
    return 'Admin'

@database_sync_to_async
def get_room_messages(room):
    from django.core.cache import cache
    messages = list(MessageModel.objects.filter(room=room).order_by('-created_at')[:5])

    result = []
    for msg in reversed(messages):
        u_name = getattr(msg.user.profile, 'name', 'Admin') if hasattr(msg.user, 'profile') else 'Admin'
        recipient = msg.room.users.exclude(id=msg.user.id).first()
        is_read = False
        if recipient:
            cache_key = f"last_seen_{recipient.id}_{msg.room.name}"
            last_seen = cache.get(cache_key)

            if last_seen and last_seen >= msg.created_at:
                is_read = True

        recipient_info = None

        if msg.room.is_private and recipient:
            recipient_info = {
                'id': recipient.id,
                'name': getattr(recipient.profile, 'name', 'Admin') if hasattr(recipient, 'profile') else 'Admin'
            }

        result.append({
            'user': f"{msg.user.id}_{u_name}",
            'message': msg.text,
            'is_read': is_read,
            'created_at': str(msg.created_at),
            'to': recipient_info
        })
    return result


class ChatConsumer(GenericAsyncAPIConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room = None
        self.user_name = None

    @database_sync_to_async
    def update_last_seen(self):
        cache_key = f"last_seen_{self.scope['user'].id}_{self.room.name}"
        now = timezone.now()
        cache.set(cache_key, timezone.now(), timeout=None)
        print(f"--- [CACHE SET] User: {self.scope['user'].id} | Room: {self.room.name} | Time: {now} ---")
    async def connect(self):
        if not self.scope['user'] or self.scope['user'].is_anonymous:
            await self.close()
            return

        await self.accept()
        room_name = self.scope['url_route']['kwargs']['room']

        self.room, _ = await ChatRoomModel.objects.aget_or_create(name=room_name)
        self.user_name = await get_profile_name(self.scope['user'])

        await self.channel_layer.group_add(f'user_{self.scope["user"].id}', self.channel_name)
        await self.channel_layer.group_add(self.room.name, self.channel_name)
        await self.update_last_seen()

        await self.channel_layer.group_send(
            self.room.name,
            {
                'type': 'read_receipt_handler',
                'user_id': self.scope['user'].id
            }
        )

        messages = await self.get_last_twenty_messages()

        if messages:
            for msg in messages:
                print(f"--- [WS SEND] Msg: {msg['message'][:15]} | is_read: {msg.get('is_read')} ---")

                await self.send_json({
                    'message': msg['message'],
                    'user': msg['user'],
                    'is_read': msg.get('is_read'),
                    'request_id': str(datetime.datetime.now()),
                    'to': msg['to']
                })

    async def sender(self, data):
        await self.send_json(data)

    async def read_receipt_handler(self, event):

        await self.send_json({
            'type': 'messages_read',
            'reader_id': event['user_id']
        })

    @action()
    async def mark_as_read_event(self, data, request_id, **kwargs):
        await self.update_last_seen()

        await self.channel_layer.group_send(
            self.room.name,
            {
                'type': 'read_receipt_handler',
                'user_id': self.scope['user'].id
            }
        )

    @action()
    async def send_chat_message(self, data, request_id, **kwargs):
        room_name = data.get('roomName')
        if not room_name:
            venue_id = data.get('venueId')
            room_name = f"venue_{venue_id}_user_{self.scope['user'].id}"

        room, _ = await ChatRoomModel.objects.aget_or_create(name=room_name)
        await database_sync_to_async(room.users.add)(self.scope['user'])

        message = await MessageModel.objects.acreate(
            room=room,
            user=self.scope['user'],
            text=data['text']
        )

        await self.channel_layer.group_send(
            room.name,
            {
                'type': 'sender',
                'message': message.text,
                'user': f"{self.scope['user'].id}_{self.user_name}",
                'id': request_id,
                'room': room.name,
                'is_read': False
            }
        )

    @action()
    async def send_message_to_venue(self, data, request_id, **kwargs):
        venue_id = data['venueId']
        visitor_id = self.scope['user'].id
        room_name = f"venue_{venue_id}_user_{visitor_id}"

        room, _ = await ChatRoomModel.objects.aget_or_create(
            name=room_name,
            is_private=False
        )
        await database_sync_to_async(room.users.add)(self.scope['user'])
        message = await MessageModel.objects.acreate(
            room=room,
            user=self.scope['user'],
            text=data['text']
        )

        await self.channel_layer.group_send(
            room.name,
            {
                'type': 'sender',
                'message': message.text,
                'user': f"{visitor_id}_{self.user_name}",
                'id': request_id,
                'is_read': False
            }
        )

    @action()
    async def send_private_message(self, data, request_id, **kwargs):
        recipient = await UserModel.objects.aget(pk=data['userId'])
        p_user_id = self.scope['user'].id
        r_id = recipient.id

        private_room_name = f"private_{min(p_user_id, r_id)}_{max(p_user_id, r_id)}"
        private_room, _ = await ChatRoomModel.objects.aget_or_create(name=private_room_name, is_private=True)
        await database_sync_to_async(private_room.users.add)(self.scope['user'], recipient)

        msg = await MessageModel.objects.acreate(room=private_room, user=self.scope['user'], text=data['text'])
        r_name = await get_profile_name(recipient)

        payload = {
            'type': 'sender',
            "message": data['text'],
            'user': f"{p_user_id}_{self.user_name}",
            'id': request_id,
            'room': private_room_name,
            'created_at': str(msg.created_at),
            'is_read': False,
            'to': {'id': r_id, 'name': r_name}
        }

        await self.channel_layer.group_send(f'user_{r_id}', payload)
        await self.channel_layer.group_send(f'user_{p_user_id}', payload)

    @database_sync_to_async
    def get_last_twenty_messages(self):
        from django.core.cache import cache
        qs = MessageModel.objects.filter(room=self.room) \
            .select_related('user__profile', 'room') \
            .prefetch_related('room__users__profile') \
            .order_by('-created_at')[:20]

        messages = list(qs)
        result = []
        for msg in reversed(messages):
            u_name = getattr(msg.user.profile, 'name', 'Admin') if hasattr(msg.user, 'profile') else 'Admin'

            recipient = msg.room.users.exclude(id=msg.user.id).first()
            is_read = False
            if recipient:
                cache_key = f"last_seen_{recipient.id}_{msg.room.name}"
                last_seen = cache.get(cache_key)

                if last_seen and last_seen >= msg.created_at:
                    is_read = True

            recipient_info = None
            if msg.room.is_private and recipient:
                recipient_info = {
                    'id': recipient.id,
                    'name': getattr(recipient.profile, 'name', 'Admin') if hasattr(recipient, 'profile') else 'Admin'
                }

            result.append({
                'user': f"{msg.user.id}_{u_name}",
                'message': msg.text,
                'is_read': is_read,
                'to': recipient_info
            })
        return result

    @action()
    async def typing_event(self, data, request_id, **kwargs):
        await self.channel_layer.group_send(
            self.room.name,
            {
                'type': 'user_typing_handler',
                'user_id': self.scope['user'].id,
                'is_typing': data.get('is_typing', True)
            }
        )

    async def user_typing_handler(self, event):
        await self.send_json({
            'type': 'typing_status',
            'user_id': event['user_id'],
            'is_typing': event['is_typing']
        })
