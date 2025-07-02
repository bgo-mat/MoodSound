import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import './global.css';
import { AuthProvider } from './services/auth';
import AuthGuard from './services/AuthGuard';
import Header from './app/Header';

export default function App() {
  const colorScheme = useColorScheme();
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
            <Stack.Screen name="test-mood" options={{ title: 'Test Mood' }} />
          </Stack>
        </AuthGuard>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
