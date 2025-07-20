from django.test import TestCase
from django.urls import reverse
from unittest.mock import patch
from requests.models import Response


class SpotifyTokenTests(TestCase):
    def mock_post(self, url, data=None, **kwargs):
        self.captured_url = url
        self.captured_data = data
        response = Response()
        response.status_code = 200
        response._content = b'{"access_token": "abc", "refresh_token": "def"}'
        return response

    @patch("api.views.spotify_token.requests.post")
    def test_exchange_code(self, mock_post):
        mock_post.side_effect = self.mock_post
        response = self.client.post(reverse("spotify-token"), {"code": "123"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.captured_url, "https://accounts.spotify.com/api/token")
        self.assertIn("123", self.captured_data["code"])
        self.assertEqual(response.json()["access_token"], "abc")

    def test_missing_code(self):
        response = self.client.post(reverse("spotify-token"), {})
        self.assertEqual(response.status_code, 400)


class SpotifyFavoritesTests(TestCase):
    def mock_get(self, url, headers=None, **kwargs):
        self.captured_url = url
        self.captured_headers = headers
        response = Response()
        response.status_code = 200
        response._content = b'{"items": []}'
        return response

    @patch("api.views.spotify_favorites.requests.get")
    def test_requires_authorization(self, mock_get):
        response = self.client.get(reverse("spotify-favorites"))
        self.assertEqual(response.status_code, 400)

    @patch("api.views.spotify_favorites.requests.get")
    def test_fetch_favorites(self, mock_get):
        mock_get.side_effect = self.mock_get
        response = self.client.get(
            reverse("spotify-favorites"), HTTP_AUTHORIZATION="Bearer token123"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.captured_url, "https://api.spotify.com/v1/me/tracks")
        self.assertEqual(self.captured_headers["Authorization"], "Bearer token123")


class UploadAudioTests(TestCase):
    def test_missing_file(self):
        response = self.client.post(reverse("upload-audio"))
        self.assertEqual(response.status_code, 400)

    def test_invalid_type(self):
        from django.core.files.uploadedfile import SimpleUploadedFile

        f = SimpleUploadedFile("test.txt", b"abc", content_type="text/plain")
        response = self.client.post(reverse("upload-audio"), {"file": f})
        self.assertEqual(response.status_code, 400)

    @patch("api.views.upload_audio.uuid.uuid4")
    def test_upload_success(self, mock_uuid):
        from django.core.files.uploadedfile import SimpleUploadedFile
        from django.conf import settings
        import os

        mock_uuid.return_value.hex = "abcdef"
        audio_bytes = b"FAKEAUDIO"
        f = SimpleUploadedFile("sound.m4a", audio_bytes, content_type="audio/m4a")
        response = self.client.post(reverse("upload-audio"), {"file": f})
        self.assertEqual(response.status_code, 200)
        path = response.json().get("audio_path")
        self.assertTrue(path.startswith("app/assets/audio/"))
        full_path = os.path.join(settings.BASE_DIR, path)
        self.assertTrue(os.path.isfile(full_path))
