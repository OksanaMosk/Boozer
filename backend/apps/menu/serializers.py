from rest_framework import serializers
from .models import MenuModel, MenuItem

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'menu', 'name', 'description', 'price', 'currency', 'position', 'photo_menu_item']

class MenuSerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = MenuModel
        fields = ['id', 'venue', 'title', 'items']
