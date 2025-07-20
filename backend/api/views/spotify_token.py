import requests
from django.conf import settings
from rest_framework import viewsets, status, serializers
from rest_framework.response import Response


class DummySerializer(serializers.Serializer):
    pass


class SpotifyTokenViewSet(viewsets.ModelViewSet):
    """Exchange authorization code for Spotify tokens."""

    serializer_class = DummySerializer
    queryset = []
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        data = request.data
        code = data.get("code")
        if not code:
            return Response({"error": "missing code"}, status=400)

        token_url = "https://accounts.spotify.com/api/token"
        redirect_uri = settings.SPOTIFY_REDIRECT_URI
        payload = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": settings.SPOTIFY_CLIENT_ID,
            "redirect_uri": redirect_uri,
            "client_secret": settings.SPOTIFY_CLIENT_SECRET,
        }
        r = requests.post(token_url, data=payload)
        if r.status_code != 200:
            return Response(
                {"error": "token request failed", "details": r.text}, status=400
            )

        return Response(r.json())
