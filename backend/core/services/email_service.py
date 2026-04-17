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
        admin_name = f"{getattr(venue.venue_admin.profile, 'name', '')} {getattr(venue.venue_admin.profile, 'surname', '')}".strip() or venue.venue_admin.email
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
        p = getattr(user, 'profile', None)
        display_name = f"{getattr(p, 'name', '')} {getattr(p, 'surname', '')}".strip() if p else ""
        if not display_name:
            display_name = getattr(user, 'username', user.email if user.email else f"User#{user.id}")

        context = {
            'name': display_name,
            'email': user.email or "no-email@provided.com",
            'order_id': order.id,
            'total_price': order.total_price,
            'currency': order.currency,
        }

        admin_email = os.environ.get('EMAIL_HOST_USER')

        if admin_email:
            cls.__send_email.delay(
                to=admin_email,
                template_name='refund_request.html',
                context=context,
                subject=f"🚨 REFUND REQUEST #{order.id} - {display_name}"
            )
        else:
            print(f"CRITICAL: Email not sent. EMAIL_HOST_USER is not set in ENV.")

    @classmethod
    def send_profanity_notification(cls, venue):
        if venue.venue_admin and venue.venue_admin.email:
            cls.__send_email.delay(
                to=venue.venue_admin.email,
                template_name='venue_blocked_profanity.html',
                context={
                    'name': f"{getattr(venue.venue_admin.profile, 'name', '')} {getattr(venue.venue_admin.profile, 'surname', '')}".strip() or venue.venue_admin.email,
                    'venue_name': venue.name,
                    'frontend_url': f"{settings.BASE_URL}/dashboard?tab=venues_control"
                },
                subject=f"Your listing '{venue.name}' has been blocked"
            )