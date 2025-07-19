import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator,  Text } from 'react-native';
import { useMood } from '../services/mood';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { LocationSubscription } from "expo-location";
import { EventSubscription } from 'expo-modules-core';
import ActivityStepProgress from './ActivityStepProgress';

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

function getActivityLevel(avgNorm: any) {
  if (avgNorm < 1.05) return ActivityLevel.LOW;
  if (avgNorm < 1.2) return ActivityLevel.MEDIUM;
  return ActivityLevel.HIGH;
}
function getSpeedLevel(avgSpeed: number) {
  if (avgSpeed < 0.3) return SpeedLevel.STILL;
  if (avgSpeed < 2) return SpeedLevel.WALK;
  if (avgSpeed < 6) return SpeedLevel.RUN;
  return SpeedLevel.DRIVE;
}

export default function ActivityStep({ onNext }: { onNext: () => void }) {
  const [avgNorm, setAvgNorm] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [activityLevel, setActivityLevel] = useState<string | null>(null);
  const [speedLevel, setSpeedLevel] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);

  // PROGRESS BAR
  const [accelDone, setAccelDone] = useState(false);
  const [gpsDone, setGpsDone] = useState(false);
  const [geoDone, setGeoDone] = useState(false);
  const [weatherDone, setWeatherDone] = useState(false);

  const { setActivityData, setWeather } = useMood();

  const normArray = useRef<number[]>([]);
  const speedArray = useRef<number[]>([]);
  const accelSub = useRef<EventSubscription | null>(null);
  const locSub = useRef<LocationSubscription | null>(null);

  // Permissions + auto start on mount
  useEffect(() => {
    let timer: number | null;

    const startAll = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (onNext) onNext();
        return;
      }

      // Clean data
      normArray.current = [];
      speedArray.current = [];

      // Accéléromètre
      accelSub.current = Accelerometer.addListener(data => {
        const norm = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
        normArray.current.push(norm);
      });
      Accelerometer.setUpdateInterval(200);

      // GPS
      locSub.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (location) => {
            const speed = location.coords.speed !== null && location.coords.speed >= 0
                ? location.coords.speed
                : 0;
            speedArray.current.push(speed);
          }
      );

      // Stop après 10 secondes
      timer = setTimeout(() => {
        stopAll();
      }, 10000);
    };

    startAll();

    // Clean-up si le composant est démonté
    return () => {
      if (timer) clearTimeout(timer);
      if (accelSub.current) accelSub.current.remove();
      if (locSub.current) locSub.current.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAll = async () => {
    // 1. Stoppe les capteurs
    if (accelSub.current) accelSub.current.remove();
    if (locSub.current) await locSub.current.remove();

    // Calcul des moyennes
    const avgNormVal =
        normArray.current.length > 0
            ? normArray.current.reduce((a, b) => a + b, 0) / normArray.current.length
            : 0;
    const avgSpeedVal =
        speedArray.current.length > 0
            ? speedArray.current.reduce((a, b) => a + b, 0) / speedArray.current.length
            : 0;

    setAvgNorm(avgNormVal);
    setAvgSpeed(avgSpeedVal);

    setAccelDone(true);

    // On déduis les niveaux
    const actLevel = getActivityLevel(avgNormVal);
    const spdLevel = getSpeedLevel(avgSpeedVal);

    setActivityLevel(actLevel);
    setSpeedLevel(spdLevel);

    setGpsDone(true);

    // On récupère la géoloc
    let geoResult = await fetchCountryAndRegion()

    setGeoDone(true);

    // Météo
    let weatherData = null;
    if (geoResult.coords) {
      weatherData = await fetchWeather(geoResult.coords);
      setWeather(weatherData);
    }

    setWeatherDone(true);

    // On stocke l'activité dans le context
    setActivityData({
      activityLevel: actLevel,
      speedLevel: spdLevel,
      country: geoResult.country,
      region: geoResult.region,
    });

    // On passe à l'étape suivante uniquement si tout est récupéré
    if (
        actLevel &&
        spdLevel &&
        geoResult.country &&
        geoResult.region &&
        weatherData
    ) {
      if (onNext){
        onNext();
      }
    } else {
      console.warn("Certaines données n'ont pas pu être récupérées.");
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
          coords: position.coords
        };
      }
    } catch (e) {
      setCountry(null);
      setRegion(null);
      return { country: null, region: null, coords : null };
    }
    return { country: null, region: null, coords : null };
  }

  async function fetchWeather({ latitude, longitude }: { latitude: number, longitude: number }) {
    try {
      const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const json = await res.json();
      return simplifyWeatherData(json);
    } catch (e) {
      console.log("Erreur météo :", e);
      return null;
    }
  }

  function simplifyWeatherData(raw: any) {
    const data = raw?.current_weather || raw;
    if (!data) return null;
    return {
      temperature: data.temperature,                  // en °C
      weather: interpretWeatherCode(data.weathercode), // texte humain
      isDay: data.is_day === 1 ? "day" : "night",
      windSpeed: data.windspeed,                      // km/h
      windDirection: data.winddirection,              // degrés
      hour: data.time?.slice(11, 16) || null,         // HH:MM
    };
  }

  // Traduction du weathercode en une description lisible pour l'ia
  function interpretWeatherCode(code: number): string {
    const weatherCodes: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail"
    };
    return weatherCodes[code] || "Unknown";
  }

  return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityStepProgress
            timer={10}
            states={{ accelDone, gpsDone, geoDone, weatherDone }}
        />
        <ActivityIndicator
            size="large"
            color="#50f3bb"
            style={{ marginVertical: 32 }}
        />
      </View>
  );

}
