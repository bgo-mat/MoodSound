import { View, Text, Button } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { useAuth } from '../services/auth';

export default function HomeScreen() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchFavorites() {
      if (!token) return;
      try {
        await api.get('/spotify/favorites/', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error(e);
      }
    }
    fetchFavorites();
  }, [token]);

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Text className="text-white">Bienvenue sur MoodSound !</Text>
      <Button
        title="Tester mon mood"
        onPress={() => router.push('/test-mood')}
      />
    </View>
  );
}
