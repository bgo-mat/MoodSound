import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import * as Location from 'expo-location';
import { useMood } from '../services/mood';
import Svg, { Circle } from 'react-native-svg';

const strokeWidth = 7;
const radius = 46;
const circumference = 2 * Math.PI * radius;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function EnvironnementStep({ onNext }: { onNext: () => void }) {
    const { setEnvironnementData } = useMood();
    const [waitingApi, setWaitingApi] = useState(true);
    const [done, setDone] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const animBlocked = useRef(false);
    const [currentValue, setCurrentValue] = useState(0);

    useEffect(() => {
        progressAnim.setValue(0);
        animBlocked.current = false;
        setCurrentValue(0);

        const id = progressAnim.addListener(({ value }) => {
            setCurrentValue(value);
        });

        // Animation principale
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: false,
            easing: Easing.linear,
        }).start(({ finished }) => {
            if (finished && waitingApi) {
                animBlocked.current = true;
            }
        });

        // Call API en // pendant l’anim
        const getEnvData = async () => {
            try {
                const position = await Location.getCurrentPositionAsync({});
                const geocode = await Location.reverseGeocodeAsync(position.coords);

                let region = null, country = null;
                if (geocode.length > 0) {
                    country = geocode[0].country ?? null;
                    region =
                        geocode[0].region ||
                        geocode[0].subregion ||
                        geocode[0].city ||
                        geocode[0].district ||
                        null;
                }

                // Weather fetch
                let weather = null;
                try {
                    const res = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&current_weather=true`
                    );
                    const json = await res.json();
                    const data = json?.current_weather || json;
                    if (data) {
                        weather = {
                            temperature: data.temperature,
                            weather: interpretWeatherCode(data.weathercode),
                            isDay: data.is_day === 1 ? 'day' : 'night',
                            windSpeed: data.windspeed,
                            windDirection: data.winddirection,
                            hour: data.time?.slice(11, 16) || null,
                        };
                    }
                } catch {}

                setEnvironnementData({
                    country:country,
                    region:region,
                    weather:weather
                });

                setWaitingApi(false);

                // Validation anim & passage au "done"
                if (animBlocked.current) {
                    Animated.timing(progressAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: false,
                        easing: Easing.linear,
                    }).start(() => {
                        setDone(true);
                        setTimeout(() => {
                            if (onNext) onNext();
                        }, 1300);
                    });
                } else {
                    setTimeout(() => {
                        setDone(true);
                        setTimeout(() => {
                            if (onNext) onNext();
                        }, 1300);
                    }, Math.max(0, 5000 - currentValue * 5000) + 400);
                }
            } catch {
                setWaitingApi(false);
                if (animBlocked.current) {
                    Animated.timing(progressAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: false,
                    }).start(() => {
                        setDone(true);
                        setTimeout(() => {
                            if (onNext) onNext();
                        }, 1300);
                    });
                } else {
                    setTimeout(() => {
                        setDone(true);
                        setTimeout(() => {
                            if (onNext) onNext();
                        }, 1300);
                    }, Math.max(0, 5000 - currentValue * 5000) + 400);
                }
            }
        };
        getEnvData();

        return () => {
            progressAnim.stopAnimation();
            progressAnim.removeListener(id);
        };
    }, []);

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
                <Text style={styles.emoji}>{done ? '✅' : '🌍'}</Text>
            </View>
            <Text style={styles.loaderText}>
                {done ? 'Parfait !' : 'Récupération de l’environnement...'}
            </Text>
        </View>
    );
}

// Weather code
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
