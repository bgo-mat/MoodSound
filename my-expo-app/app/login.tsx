import React, { useState } from 'react';
import { Button, View } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import {REDIRECT_URL} from "../services/api";

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const clientId = '211a9538951e4302b2a20c1e1ada5f4d';
const scopes = ["user-read-email", "playlist-read-private", "user-library-read"]

export default function LoginScreen() {
  const router = useRouter();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
      {
        clientId,
        scopes,
        redirectUri: REDIRECT_URL,
        usePKCE: false,
        responseType: AuthSession.ResponseType.Code,
      },
      discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success' && response.params?.code) {
      router.replace({ pathname: '/callback', params: { code: response.params.code } });
    }

  }, [response]);

  return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
            title="Se connecter avec Spotify"
            onPress={() => promptAsync()}
            disabled={!request}
        />
      </View>
  );
}
