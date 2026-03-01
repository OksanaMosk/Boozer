from django.dispatch import receiver
from apps.news.models import NewsModel
from django.db.models.signals import pre_save


@receiver(pre_save, sender=NewsModel)
def set_default_status(sender, instance, **kwargs):
    if instance.type == NewsModel.NewsType.GENERAL:
        instance.status = NewsModel.NewsStatus.ACTIVE
    else:
        if not instance.status:
            instance.status = NewsModel.NewsStatus.PENDING