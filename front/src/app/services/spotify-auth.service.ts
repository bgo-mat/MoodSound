import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'spotify_token';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAuthService {
  private token: string | null = null;

  constructor() {}

  async getToken(): Promise<string | null> {
    if (!this.token) {
      const { value } = await Preferences.get({ key: TOKEN_KEY });
      this.token = value;
    }
    return this.token;
  }

  async setToken(token: string) {
    this.token = token;
    await Preferences.set({ key: TOKEN_KEY, value: token });
  }

  login() {
    const clientId = environment.spotifyClientId;
    const redirectUri = environment.spotifyRedirectUri;
    const scopes = [
      'user-read-email',
      'playlist-read-private'
    ];
    const url =
      'https://accounts.spotify.com/authorize' +
      '?response_type=token' +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes.join(' '))}`;
    window.location.href = url;
  }

  async handleAuthCallback(hash: string) {
    const params = new URLSearchParams(hash.replace('#', ''));
    const token = params.get('access_token');
    if (token) {
      await this.setToken(token);
    }
  }

  async logout() {
    this.token = null;
    await Preferences.remove({ key: TOKEN_KEY });
  }
}
