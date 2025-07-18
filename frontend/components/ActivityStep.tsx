import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function ActivityStep() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let subscription: any = null;

    async function subscribe() {
      const { status } = await Accelerometer.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissions to access accelerometer not granted!');
        return;
      }

      subscription = Accelerometer.addListener(setData);
      Accelerometer.setUpdateInterval(500);

      //TODO envoyer les positions au back ici
      console.log('exec')
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
