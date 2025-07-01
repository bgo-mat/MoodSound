import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { SpotifyAuthService } from '../../services/spotify-auth.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: 'auth-callback.page.html',
  imports: [IonContent, IonSpinner]
})
export class AuthCallbackPage implements OnInit {
  private auth = inject(SpotifyAuthService);
  private router = inject(Router);

  async ngOnInit() {
    await this.auth.handleAuthCallback(window.location.search);
    await this.router.navigateByUrl('/');
  }
}
