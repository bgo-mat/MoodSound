import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import './global.css'

import { useColorScheme } from 'react-native';
import Header from './app/Header';
import {AuthProvider} from "./services/auth";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
    const colorScheme = useColorScheme();

    return (
        <SafeAreaProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
                <StatusBar style="auto" />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
