import requests
import urllib.parse
from django.conf import settings
import json
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt

client_id = settings.SPOTIFY_CLIENT_ID
client_secret = settings.SPOTIFY_CLIENT_SECRET

@csrf_exempt
def spotify_token(request):
    """Exchange authorization code for Spotify tokens."""
    if request.method != "POST":
        return HttpResponse(status=405)

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "invalid json"}, status=400)

    code = data.get("code")
    if not code:
        return JsonResponse({"error": "missing code"}, status=400)

    redirect_uri = "exp://10.109.255.231:8081/callback"
    token_url = "https://accounts.spotify.com/api/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "client_secret": client_secret,
    }
    r = requests.post(token_url, data=data)
    if r.status_code != 200:
        return JsonResponse({"error": "token request failed", "details": r.text}, status=400)

    return JsonResponse(r.json())


@csrf_exempt
def spotify_favorites(request):
    """Return user's liked tracks from Spotify."""
    token = request.headers.get("Authorization")
    if not token:
        return JsonResponse({"error": "missing authorization"}, status=400)

    if token.lower().startswith("bearer "):
        token = token[7:]

    url = "https://api.spotify.com/v1/me/playlists"
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        print('error', r.text, flush=True)
        return JsonResponse({"error": "spotify request failed", "details": r.text}, status=r.status_code)

    print(r.json(), flush=True)
    return JsonResponse(r.json())
