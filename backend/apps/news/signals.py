from django.dispatch import receiver
from apps.news.models import NewsModel, NewsImageModel
from django.db.models.signals import pre_save

from core.constants.news import NewsType, NewsStatus


@receiver(pre_save, sender=NewsModel)
def set_default_status(sender, instance, **kwargs):
    if instance.type == NewsType.GENERAL:
        instance.status = NewsStatus.ACTIVE
    else:
        if not instance.status:
            instance.status = NewsStatus.PENDING


@receiver(pre_save, sender=NewsImageModel)
def handle_unique_news_cover(sender, instance, **kwargs):
    if instance.is_cover:
        NewsImageModel.objects.filter(
            news=instance.news,
            is_cover=True
        ).exclude(pk=instance.pk).update(is_cover=False)