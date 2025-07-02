import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ConnectedScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-white mb-5">Connexion à Spotify réussie !</Text>
      <Button title="Accéder à l'application" onPress={() => router.replace('/')} />
    </View>
  );
}
