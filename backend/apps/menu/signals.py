from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import MenuModel

@receiver(pre_save, sender=MenuModel)
def handle_unique_published_menu(sender, instance, **kwargs):
    if instance.is_published:
        MenuModel.objects.filter(
            venue=instance.venue,
            is_published=True
        ).exclude(pk=instance.pk).update(is_published=False)