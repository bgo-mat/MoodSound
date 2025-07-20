import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function WaitingBackend() {
    // Animation des points
    const [dots, setDots] = useState('');
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDots('.'.repeat((i % 3) + 1));
            i++;
        }, 400);
        return () => clearInterval(interval);
    }, []);

    // Animation cerveau rebond
    const bounceAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, { toValue: -12, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
                Animated.timing(bounceAnim, { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
            ])
        ).start();
    }, [bounceAnim]);

    // Animation de la barre de chargement
    const loaderAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(loaderAnim, {
            toValue: 1,
            duration: 20000, // 20 sec
            useNativeDriver: false,
            easing: Easing.inOut(Easing.quad),
        }).start();
    }, [loaderAnim]);

    // La width de la barre (de 0% à 100%)
    const barWidth = loaderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.brainBubble, { transform: [{ translateY: bounceAnim }] }]}>
                <Text style={{ fontSize: 68, shadowColor: '#0ef', shadowOpacity: 0.18, shadowRadius: 12 }}>🧠</Text>
            </Animated.View>
            <Text style={styles.title}>Analyse IA en cours{dots}</Text>
            <Text style={styles.subtitle}>
                Nos algorithmes réfléchissent à ta musique parfaite.
            </Text>
            <View style={styles.barLoaderBG}>
                <Animated.View style={[styles.barLoaderFill, { width: barWidth }]} />
            </View>
            <Text style={styles.waitHint}>
                Cela prend quelques secondes&nbsp;: <Text style={{ fontWeight: 'bold', color: '#50f3bb' }}>reste zen&nbsp;!</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: -60,
        width: '88%',
        alignItems: 'center',
        backgroundColor: '#ffffff22',
        borderRadius: 30,
        padding: 34,
        shadowColor: '#000',
        shadowOpacity: 0.13,
        shadowRadius: 40,
    },
    brainBubble: {
        backgroundColor: '#fff8',
        padding: 22,
        borderRadius: 999,
        marginBottom: 12,
        marginTop: 6,
        shadowColor: '#6EF0FF',
        shadowOpacity: 0.15,
        shadowRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: 1.3,
        marginBottom: 10,
        textAlign: 'center',
        textShadowColor: "#0002",
        textShadowRadius: 8,
    },
    subtitle: {
        color: '#f9f9f9',
        fontSize: 17,
        opacity: 0.95,
        marginBottom: 22,
        textAlign: 'center',
        maxWidth: 300,
    },
    barLoaderBG: {
        height: 13,
        width: '100%',
        backgroundColor: '#e5e5e533',
        borderRadius: 9,
        marginTop: 18,
        marginBottom: 8,
        overflow: 'hidden',
    },
    barLoaderFill: {
        height: '100%',
        backgroundColor: '#50f3bb',
        borderRadius: 9,
        width: '0%', // Sera animé !
    },
    waitHint: {
        marginTop: 18,
        fontSize: 15,
        color: '#f9fff9',
        opacity: 0.8,
        textAlign: 'center',
        marginBottom: 6,
    }
});
