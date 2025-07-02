from django.urls import path
from . import views

urlpatterns = [
    path('spotify/token/', views.spotify_token, name='spotify-token'),
    path('spotify/favorites/', views.spotify_favorites, name='spotify-favorites'),
]
