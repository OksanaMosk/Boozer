from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import NewsModel, NewsImageModel
from .serializers import NewsSerializer, NewsImageSerializer
from ..user.permissions import IsAdminOrVenueAdminOrReadOnly
from django.shortcuts import get_object_or_404


class NewsViewSet(viewsets.ModelViewSet):
    serializer_class = NewsSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['venue', 'status', 'type', 'is_pinned']
    search_fields = ['title', 'content']
    ordering_fields = [ 'created_at', 'title']
    ordering = ['-created_at', '-is_pinned']

    def get_queryset(self):
        venue_pk = self.kwargs.get('venue_pk')
        qs = NewsModel.objects.all().prefetch_related('images')
        if venue_pk:
            qs = qs.filter(venue_id=venue_pk)
        user = self.request.user

        if not user.is_superuser and not getattr(user, 'is_venue_admin', False):
            qs = qs.filter(status='active')

        return qs

    def perform_create(self, serializer):
        venue_pk = self.kwargs.get('venue_pk')
        from apps.venue.models import VenueModel
        venue = get_object_or_404(VenueModel, id=venue_pk)
        self.check_object_permissions(self.request, venue)
        news_type = serializer.validated_data.get('type')
        status = 'active' if news_type == 'general' else 'pending'

        if venue_pk:
            serializer.save(venue_id=venue_pk, status=status)
        else:
            serializer.save(status=status)

    def get_permissions(self):
        return [perm() for perm in self.permission_classes]



class NewsImageViewSet(viewsets.ModelViewSet):
    serializer_class = NewsImageSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]

    def get_queryset(self):
        news_pk = self.kwargs.get('news_pk')
        qs = NewsImageModel.objects.all()
        if news_pk:
            qs = qs.filter(news_id=news_pk)
        return qs

    def perform_create(self, serializer):
        news_pk = self.kwargs.get('news_pk')
        news = get_object_or_404(NewsModel, id=news_pk)
        self.check_object_permissions(self.request, news)
        serializer.save(news_id=news_pk)