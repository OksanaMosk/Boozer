import os

from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.conf import settings
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
        # url =  f'http://localhost:3000/reset-password?token={token}'
        url = f"{settings.BASE_URL}/reset-password?token={token}"
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

    @classmethod
    def venue_approval(cls, venue):
        admin_name = getattr(venue.venue_admin, 'username', venue.venue_admin.email)

        context = {
            'name': admin_name,
            'venue_name': venue.name,
        }

        cls.__send_email.delay(
            to=venue.venue_admin.email,
            template_name='venue_approved.html',
            context=context,
            subject=f"Your venue '{venue.name}' is now ACTIVE - VIP Boozer"
        )

    @classmethod
    def refund_request(cls, user, order):
        display_name = (
            user.profile.name if hasattr(user, 'profile') and user.profile.name
            else user.get_full_name() or user.username or user.email
        )

        context = {
            'name': display_name,
            'email': user.email,
            'order_id': order.id,
            'total_price': order.total_price,
            'currency': order.currency,
            'admin_name': "Administrator"
        }

        cls.__send_email.delay(
            to=os.environ.get('EMAIL_HOST_USER'),
            template_name='refund_request.html',
            context=context,
            subject=f"🚨 PRIORITY: Refund Request #{order.id} - {display_name}"
        )