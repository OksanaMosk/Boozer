import datetime

from django.contrib.auth import get_user_model

from channels.db import database_sync_to_async
from djangochannelsrestframework.decorators import action
from djangochannelsrestframework.generics import GenericAsyncAPIConsumer

from apps.chat.models import ChatRoomModel, MessageModel

UserModel = get_user_model()


@database_sync_to_async
def get_profile_name(user):
    if hasattr(user, 'profile') and user.profile:
        return user.profile.name
    return 'Admin'


@database_sync_to_async
def get_room_messages(room):
    messages = list(MessageModel.objects.filter(room=room).order_by('-created_at')[:5])

    result = []
    for msg in reversed(messages):
        u_name = getattr(msg.user.profile, 'name', 'Admin') if hasattr(msg.user, 'profile') else 'Admin'
        recipient_info = None

        if msg.room.is_private:
            other = msg.room.users.exclude(id=msg.user.id).first()
            if other:
                recipient_info = {
                    'id': other.id,
                    'name': getattr(other.profile, 'name', 'Admin') if hasattr(other, 'profile') else 'Admin'
                }

        result.append({
            'user': f"{msg.user.id}_{u_name}",
            'message': msg.text,
            'to': recipient_info
        })
    return result


class ChatConsumer(GenericAsyncAPIConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room = None
        self.user_name = None

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

        messages = await database_sync_to_async(self.get_last_five_messages)()

        if messages:
            for msg in messages:
                await self.send_json({
                    'message': msg['message'],
                    'user': msg['user'],
                    'request_id': str(datetime.datetime.now()),
                    'to': msg['to']
                })

    async def sender(self, data):
        await self.send_json(data)

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
                'id': request_id
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
            'to': {'id': r_id, 'name': r_name}
        }

        await self.channel_layer.group_send(f'user_{r_id}', payload)
        await self.channel_layer.group_send(f'user_{p_user_id}', payload)

    @database_sync_to_async
    def get_last_five_messages(self):
        qs = MessageModel.objects.filter(room=self.room).order_by('-created_at')[:5]
        messages = list(qs)

        result = []
        for msg in reversed(messages):
            u_name = getattr(msg.user.profile, 'name', 'Admin') if hasattr(msg.user, 'profile') else 'Admin'
            recipient_info = None
            if msg.room.is_private:
                other = msg.room.users.exclude(id=msg.user.id).first()
                if other:
                    recipient_info = {
                        'id': other.id,
                        'name': getattr(other.profile, 'name', 'Admin') if hasattr(other, 'profile') else 'Admin'
                    }
            result.append({
                'user': f"{msg.user.id}_{u_name}",
                'message': msg.text,
                'to': recipient_info
            })
        return result
