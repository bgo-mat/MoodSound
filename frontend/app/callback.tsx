import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import api from '@/services/api';

export default function CallbackScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    async function exchange() {
      if (!code) {
        router.replace('/login');
        return;
      }
      try {
        await api.post('/spotify/token/', { code });
        router.replace('/connected');
      } catch (e) {
        console.error(e);
        router.replace('/login');
      }
    }
    exchange();
  }, [code]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
