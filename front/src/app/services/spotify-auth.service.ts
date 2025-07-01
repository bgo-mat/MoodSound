import { Injectable, inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'spotify_token';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAuthService {
  private token: string | null = null;
  private http = inject(HttpClient);

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
    const scopes = 'user-read-email playlist-read-private';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: environment.spotifyClientId,
      redirect_uri: environment.spotifyRedirectUri,
      scope: scopes
    });
    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async handleAuthCallback(url: string) {
    const params = new URL(url).searchParams;
    const code = params.get('code');
    if (code) {
      await this.exchangeCode(code);
    }
  }

  private async exchangeCode(code: string) {
    const body = new URLSearchParams({ code });
    const tokenInfo = await firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/spotify/token/`, body)
    );
    if (tokenInfo.access_token) {
      await this.setToken(tokenInfo.access_token);
    }
  }

  async logout() {
    this.token = null;
    await Preferences.remove({ key: TOKEN_KEY });
  }
}
