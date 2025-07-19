import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useMood } from '../services/mood';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import {LocationSubscription} from "expo-location";
import { EventSubscription } from 'expo-modules-core';

export const ActivityLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const SpeedLevel = {
  STILL: 'still',
  WALK: 'walk',
  RUN: 'run',
  DRIVE: 'drive'
};

function getActivityLevel(avgNorm:any) {
  if (avgNorm < 1.05) return ActivityLevel.LOW;        // repos
  if (avgNorm < 1.2) return ActivityLevel.MEDIUM;      // marche/activité faible
  return ActivityLevel.HIGH;                            // activité physique forte
}
function getSpeedLevel(avgSpeed: number) {
  if (avgSpeed < 0.3) return SpeedLevel.STILL;         // à l'arrêt
  if (avgSpeed < 2) return SpeedLevel.WALK;            // marche
  if (avgSpeed < 6) return SpeedLevel.RUN;             // course (≈20 km/h max)
  return SpeedLevel.DRIVE;                             // conduite (voiture, vélo électrique rapide, etc.)
}


export default function ActivityStep() {
  const [locationPermission, setLocationPermission] = useState(false);
  const [avgNorm, setAvgNorm] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [activityLevel, setActivityLevel] = useState<string | null>(null);
  const [speedLevel, setSpeedLevel] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);

  const { setActivityData } = useMood();

  const normArray:React.RefObject<number[]> = useRef([0]);
  const speedArray:React.RefObject<number[]> = useRef([]);
  const accelSub = useRef<EventSubscription | null>(null);
  const locSub: React.RefObject<LocationSubscription | null> = useRef(null);

  // Permissions GPS
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      if (status !== 'granted') {
        console.log('Permission GPS non accordée');
      }
    })();
  }, []);

  const startRecording = async () => {
    // Nettoyage
    normArray.current = [];
    speedArray.current = [];
    setIsRecording(true);

    // Accéléromètre
    // @ts-ignore
    accelSub.current = Accelerometer.addListener(data => {
      const norm = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      normArray.current.push(norm);
    });
    Accelerometer.setUpdateInterval(200);

    // GPS
    if (locationPermission) {
      locSub.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 1000, // toutes les secondes
            distanceInterval: 1,
          },
          (location) => {
            const speed = location.coords.speed !== null && location.coords.speed >= 0
                ? location.coords.speed
                : 0;
            speedArray.current.push(speed);
          }
      );
    }

    // Stop après 10 secondes
    setTimeout(() => {
      stopRecording();
    }, 10000);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (accelSub.current) accelSub.current.remove();
    if (locSub.current) await locSub.current.remove();

    // Calcul des moyennes
    const avgNorm =
        normArray.current.length > 0
            ? normArray.current.reduce((a, b) => a + b, 0) / normArray.current.length
            : 0;
    const avgSpeed =
        speedArray.current.length > 0
            ? speedArray.current.reduce((a, b) => a + b, 0) / speedArray.current.length
            : 0;

    setAvgNorm(avgNorm);
    setAvgSpeed(avgSpeed);

    // Déduction des niveaux
    const actLevel = getActivityLevel(avgNorm);
    const spdLevel = getSpeedLevel(avgSpeed);

    setActivityLevel(actLevel);
    setSpeedLevel(spdLevel);

    const geoResult = await fetchCountryAndRegion();

    if (geoResult) {
      // Store activity and location data in context for later use
      setActivityData({
        activityLevel: actLevel,
        speedLevel: spdLevel,
        country: geoResult.country,
        region: geoResult.region,
      });
    }
  };

  async function fetchCountryAndRegion() {
    try {
      const position = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync(position.coords);
      if (geocode.length > 0) {
        const regionValue =
            geocode[0].region ||
            geocode[0].subregion ||
            geocode[0].city ||
            geocode[0].district ||
            null;

        setCountry(geocode[0].country ?? null);
        setRegion(regionValue);

        return {
          country: geocode[0].country ?? null,
          region: regionValue,
        };
      }
    } catch (e) {
      setCountry(null);
      setRegion(null);
      return { country: null, region: null };
    }
    return { country: null, region: null };
  }

  return (
      <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
        <Button
            title={isRecording ? "Enregistrement en cours..." : "Démarrer l'analyse de mood"}
            onPress={startRecording}
            disabled={isRecording}
        />
        <Text style={{ color: 'white', marginTop: 20 }}>Moyenne norm: {avgNorm.toFixed(2)}</Text>
        <Text style={{ color: 'white' }}>Moyenne speed: {avgSpeed.toFixed(2)}</Text>
        <Text style={{ color: 'white' }}>Activité: {activityLevel}</Text>
        <Text style={{ color: 'white' }}>Déplacement: {speedLevel}</Text>
      </View>
  );
}
