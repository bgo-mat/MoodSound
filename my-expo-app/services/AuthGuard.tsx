import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import {useAuth} from "./auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthFlow = segments[0] === 'login' || segments[0] === 'callback';
    if (!isAuthenticated && !inAuthFlow) {
      router.replace('/login');
    }
    if (isAuthenticated && inAuthFlow) {
      router.replace('/');
    }
  }, [segments, isAuthenticated, loading]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}
