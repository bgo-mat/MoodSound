import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SpotifyAuthService } from './spotify-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: SpotifyAuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const token = await this.auth.getToken();
    if (token) {
      return true;
    }
    this.router.navigateByUrl('/login');
    return false;
  }
}
