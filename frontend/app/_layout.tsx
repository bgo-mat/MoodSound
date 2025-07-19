import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './global.css'

import { useColorScheme } from 'react-native';
import { AuthProvider } from '../services/auth';
import { MoodProvider } from '../services/mood';
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
      <MoodProvider>
        <AuthProvider>
          <Header />
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Home' }} />
            <Stack.Screen name="login" options={{ title: 'Login' }} />
            <Stack.Screen name="callback" options={{ headerShown: false }} />
            <Stack.Screen name="connected" options={{ title: 'Connected' }} />
            <Stack.Screen name="test-mood" options={{ title: 'Test Mood' }} />
          </Stack>
        </AuthProvider>
      </MoodProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
