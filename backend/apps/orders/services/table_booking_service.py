from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ValidationError
from apps.venue.models import TableModel
from django.db.backends.postgresql.psycopg_any import DateTimeRange
from datetime import datetime


def create_bulk_table_bookings(*, order_id, table_ids, time_range, venue_id, user):
    from apps.orders.models import OrderModel, TableBookingModel
    order = get_object_or_404(OrderModel, id=order_id)

    if order.user != user and not user.is_staff:
        raise PermissionDenied('You cannot edit an order that does not belong to you.')

    tables = TableModel.objects.filter(id__in=table_ids, venue_id=venue_id)
    if len(tables) != len(table_ids):
        raise ValidationError({'tables': 'Some tables were not found in this venue.'})

    total_capacity = sum(t.capacity for t in tables)
    if total_capacity < order.guests_count:
        raise ValidationError(
            f'Selected tables accommodate {total_capacity} guests, but {order.guests_count} are required.'
        )

    with transaction.atomic():
        order.table_bookings.all().delete()

        created_bookings = []
        for table in tables:

            if TableBookingModel.objects.filter(
                table=table,
                time_range__overlap=time_range
            ).exclude(status__in=['EXPIRED', 'CANCELLED']).exists():
                raise ValidationError(f'Table {table.id} is already booked for the selected time.')

            booking = TableBookingModel(
                order=order,
                table=table,
                time_range=time_range,
                status='DRAFT'
            )
            booking.table_id = table.id
            booking.save()
            created_bookings.append(booking)

    return created_bookings

def apply_time_range_filter(qs, lower, upper):
    if not (lower and upper):
        return qs
    try:
        l_dt = datetime.fromisoformat(lower.replace('Z', '+00:00'))
        u_dt = datetime.fromisoformat(upper.replace('Z', '+00:00'))
        if l_dt > u_dt:
            return qs.none()
        return qs.filter(time_range__overlap=DateTimeRange(l_dt, u_dt))
    except (ValueError, TypeError):
        return qs