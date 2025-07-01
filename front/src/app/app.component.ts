import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { App } from '@capacitor/app';
import { SpotifyAuthService } from './services/spotify-auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private auth = inject(SpotifyAuthService);

  constructor() {
    App.addListener('appUrlOpen', async (data) => {
      if (data.url.startsWith('myapp://callback')) {
        await this.auth.handleAuthCallback(data.url);
      }
    });
  }
}
