from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from typing import Any
from rest_framework_simplejwt.tokens import AccessToken
from apps.user.models import UserModel


@database_sync_to_async
def get_user(token_string: Any):

    if not token_string or not isinstance(token_string, str):
        return None
    try:
        token_obj = AccessToken(token_string)
        user_id = token_obj['user_id']
        return UserModel.objects.get(id=user_id)
    except Exception as e:
        print(f"❌ WS Auth Error: {e}")
        return None


class AuthSocketMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        from urllib.parse import parse_qs
        query_string = scope.get('query_string', b'').decode('utf8')
        params = parse_qs(query_string)

        token_list = params.get('token', [None])
        token_str = token_list[0] if token_list else None
        scope['user'] = await get_user(token_str)

        return await super().__call__(scope, receive, send)
