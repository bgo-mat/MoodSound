## Development

Install dependencies and start the dev server:

```bash
npm install
npm start
```

The application will be available on `http://localhost:8100`. Use the
"Se connecter avec Spotify" button to authenticate with Spotify via the
backend OAuth flow.

### iOS Build

```bash
ionic build
ionic cap sync ios
ionic cap open ios
```
