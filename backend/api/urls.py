from django.urls import path
from . import views

urlpatterns = [
    path('spotify/login/', views.spotify_login, name='spotify-login'),
    path('spotify/callback/', views.spotify_callback, name='spotify-callback'),
    path('spotify/token/', views.spotify_token, name='spotify-token'),
    path('spotify/favorites/', views.spotify_favorites, name='spotify-favorites'),
]
