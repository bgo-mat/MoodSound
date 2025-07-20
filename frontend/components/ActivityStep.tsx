import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { useMood } from '../services/mood';
import Svg, { Circle } from 'react-native-svg';
import { EventSubscription } from 'expo-modules-core';
import { LocationSubscription } from "expo-location";

const strokeWidth = 7;
const radius = 46;
const circumference = 2 * Math.PI * radius;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

function getActivityLevel(avgNorm: number) {
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
  const { setActivityData } = useMood();
  const normArray = useRef<number[]>([]);
  const speedArray = useRef<number[]>([]);
  const accelSub = useRef<EventSubscription | null>(null);
  const locSub = useRef<LocationSubscription | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timer: number | null;

    const startSensors = async () => {

      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();

      // ici, on suppose que la permission est déjà granted
      normArray.current = [];
      speedArray.current = [];

      accelSub.current = Accelerometer.addListener(data => {
        const norm = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
        normArray.current.push(norm);
      });
      Accelerometer.setUpdateInterval(200);

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

      timer = setTimeout(() => {
        stopSensors();
      }, 5000);
    };

    const askPermissionAndStart = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        startSensors();
      }
      if (status === 'denied') {
        if (onNext) onNext();
      }
    };

    askPermissionAndStart();

    return () => {
      if (timer) clearTimeout(timer);
      if (accelSub.current) accelSub.current.remove();
      if (locSub.current) locSub.current.remove();
    };
  }, []);

  const stopSensors = async () => {
    if (accelSub.current) accelSub.current.remove();
    if (locSub.current) await locSub.current.remove();

    const avgNorm =
        normArray.current.length > 0
            ? normArray.current.reduce((a, b) => a + b, 0) / normArray.current.length
            : 0;
    const avgSpeed =
        speedArray.current.length > 0
            ? speedArray.current.reduce((a, b) => a + b, 0) / speedArray.current.length
            : 0;

    const activityLevel = getActivityLevel(avgNorm);
    const speedLevel = getSpeedLevel(avgSpeed);

    setActivityData({
      activityLevel,
      speedLevel,
    });

    setDone(true);
    setTimeout(() => {
      if (onNext) onNext();
    }, 1300);
  };

  const animatedStrokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.loaderContainer}>
          <Svg width={2 * (radius + strokeWidth)} height={2 * (radius + strokeWidth)} style={StyleSheet.absoluteFill}>
            <Circle
                cx={radius + strokeWidth}
                cy={radius + strokeWidth}
                r={radius}
                stroke="#284657"
                strokeWidth={strokeWidth}
                fill="none"
            />
            <AnimatedCircle
                cx={radius + strokeWidth}
                cy={radius + strokeWidth}
                r={radius}
                stroke="#50f3bb"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={animatedStrokeDashoffset}
                strokeLinecap="round"
            />
          </Svg>
          <Text style={styles.emoji}>{done ? '✅' : '🚶‍♂️'}</Text>
        </View>
        <Text style={styles.loaderText}>{done ? 'Parfait !' : 'Analyse de ton activité en cours...'}</Text>
      </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    width: 2 * (radius + strokeWidth),
    height: 2 * (radius + strokeWidth),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  emojiCircle: {
    backgroundColor: '#2227',
    borderRadius: 90,
    shadowColor: '#50f3bb',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
    textAlign: 'center',
  },
  loaderText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center'
  },
});
