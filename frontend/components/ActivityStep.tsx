import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { EventSubscription } from 'expo-modules-core';

export default function ActivityStep() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [locationPermission, setLocationPermission] = useState(false);
  const [norm, setNorm] = useState(0);
  const [speed, setSpeed] = useState(0);


  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      if (status !== 'granted') {
        console.log('Permission GPS non accordée');
      }
    })();
  }, []);

  useEffect(() => {
    let subscription: EventSubscription | null = null;

    async function subscribe() {
      const { status } = await Accelerometer.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissions to access accelerometer not granted!');
        return;
      }

      subscription = Accelerometer.addListener(setData);
      Accelerometer.setUpdateInterval(200);
    }

    subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    const norm = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);

    if (Math.abs(norm - 1) > 0.1 && locationPermission) {
      (async () => {
        try {
          const { coords } = await Location.getCurrentPositionAsync({});
          console.log(coords.speed)
          const speed = coords.speed !== null ? coords.speed : 0;
          setNorm(norm)
          setSpeed(speed)
          console.log(`Mouvement détecté ! Norme : ${norm.toFixed(2)}, Vitesse GPS : ${speed} m/s`);
        } catch (e) {
          console.log('Erreur récupération GPS :', e);
        }
      })();
    }
  }, [data, locationPermission]);

  return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white' }}>norm: {norm.toFixed(2)}</Text>
        <Text style={{ color: 'white' }}>speed: {speed}</Text>
      </View>
  );
}
