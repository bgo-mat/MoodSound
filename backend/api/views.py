import requests
from django.conf import settings
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

client_id = settings.SPOTIFY_CLIENT_ID
client_secret = settings.SPOTIFY_CLIENT_SECRET
def spotify_login(request):
    """Redirect user to Spotify authorization page."""
    print('client_id :',client_id, flush=True)
    print('client_secret :',client_secret, flush=True)
    redirect_uri = request.build_absolute_uri(reverse("spotify-callback"))
    scopes = "user-read-email playlist-read-private"

    url = (
        "https://accounts.spotify.com/authorize"
        "?response_type=code"
        f"&client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&scope={scopes}"
    )
    return HttpResponseRedirect(url)


@csrf_exempt
def spotify_callback(request):
    """Exchange the authorization code for an access token and redirect to front."""
    code = request.GET.get("code")
    if not code:
        return JsonResponse({"error": "missing code"}, status=400)

    token_url = "https://accounts.spotify.com/api/token"
    redirect_uri = request.build_absolute_uri(reverse("spotify-callback"))

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

    front_redirect = "http://localhost:8100/auth-callback"
    if access_token:
        redirect_url = f"{front_redirect}?token={access_token}"
    else:
        redirect_url = f"{front_redirect}?error=1"

    return HttpResponseRedirect(redirect_url)
