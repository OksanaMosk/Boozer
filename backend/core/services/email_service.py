import os

from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template

from configs.celery import app
from core.services.jwt_service import ActivateToken, JWTService, RecoveryToken

UserModel = get_user_model()


class EmailService:
    @staticmethod
    @app.task
    def __send_email(to:str,template_name:str,context:dict,subject:str)-> None:
        template = get_template(template_name)

        html_content = template.render(context)
        msg = EmailMultiAlternatives(
            subject=subject,
            from_email=os.environ.get('EMAIL_HOST_USER'),
            to=[to],
        )
        msg.attach_alternative(html_content, 'text/html')
        msg.send()

    @classmethod
    def register(cls, user):
        token=JWTService.create_token(user,ActivateToken)
        url = f'http://localhost:8888/api/auth/activate/{token}/'
        cls.__send_email.delay(
            to=user.email,
            template_name='register.html',
            context={'name':user.profile.name, 'url':url},
            subject='Register'
        )
    @classmethod
    def recovery(cls, user):
        token=JWTService.create_token(user, RecoveryToken)
        url =  f'http://localhost:3000/reset-password?token={token}'
        cls.__send_email.delay(
            to=user.email,
            template_name='recovery.html',
            context={'url': url},
            subject='Recovery'
        )

    @classmethod
    def order_confirmation(cls, user, order):
        context = {
            'name': user.profile.name,
            'order_id': order.id,
            'total_price': order.total_price,
            'currency': order.currency
        }

        cls.__send_email.delay(
            to=user.email,
            template_name='confirm_order.html',
            context=context,
            subject=f'Order #{order.id} Confirmed - VIP Boozer'
        )