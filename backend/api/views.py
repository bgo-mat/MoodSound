import requests
import urllib.parse
from django.conf import settings
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

client_id = settings.SPOTIFY_CLIENT_ID
client_secret = settings.SPOTIFY_CLIENT_SECRET
def spotify_login(request):
    """Redirect user to Spotify authorization page."""
    scopes = "user-read-email playlist-read-private"
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
        "scope": scopes,
    }
    url = "https://accounts.spotify.com/authorize?" + urllib.parse.urlencode(params)
    return HttpResponseRedirect(url)


@csrf_exempt
def spotify_callback(request):
    """Exchange the authorization code for an access token and redirect to front."""
    code = request.GET.get("code")
    if not code:
        return JsonResponse({"error": "missing code"}, status=400)

    token_url = "https://accounts.spotify.com/api/token"
    redirect_uri = settings.SPOTIFY_REDIRECT_URI

    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": client_id,
        "client_secret": client_secret,
    }
    r = requests.post(token_url, data=data)
    if r.status_code != 200:
        return JsonResponse({"error": "token request failed", "details": r.text}, status=400)

    token_info = r.json()
    access_token = token_info.get("access_token")

    front_redirect = settings.SPOTIFY_REDIRECT_URI
    if access_token:
        redirect_url = f"{front_redirect}?token={access_token}"
    else:
        redirect_url = f"{front_redirect}?error=1"

    return HttpResponseRedirect(redirect_url)


@csrf_exempt
def spotify_token(request):
    """Exchange authorization code for Spotify tokens."""
    if request.method != "POST":
        return HttpResponse(status=405)

    code = request.POST.get("code")
    if not code:
        return JsonResponse({"error": "missing code"}, status=400)

    token_url = "https://accounts.spotify.com/api/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
        "client_id": client_id,
        "client_secret": client_secret,
    }
    r = requests.post(token_url, data=data)
    if r.status_code != 200:
        return JsonResponse({"error": "token request failed", "details": r.text}, status=400)

    return JsonResponse(r.json())
