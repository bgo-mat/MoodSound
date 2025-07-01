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
    window.location.href = `${environment.apiUrl}/spotify/login/`;
  }

  async handleAuthCallback(query: string) {
    const params = new URLSearchParams(query.replace('?', ''));
    const token = params.get('token');
    if (token) {
      await this.setToken(token);
    }
  }

  async logout() {
    this.token = null;
    await Preferences.remove({ key: TOKEN_KEY });
  }
}
