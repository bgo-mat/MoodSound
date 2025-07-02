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
      style={{ paddingTop: insets.top }}
      className="pb-2 bg-gray-800 items-end px-2"
    >
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
