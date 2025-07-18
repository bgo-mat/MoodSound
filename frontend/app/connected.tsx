import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ConnectedScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>Connexion à Spotify réussie !</Text>
      <Button title="Accéder à l'application" onPress={() => router.replace('/')} />
    </View>
  );
}
