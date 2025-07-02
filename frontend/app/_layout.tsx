import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from 'react-native';
import { AuthProvider } from '../services/auth';
import AuthGuard from '../services/AuthGuard';
import Header from '../components/Header';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AuthGuard>
          <Header />
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Home' }} />
            <Stack.Screen name="login" options={{ title: 'Login' }} />
            <Stack.Screen name="callback" options={{ headerShown: false }} />
            <Stack.Screen name="connected" options={{ title: 'Connected' }} />
          </Stack>
        </AuthGuard>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
