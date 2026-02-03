import datetime

from django.contrib.auth import get_user_model
from django.db.models import Q

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


class ChatConsumer(GenericAsyncAPIConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room = None
        self.user_name = None

    async def connect(self):
        if not self.scope['user']:
            return await self.close()

        await self.accept()
        room_name = self.scope['url_route']['kwargs']['room']
        self.room, _ = await ChatRoomModel.objects.aget_or_create(name=room_name)
        self.user_name = await get_profile_name(self.scope['user'])

        await self.channel_layer.group_add(
            f'user_{self.scope["user"].id}',
            self.channel_name
        )

        await self.channel_layer.group_add(
            self.room.name,
            self.channel_name
        )

        messages = await self.get_last_five_messages()

        for name, text, recipient_id, recipient_name in messages:
            await self.sender(
                {
                    'message': text,
                    'user': f'{name}',
                    'request_id': str(datetime.datetime.now()),
                    'to': {
                        'id': recipient_id,
                        'name': recipient_name
                    }
                    if recipient_id
                    else None
                }
            )

        await self.channel_layer.group_send(
            self.room.name,
            {
                'type': 'sender',
                'message': f"{self.scope['user'].id}_{self.user_name} connected to {room_name}"
            }
        )

    async def sender(self, data):
        await self.send_json(data)

    @action()
    async def send_message(self, data, request_id, **kwargs):

        await MessageModel.objects.acreate(
            room=self.room,
            user=self.scope['user'],
            text=data['text']
        )
        await self.channel_layer.group_send(
            self.room.name,
            {
                'type': 'sender',
                'message': data['text'],
                'user': self.user_name,
                'id': request_id
            }
        )

    @action()
    async def send_private_message(self, data, request_id, **kwargs):
        recipient = await UserModel.objects.aget(pk=data['userId'])

        private_room_name = (
            f"private_{min(self.scope['user'].id, recipient.id)}_"
            f"{max(self.scope['user'].id, recipient.id)}"
        )
        private_room, _ = await ChatRoomModel.objects.aget_or_create(
            name=private_room_name,
            is_private=True
        )

        await private_room.users.aadd(self.scope['user'], recipient)

        other_users = await database_sync_to_async(list)(
            private_room.users.exclude(id=self.scope["user"].id)
        )
        recipient_user = other_users[0] if other_users else None
        recipient_name = await get_profile_name(recipient_user) if recipient_user else 'Unknown'

        await MessageModel.objects.acreate(
            room=private_room,
            user=self.scope['user'],
            text=data['text']
        )

        recipient_info = {
            "id": recipient.id,
            "name": recipient_name
        }
        await self.channel_layer.group_send(
            f'user_{recipient.id}',
            {
                'type': 'sender',
                "message": data['text'],
                'user': self.user_name,
                'id': request_id,
                'to': {
                    'id': self.scope['user'].id,
                    'name': self.user_name
                }
            }
        )

        await self.sender(
            {
                'message': f"Private to {recipient_info['name']}: {data['text']}",
                'user': self.user_name,
                'id': request_id,
                'to': recipient_info
            }
        )

    @database_sync_to_async
    def get_last_five_messages(self):
        messages = MessageModel.objects.filter(
            Q(room=self.room) | (Q(room__is_private=True) & Q(room__users=self.scope['user']))
        ).order_by('-id')[:5]

        result = []

        for msg in reversed(messages):
            user_name = getattr(msg.user.profile, 'name', 'Admin') if hasattr(msg.user, 'profile') else 'Admin'
            user_id = msg.user.id
            recipient_id = None
            recipient_name = None

            if msg.room.is_private:
                other_users = msg.room.users.exclude(id=msg.user.id)
                if other_users.exists():
                    other = other_users.first()
                    recipient_id = other.id
                    recipient_name = getattr(other.profile, 'name', 'Admin') if hasattr(other, 'profile') else 'Admin'

            result.append((
                f"{user_id}_{user_name}",
                msg.text,
                recipient_id,
                recipient_name
            ))

        return result