import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import type { Subscription } from 'expo-modules-core';

export default function ActivityStep() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let subscription: Subscription | null = null;

    async function subscribe() {
      const { status } = await Accelerometer.requestPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      subscription = Accelerometer.addListener(setData);
      Accelerometer.setUpdateInterval(500);
    }

    subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: 'white' }}>x: {data.x.toFixed(2)}</Text>
      <Text style={{ color: 'white' }}>y: {data.y.toFixed(2)}</Text>
      <Text style={{ color: 'white' }}>z: {data.z.toFixed(2)}</Text>
    </View>
  );
}
