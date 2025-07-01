declare const process: { env: { [key: string]: string | undefined } };

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  spotifyRedirectUri: 'myapp://callback',
  spotifyClientId: process.env['NG_APP_SPOTIFY_CLIENT_ID'] || ''
};
