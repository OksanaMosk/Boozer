import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configs.settings')

app = Celery('settings')
app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks(['core.services', 'apps.orders'])

app.conf.beat_schedule = {
    'expire-orders-every-minute': {
        'task': 'core.services.tasks.expire_orders_task',
        'schedule': crontab(minute='*/1'),
    },
    'update-exchange-rates-daily': {
        'task': 'core.services.tasks.update_exchange_rate',
        'schedule': crontab(hour=9, minute=0),
    },
}