from django.db import models

class NewsType(models.TextChoices):
    GENERAL = 'general', 'General'
    PROMOTION = 'promotion', 'Promotion'
    EVENT = 'event', 'Event'

class NewsStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    ACTIVE = 'active', 'Active'