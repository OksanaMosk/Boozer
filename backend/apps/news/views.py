from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import NewsModel, NewsImageModel
from .serializers import NewsSerializer, NewsImageSerializer
from .services.news_service import NewsService
from ..user.permissions import IsAdminOrVenueAdminOrReadOnly
from django.shortcuts import get_object_or_404

from ..venue.models import VenueModel


class NewsViewSet(viewsets.ModelViewSet):
    serializer_class = NewsSerializer
    permission_classes = [IsAdminOrVenueAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['venue', 'status', 'type', 'is_pinned']
    search_fields = ['title', 'content']
    ordering_fields = [ 'created_at', 'title']
    ordering = ['-is_pinned', '-created_at']

    def get_queryset(self):
        return NewsService.get_news_for_user(
            self.request.user,
            self.kwargs.get('venue_pk')
        )

    def perform_create(self, serializer):
        venue_pk = self.kwargs.get('venue_pk')
        venue = get_object_or_404(VenueModel, id=venue_pk)
        self.check_object_permissions(self.request, venue)

        status = NewsService.determine_initial_status(
            serializer.validated_data.get('type')
        )

        serializer.save(venue_id=venue_pk, status=status)

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
