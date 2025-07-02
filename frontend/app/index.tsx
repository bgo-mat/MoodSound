import { View, Text } from 'react-native';
import { useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../services/auth';

export default function HomeScreen() {
  const { token } = useAuth();

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
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: 'white' }}>Bienvenue sur MoodSound !</Text>
    </View>
  );
}
