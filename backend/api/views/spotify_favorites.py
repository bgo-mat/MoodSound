import requests
from rest_framework import viewsets, status, serializers
from rest_framework.response import Response


class DummySerializer(serializers.Serializer):
    pass


class SpotifyFavoritesViewSet(viewsets.ModelViewSet):
    """Return user's liked tracks from Spotify."""

    serializer_class = DummySerializer
    queryset = []
    http_method_names = ["get"]

    def list(self, request, *args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return Response({"error": "missing authorization"}, status=400)
        if token.lower().startswith("bearer "):
            token = token[7:]

        url = "https://api.spotify.com/v1/me/tracks"
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(url, headers=headers)
        if r.status_code != 200:
            return Response(
                {"error": "spotify request failed", "details": r.text},
                status=r.status_code,
            )
        return Response(r.json())
