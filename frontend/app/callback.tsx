import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import api from '../services/api';
import { useAuth, TokenData } from '../services/auth';

export default function CallbackScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { setToken } = useAuth();

  useEffect(() => {
    async function exchange() {
      if (!code) {
        router.replace('/login');
        return;
      }
      try {
        const data = await api.post<TokenData>('/spotify/token/', { code });
        setToken(data);
        router.replace('/connected');
      } catch (e) {
        router.replace('/login');
      }
    }
    exchange();
  }, [code, router, setToken]);

  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator />
    </View>
  );
}
