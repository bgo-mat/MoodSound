declare const process: { env: { [key: string]: string | undefined } };

export const environment = {
  production: true,
  apiUrl: 'http://localhost:8000/api',
  spotifyRedirectUri: 'http://localhost:8100/auth-callback'
};
