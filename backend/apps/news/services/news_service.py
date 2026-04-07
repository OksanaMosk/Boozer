from apps.news.models import NewsModel


class NewsService:
    @staticmethod
    def get_news_for_user(user, venue_id=None):
        qs = NewsModel.objects.prefetch_related('images')

        if venue_id:
            qs = qs.filter(venue_id=venue_id)

        role = getattr(user, 'role', '').upper()
        if user.is_superuser or role == 'ADMIN':
            return qs

        if role == 'VENUE_ADMIN':
            from apps.venue.models import VenueModel
            is_owner = VenueModel.objects.filter(id=venue_id, venue_admin=user).exists()

            if is_owner:
                return qs

        return qs.filter(status='active')

    @staticmethod
    def determine_initial_status(news_type):
        return 'active' if news_type == 'general' else 'pending'