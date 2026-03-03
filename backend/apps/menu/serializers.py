from rest_framework import serializers
from .models import MenuModel, MenuItemModel

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItemModel
        fields = ['id', 'menu', 'name', 'description', 'price', 'currency', 'position', 'photo_menu_item', 'category']

        extra_kwargs = {
            'currency': {'read_only': True}
        }


class MenuSerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True, source='menu_items')

    class Meta:
        model = MenuModel
        fields = ['id', 'venue', 'title', 'items', 'is_published']

        extra_kwargs = {
            'venue': {'read_only': True}
        }
