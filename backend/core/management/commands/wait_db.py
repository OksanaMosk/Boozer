import time

from django.core.management.base import BaseCommand
from django.db import OperationalError, connection


class Command(BaseCommand):
    def handle(self, *args, **options):
        self.stdout.write('Waiting for database...')
        con_db = False
        while not con_db:
            try:
                connection.ensure_connection()
                con_db = True
            except OperationalError:
                self.stdout.write('Database unavailable, waiting 5 seconds...')
                time.sleep(5)
        self.stdout.write(self.style.SUCCESS('Database available!'))