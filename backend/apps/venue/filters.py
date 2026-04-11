import django_filters

class VenueFilter(django_filters.FilterSet):
    min_check = django_filters.NumberFilter(field_name="converted_check", lookup_expr='gte')
    max_check = django_filters.NumberFilter(field_name="converted_check", lookup_expr='lte')

    rating_min = django_filters.NumberFilter(field_name="rating", lookup_expr='gte')
    rating_max = django_filters.NumberFilter(field_name="rating", lookup_expr='lte')

    class Meta:
        from apps.venue.models import VenueModel
        model = VenueModel
        fields = ['country', 'city']