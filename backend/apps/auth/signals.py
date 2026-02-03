import logging
from datetime import date

from django.dispatch import receiver
from django.core.exceptions import ValidationError

from allauth.account.signals import user_logged_in
from allauth.socialaccount.signals import social_account_added
from django.utils import timezone

from rest_framework_simplejwt.tokens import RefreshToken

from apps.user.models import ProfileModel

logger = logging.getLogger(__name__)


def calculate_age(birth_date):
    today = date.today()
    return today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )


# @receiver(social_account_added)
# def create_profile_for_social_user(request, sociallogin, **kwargs):
#     user = sociallogin.user
#     logger.info(f"Social user logged in: {user.email} — profile not yet created")


# @receiver(user_logged_in)
# def generate_jwt(sender, request, user, **kwargs):
#     refresh = RefreshToken.for_user(user)
#     request.jwt = {
#         "access": str(refresh.access_token),
#         "refresh": str(refresh),
#         "user": {"id": user.id, "email": user.email}
#     }
#     logger.info(f"JWT generated for {user.email}")



@receiver(user_logged_in)
def update_last_login(sender, request, user, **kwargs):
    print("Signal received!")
    logger.info(f"User {user.username} logged in at {timezone.now()}")
    print(f"User {user.username} logged in at {timezone.now()}")
    user.last_login = timezone.now()
    user.save()
