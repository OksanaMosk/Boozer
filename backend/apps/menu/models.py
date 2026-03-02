
from core.models import BaseModel
from django.db import models

class MenuModel(BaseModel):
    class Meta:
        db_table = 'menu'

    venue = models.ForeignKey(
        'venue.VenueModel',
        on_delete=models.CASCADE,
        related_name='menus'
    )

    title = models.CharField(max_length=255)
    is_published = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} ({self.venue.name})"

class MenuItem(BaseModel):
    class Meta:
        db_table = 'menu_items'
        ordering = ['position', 'id']
    menu = models.ForeignKey(
        MenuModel,
        on_delete=models.CASCADE,
        related_name='menu_items'
        )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    CURRENCY_CHOICES = [
        ("UAH", "Hryvnia"),
        ("USD", "US Dollar"),
        ("EUR", "Euro"),
    ]
    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default="UAH"
    )


    photo_menu_item = models.ImageField(
        upload_to='menu_items/',
        blank=True,
        null=True
        )

    position = models.PositiveIntegerField(default=0)

    CATEGORY_CHOICES = [
        ("main", "Main"),
        ("dessert", "Dessert"),
        ("drink", "Drink"),
        ("salad", "Salad"),
        ("soup", "Soup"),
    ]
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="main"
    )

    def __str__(self):
        return f"{self.name} — {self.price} {self.currency}"