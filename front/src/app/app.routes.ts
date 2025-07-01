import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./page/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth-callback',
    loadComponent: () =>
      import('./page/auth-callback/auth-callback.page').then((m) => m.AuthCallbackPage),
  },
  {
    path: '',
    loadChildren: () => import('./component/tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
