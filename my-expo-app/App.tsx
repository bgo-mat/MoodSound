import { ScreenContent } from './app/ScreenContent';
import { StatusBar } from 'expo-status-bar';

import './global.css';
import {AuthProvider} from "./services/auth";

export default function App() {
  return (
    <>
        <AuthProvider>
                <ScreenContent title="Home" path="App.tsx"></ScreenContent>
                <StatusBar style="auto" />
        </AuthProvider>
    </>
  );
}
