import logging
from datetime import date

from django.dispatch import receiver

# from allauth.account.signals import user_logged_in
from django.utils import timezone

logger = logging.getLogger(__name__)


def calculate_age(birth_date):
    today = date.today()
    return today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )

# @receiver(user_logged_in)
# def update_last_login(sender, request, user, **kwargs):
#     print("Signal received!")
#     logger.info(f"User {user.username} logged in at {timezone.now()}")
#     print(f"User {user.username} logged in at {timezone.now()}")
#     user.last_login = timezone.now()
#     user.save()
