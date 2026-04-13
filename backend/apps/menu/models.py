from core.constants.category import CATEGORY_CHOICES
from core.constants.currencies import CURRENCY_CHOICES
from core.models import BaseModel
from django.db import models
from django.core.validators import MinValueValidator

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

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.venue.name})"

class MenuItemModel(BaseModel):
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

    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0, message="Price cannot be negative.")])

    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default='UAH',
        editable=False
    )


    photo_menu_item = models.ImageField(
        upload_to='menu_items/',
        blank=True,
        null=True
        )

    position = models.PositiveIntegerField(default=0)

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='mains'
    )

    def save(self, *args, **kwargs):
        self.currency = self.menu.venue.currency
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} — {self.price} {self.currency}'