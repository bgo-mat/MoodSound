declare const process: { env: { [key: string]: string | undefined } };

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  spotifyClientId: process.env['SPOTIFY_CLIENT_ID'] || '',
  spotifyClientSecret: process.env['SPOTIFY_CLIENT_SECRET'] || '',
  spotifyRedirectUri: 'http://localhost:8100/auth-callback'
};
