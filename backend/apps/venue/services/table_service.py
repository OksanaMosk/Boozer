from apps.venue.models import TableModel

def get_available_tables_by_time(venue_pk, start_dt, end_dt):
    return TableModel.objects.filter(
        venue_id=venue_pk,
        is_active=True
    ).exclude(
        bookings__time_range__overlap=(start_dt, end_dt),
        bookings__is_active=True
    )