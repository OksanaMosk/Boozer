from django.core.mail import send_mail


def get_user_venue(user, user_id):
    from apps.venue.models import VenueModel
    if user.role in ['admin']:
        return VenueModel.objects.filter(venue_admin__id=user_id)
    if user.role == 'venue_admin' and user.id == user_id:
        return VenueModel.objects.filter(venue_admin__id=user_id)
    return VenueModel.objects.none()

def notify_admin(venue):
    send_mail(
        subject='Venue listing needs attention',
        message=f'The Venue listing with ID {venue.id} has failed the profanity check 3 times.',
        from_email='no-reply@platform.com',
        recipient_list=['manager@example.com']
    )