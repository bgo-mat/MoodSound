import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

export default function ActivityStepProgress({
                                                 timer = 10,
                                                 states = {}
                                             }: {
    timer?: number,
    states: {
        accelDone?: boolean,
        gpsDone?: boolean,
        geoDone?: boolean,
        weatherDone?: boolean
    }
}) {
    const [progress, setProgress] = useState(0);
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Barre de progression animée (0 -> 1 en timer secondes)
        Animated.timing(anim, {
            toValue: 1,
            duration: timer * 1000,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();

        const interval = setInterval(() => {
            anim.stopAnimation(v => setProgress(v));
        }, 100);
        return () => clearInterval(interval);
    }, [anim, timer]);

    // Progress in %
    const width = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    // Icônes d'étape
    const steps = [
        {
            key: 'accel',
            label: "Analyse du mouvement",
            emoji: "📳",
            done: states.accelDone,
        },
        {
            key: 'gps',
            label: "Mesure vitesse & position GPS",
            emoji: "📡",
            done: states.gpsDone,
        },
        {
            key: 'geo',
            label: "Recherche du pays & région",
            emoji: "🌍",
            done: states.geoDone,
        },
        {
            key: 'weather',
            label: "Météo locale en direct",
            emoji: "🌦️",
            done: states.weatherDone,
        },
    ];

    return (
        <View style={styles.progressContainer}>
            <View style={styles.barBG}>
                <Animated.View style={[styles.barFill, { width }]} />
            </View>
            <View style={{ marginVertical: 30, width: '100%' }}>
                {steps.map((step, i) => (
                    <View key={step.key} style={styles.row}>
                        <Text style={[
                            styles.icon,
                            step.done ? styles.iconDone : styles.iconPending
                        ]}>
                            {step.done ? "✅" : step.emoji}
                        </Text>
                        <Text style={[
                            styles.text,
                            step.done && styles.textDone
                        ]}>
                            {step.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// === Styles
const styles = StyleSheet.create({
    progressContainer: { width: '90%', alignSelf: 'center', marginTop: 10 },
    barBG: {
        height: 12,
        backgroundColor: '#222a',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 18,
        width: '100%',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#50f3bb',
        borderRadius: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 13,
    },
    icon: {
        fontSize: 30,
        width: 38,
        textAlign: 'center',
        marginRight: 8,
        opacity: 0.8,
        transform: [{ scale: 1 }],
    },
    iconDone: {
        opacity: 1,
        transform: [{ scale: 1.2 }],
    },
    iconPending: {
        opacity: 0.55,
    },
    text: {
        fontSize: 17,
        color: '#fff',
        opacity: 0.8,
        fontWeight: '400',
    },
    textDone: {
        color: '#50f3bb',
        fontWeight: 'bold',
        opacity: 1,
    },
});
