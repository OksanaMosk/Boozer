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
    if instance.status == 'CONFIRMED' and instance.user_id:
        if not getattr(instance, '_email_sent', False):
            instance._email_sent = True
            user_to_notify = instance.user
            order_instance = instance

            def send_safe():
                try:
                    if OrderModel.objects.filter(pk=order_instance.pk).exists():
                        EmailService.order_confirmation(user_to_notify, order_instance)
                except Exception:
                    pass
            transaction.on_commit(send_safe)


# @receiver(post_save, sender=OrderModel)
# def send_order_confirmed_email_signal(sender, instance, created, **kwargs):
#     if instance.status == 'CONFIRMED' and instance.user:
#         if not getattr(instance, '_email_sent', False):
#             instance._email_sent = True
#             user_to_notify = instance.user
#
#             def send_safe():
#                 try:
#                     EmailService.order_confirmation(user_to_notify, instance)
#                 except Exception:
#                     pass
#             transaction.on_commit(send_safe)

