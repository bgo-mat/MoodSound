from django.urls import path
from .views import (
    SpotifyTokenViewSet,
    SpotifyFavoritesViewSet,
    TestMoodViewSet,
    UploadAudioAPIView,
    UploadVideoAPIView
)

urlpatterns = [
    path('spotify/token/', SpotifyTokenViewSet.as_view({'post': 'create'}), name='spotify-token'),
    path('spotify/favorites/', SpotifyFavoritesViewSet.as_view({'get': 'list'}), name='spotify-favorites'),
    path('test-mood/', TestMoodViewSet.as_view({'post': 'create'}), name='test-mood'),
    path('upload-video/', UploadVideoAPIView.as_view(), name='upload-video'),
    path('upload-audio/', UploadAudioAPIView.as_view(), name='upload-audio'),
]
