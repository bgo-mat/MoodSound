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

    @patch('api.views.requests.post')
    def test_exchange_code(self, mock_post):
        mock_post.side_effect = self.mock_post
        response = self.client.post(reverse('spotify-token'), {'code': '123'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.captured_url, 'https://accounts.spotify.com/api/token')
        self.assertIn('123', self.captured_data['code'])
        self.assertEqual(response.json()['access_token'], 'abc')

    def test_missing_code(self):
        response = self.client.post(reverse('spotify-token'), {})
        self.assertEqual(response.status_code, 400)

