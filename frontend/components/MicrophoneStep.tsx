import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useMood } from '../services/mood';
import { Audio } from 'expo-av';

const DURATION = 10; // durée de l'enregistrement en secondes

export default function MicrophoneStep({ onNext }: { onNext: () => void }) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const { setAudioUri } = useMood();

  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const timerRef = useRef<number | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null); // <= add this ref

  // Animation micro (pulse)
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (recording) {
      Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1.25, duration: 700, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
          ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [recording]);

  // Enregistrement auto au montage
  useEffect(() => {
    setSecondsLeft(DURATION);

    const startRecording = async () => {
      // Cleanup éventuel avant de commencer
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch {}
        recordingRef.current = null;
      }

      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          if (onNext) onNext();
          return;
        }

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

        // Chrono & stop auto
        let sec = DURATION;
        timerRef.current = setInterval(() => {
          sec--;
          setSecondsLeft(sec);
          if (sec <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            stopRecording(rec);
          }
        }, 1000);
      } catch (err) {
        console.error('Failed to start recording', err);
        setRecording(null);
        recordingRef.current = null;
        if (onNext) onNext();
      }
    };

    startRecording();

    // Cleanup
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
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
      if (onNext) onNext();
    } catch (err) {
      console.error('Failed to stop recording', err);
    } finally {
      setRecording(null);
      recordingRef.current = null;
    }
  };

  return (
      <View style={styles.bg}>
        <Animated.View style={[styles.emojiCircle, { transform: [{ scale: pulse }] }]}>
          <Text style={styles.emoji}>{'🎤'}</Text>
        </Animated.View>
        <Text style={styles.title}>
          {"Enregistrement en cours..."}
        </Text>
        <View style={styles.progressBG}>
          <View style={[
            styles.progressBar,
            { width: `${((DURATION - secondsLeft) / DURATION) * 100}%` }
          ]}/>
        </View>
            <Text style={styles.timeLeft}>
              {secondsLeft}s restantes
            </Text>
      </View>
  );
}


const styles = StyleSheet.create({
  bg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  emojiCircle: {
    backgroundColor: '#2226',
    borderRadius: 80,
    padding: 28,
    marginBottom: 10,
    marginTop: 0,
    shadowColor: '#50f3bb',
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  emoji: {
    fontSize: 60,
    textAlign: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 10,
    textAlign: 'center'
  },
  progressBG: {
    height: 12,
    width: '88%',
    backgroundColor: '#283143',
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#50f3bb',
    borderRadius: 8,
    width: '1%',
  },
  timeLeft: {
    color: '#50f3bb',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
    letterSpacing: 1,
  },
  uri: {
    color: '#fff',
    opacity: 0.72,
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
    maxWidth: 260
  }
});
