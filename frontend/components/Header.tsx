import React from 'react';
import { View, Button } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../services/auth';

export default function Header() {
  const insets = useSafeAreaInsets();
  const { logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: 10,
        backgroundColor: '#222',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
      }}
    >
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
