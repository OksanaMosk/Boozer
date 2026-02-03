from datetime import date

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from apps.user.managers import UserManager
from core.enums.regex_enum import phone_validator
from core.models import BaseModel


class UserModel(AbstractBaseUser, PermissionsMixin, BaseModel):
    class Meta:
        db_table = 'auth_user'
        ordering = ['-id']

    class Role(models.TextChoices):
        VISITOR = 'visitor', 'Visitor'
        VENUE_ADMIN = 'venue_admin', 'Venue_admin'
        ADMIN = 'admin', 'Administrator'

    class AuthProvider(models.TextChoices):
        EMAIL = "email", "Email"
        GOOGLE = "google", "Google"
        FACEBOOK = "facebook", "Facebook"
        APPLE = "apple", "Apple"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.VISITOR)
    auth_provider = models.CharField(max_length=20, choices=AuthProvider.choices, default=AuthProvider.EMAIL)

    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(auto_now=True)


    USERNAME_FIELD = 'email'
    objects = UserManager()

class ProfileModel(BaseModel):
    class Meta:
        db_table = 'profile'
        ordering = ['-id']

    name = models.CharField(max_length=20, blank=True)
    surname = models.CharField(max_length=20, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True, validators=[phone_validator])
    is_rules_accepted = models.BooleanField(default=False)

    is_critic = models.BooleanField(default=False)
    user = models.OneToOneField(
        UserModel,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    @property
    def age(self):
        if not self.birth_date:
            return None
        today = date.today()
        return today.year - self.birth_date.year - (
                (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
        )

    def __str__(self):
        return f'{self.name} {self.surname}'
