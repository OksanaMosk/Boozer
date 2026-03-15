from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.orders.models import OrderItemModel, OrderModel
from apps.orders.services.order_service import calculate_total
from core.services.email_service import EmailService
from django.db import transaction

@receiver([post_save, post_delete], sender=OrderItemModel)
def recalc_order_total(sender, instance, **kwargs):
    calculate_total(instance.order)

@receiver(post_save, sender=OrderModel)
def send_order_confirmed_email_signal(sender, instance, created, **kwargs):
    if instance.status == 'CONFIRMED':
        transaction.on_commit(
            lambda: EmailService.order_confirmation(instance.user, instance)
        )