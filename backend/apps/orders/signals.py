from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.orders.models import OrderItemModel
from apps.orders.services.order_service import calculate_total

@receiver([post_save, post_delete], sender=OrderItemModel)
def recalc_order_total(sender, instance, **kwargs):
    calculate_total(instance.order)