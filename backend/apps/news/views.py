from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import NewsModel
from .serializers import NewsSerializer
from ..user.permissions import IsAdmin, IsVenueAdminOrReadOnly

class NewsViewSet(viewsets.ModelViewSet):
    queryset = NewsModel.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [IsAdmin | IsVenueAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['venue']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        venue_pk = self.kwargs.get('venue_pk')
        if venue_pk:
            return NewsModel.objects.filter(venue_id=venue_pk)
        return NewsModel.objects.all()

    def perform_create(self, serializer):
        venue_pk = self.kwargs.get('venue_pk')
        if venue_pk:
            serializer.save(venue_id=venue_pk)
        else:
            serializer.save()