import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { SpotifyAuthService } from '../../services/spotify-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [IonContent, IonButton, IonHeader, IonToolbar, IonTitle]
})
export class LoginPage implements OnInit {
  constructor(private auth: SpotifyAuthService, private router: Router) {}

  async ngOnInit() {
    const token = await this.auth.getToken();
    if (token) {
      await this.router.navigateByUrl('/');
    }
  }

  login() {
    this.auth.login();
  }
}
