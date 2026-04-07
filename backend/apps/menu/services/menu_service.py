from django.db import transaction

from apps.menu.models import MenuModel, MenuItemModel
from apps.venue.models import VenueModel


class MenuService:
    @staticmethod
    def get_menus_for_user(user, venue_id):
        base_qs = MenuModel.objects.filter(venue_id=venue_id)

        if not user.is_authenticated:
            return base_qs.filter(is_published=True)

        role = getattr(user, 'role', '').upper()

        if user.is_superuser or role == 'ADMIN':
            return base_qs

        if role == 'VENUE_ADMIN':
            is_owner = VenueModel.objects.filter(id=venue_id, venue_admin=user).exists()
            if is_owner:
                return base_qs

        return base_qs.filter(is_published=True)


class MenuItemService:
    @staticmethod
    def reorder_items(venue_pk, menu_pk, items_data):
        """Атомарне оновлення позицій та категорій страв."""
        with transaction.atomic():
            for item in items_data:
                item_id = item.get('id')
                position = item.get('position')

                if item_id is None or position is None:
                    continue

                update_params = {'position': position}
                if 'category' in item:
                    update_params['category'] = item['category']

                MenuItemModel.objects.filter(
                    id=item_id,
                    menu_id=menu_pk,
                    menu__venue_id=venue_pk
                ).update(**update_params)
