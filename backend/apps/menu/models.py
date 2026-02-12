
from core.models import BaseModel
from django.db import models

class MenuModel(BaseModel):
    class Meta:
        db_table = 'menu'

    venue = models.ForeignKey(
        'venue.VenueModel',
        on_delete=models.CASCADE,
        related_name='menus',
        default=1
    )

    title = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.title} ({self.venue.name})"

class MenuItem(BaseModel):
    class Meta:
        db_table = 'menu_items'
        ordering = ['position', 'id']
    menu = models.ForeignKey(
        MenuModel,
        on_delete=models.CASCADE,
        related_name='menu_items',
        default=1
        )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='UAH')

    photo_menu_item = models.ImageField(
        upload_to='menu_items/',
        blank=True,
        null=True
        )

    position = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} — {self.price} {self.currency}"