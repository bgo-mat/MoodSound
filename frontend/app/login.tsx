import { useState } from 'react';
import { Button, View } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';


const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';
const scopes = 'user-read-email playlist-read-private';
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
};

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'frontend',
      path: 'callback',
    });
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
    });
    const authUrl = `${discovery.authorizationEndpoint}?${params.toString()}`;

    setLoading(true);
    const result = await AuthSession.startAsync({ authUrl, returnUrl: redirectUri });
    if (result.type === 'success' && result.params?.code) {
      router.replace({ pathname: '/callback', params: { code: result.params.code } });
    }
    setLoading(false);
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Se connecter avec Spotify" onPress={handleLogin} disabled={loading} />
    </View>
  );
}
