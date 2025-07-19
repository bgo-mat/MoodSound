import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useMood } from '../services/mood';
import api from '../services/api';
import { Audio } from 'expo-av';
import Svg, { Circle } from 'react-native-svg';

const DURATION = 5;
const strokeWidth = 7;
const radius = 46;
const circumference = 2 * Math.PI * radius;

export default function MicrophoneStep({ onNext }: { onNext: () => void }) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const { setAudioUri, setAudioUrl, setAudioUploading, audioUploading } = useMood();
  const [uploadError, setUploadError] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Animation progress border (de 0 à 1 sur DURATION)
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Interpolation du cercle SVG
  const animatedStrokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  // Enregistrement auto au montage
  useEffect(() => {
    progressAnim.setValue(0);

    const startRecording = async () => {
      if (recordingRef.current) {
        try { await recordingRef.current.stopAndUnloadAsync(); } catch {}
        recordingRef.current = null;
      }
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) { if (onNext) onNext(); return; }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const rec = new Audio.Recording();
        recordingRef.current = rec;

        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await rec.startAsync();
        setRecording(rec);
        setUri(null);

        // Animation du cercle progressif
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: DURATION * 1000,
          useNativeDriver: false,
          easing: Easing.linear
        }).start();

        // Stop auto après DURATION
        timerRef.current = setTimeout(() => {
          stopRecording(rec);
        }, DURATION * 1000);
      } catch (err) {
        setRecording(null);
        recordingRef.current = null;
        if (onNext) onNext();
      }
    };

    startRecording();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
      progressAnim.setValue(0);
    };
    // eslint-disable-next-line
  }, []);

  const stopRecording = async (recToStop?: Audio.Recording) => {
    const rec = recToStop ?? recordingRef.current;
    if (!rec) return;
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      setUri(uri);
      setAudioUri(uri ?? null);
      if (uri) {
        setAudioUploading(true);
        api.uploadAudio(uri)
          .then(url => {
            setAudioUrl(url);
          })
          .catch(() => setUploadError(true))
          .finally(() => setAudioUploading(false));
      }
      setTimeout(() => { if (onNext) onNext(); }, 1300);
    } catch (err) {
      //
    } finally {
      setRecording(null);
      recordingRef.current = null;
    }
  };

  return (
      <View style={styles.bg}>
        <View style={styles.circleContainer}>
          <Svg width={2 * (radius + strokeWidth)} height={2 * (radius + strokeWidth)} style={StyleSheet.absoluteFill}>
            {/* Cercle BG */}
            <Circle
                cx={radius + strokeWidth}
                cy={radius + strokeWidth}
                r={radius}
                stroke="#333a"
                strokeWidth={strokeWidth}
                fill="none"
            />
            {/* Cercle progressif */}
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
            <Text style={styles.emoji}>{uri ? '✅' : '🎤'}</Text>
        </View>
        <Text style={styles.title}>
          {recording ? "Enregistrement audio en cours..." : "Parfait !"}
        </Text>
        {audioUploading && !uploadError && (
          <Text style={styles.upload}>Upload audio...</Text>
        )}
        {uploadError && (
          <Text style={styles.error}>Erreur lors de l'upload</Text>
        )}
      </View>
  );
}

// Pour AnimatedCircle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  circleContainer: {
    width: 2 * (radius + strokeWidth),
    height: 2 * (radius + strokeWidth),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
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
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center'
  },
  error: {
    color: '#ff8080',
    marginTop: 8,
  },
  upload: {
    color: '#fff',
    marginTop: 8,
  },
  uri: {
    color: '#fff',
    opacity: 0.77,
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
    maxWidth: 260
  }
});
