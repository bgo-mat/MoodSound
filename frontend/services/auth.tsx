import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export interface TokenData {
  access_token: string;
  expires_in: number;
}

const TOKEN_KEY = 'spotify_token';
const EXPIRES_KEY = 'spotify_token_expires';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setToken: (data: TokenData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY);
      const expires = await SecureStore.getItemAsync(EXPIRES_KEY);
      if (stored && expires && parseInt(expires, 10) > Date.now() / 1000) {
        setTokenState(stored);
      }
      setLoading(false);
    }
    load();
  }, []);

  const setToken = async (data: TokenData) => {
    const expiresAt = Math.floor(Date.now() / 1000 + data.expires_in - 60);
    await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
    await SecureStore.setItemAsync(EXPIRES_KEY, expiresAt.toString());
    setTokenState(data.access_token);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(EXPIRES_KEY);
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, loading, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
