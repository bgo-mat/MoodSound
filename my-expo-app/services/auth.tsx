import React, { createContext, useContext, useState } from 'react';

export interface TokenData {
  access_token: string;
  expires_in: number;
}


interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setToken: (data: TokenData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const loading = false;

  const setToken = (data: TokenData) => {
    setTokenState(data.access_token);
  };

  const logout = () => {
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
