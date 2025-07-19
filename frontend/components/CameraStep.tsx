import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useMood } from '../services/mood';

const COUNTDOWN = 5; // enregistrement vidéo

export default function CameraStep({ onNext }: { onNext: () => void }) {
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [step, setStep] = useState<'idle' | 'recording' | 'done'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN);
  const { setVideoUri } = useMood();

  const countdownAnim = useRef(new Animated.Value(1)).current;

  // Gestion permission refusée
  useEffect(() => {
    if (
        cameraPermission?.status === 'denied' ||
        micPermission?.status === 'denied'
    ) {
      if (onNext) onNext();
    }
  }, [cameraPermission, micPermission]);

  const handleStart = async () => {
    setStep('recording');
    setSecondsLeft(COUNTDOWN);
    // Démarre l'enregistrement vidéo puis compte à rebours
    if (cameraRef.current) {
      try {
        // Lance le chrono pour afficher l'UI du countdown
        let sec = COUNTDOWN;
        const interval = setInterval(() => {
          sec--;
          setSecondsLeft(sec);
          Animated.sequence([
            Animated.timing(countdownAnim, { toValue: 1.4, duration: 240, useNativeDriver: true }),
            Animated.timing(countdownAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
          ]).start();
          if (sec <= 0) {
            clearInterval(interval);
          }
        }, 1000);

        // recordAsync s'arrêtera automatiquement après 5s (maxDuration)
        const video = await cameraRef.current.recordAsync({ maxDuration: COUNTDOWN });

        // Après 5s
        if (video && video.uri) {
          setVideoUri(video.uri);
        }
        setStep('done');
        setTimeout(() => {
          if (onNext) onNext();
        }, 1300);
      } catch (e) {
        setStep('idle');
        if (onNext) onNext();
      }
    }
  };

  if (!cameraPermission || !micPermission) {
    return <View style={styles.container}><Text>Demande de permissions...</Text></View>;
  }
  if (!cameraPermission.granted || !micPermission.granted) {
    return (
        <View style={styles.container}>
          <Text>Permission refusée pour la caméra ou le micro.</Text>
          <TouchableOpacity style={styles.buttonRecord} onPress={() => { requestCameraPermission(); requestMicPermission(); }}>
            <Text style={styles.text}>Accorder Permissions</Text>
          </TouchableOpacity>
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            mode="video"
        />

        <View style={styles.controls}>
          {/* Avant enregistrement */}
          {step === 'idle' && (
              <>
                <Text style={styles.infoText}>
                  <Text style={{ fontSize: 18 }}>🎬</Text> Prépare-toi à filmer autour de toi !
                </Text>
                <TouchableOpacity style={styles.buttonRecord} onPress={handleStart}>
                  <Text style={styles.text}>Enregistrer</Text>
                </TouchableOpacity>
              </>
          )}

          {/* Pendant l'enregistrement */}
          {step === 'recording' && (
              <View style={{ alignItems: 'center', marginTop: 24 }}>
                <Text style={{ fontSize: 22, color: '#fff', fontWeight: 'bold' }}>🎥 Enregistrement...</Text>
                <Animated.Text style={{
                  fontSize: 46,
                  color: '#50f3bb',
                  fontWeight: 'bold',
                  marginTop: 12,
                  opacity: 0.92,
                  transform: [{ scale: countdownAnim }]
                }}>
                  {secondsLeft}
                </Animated.Text>
                <Text style={{ color: '#fff', marginTop: 6, fontSize: 16 }}>
                  secondes restantes
                </Text>
              </View>
          )}

          {/* Validation */}
          {step === 'done' && (
              <View style={{ alignItems: 'center', marginTop: 30 }}>
                <Text style={{ fontSize: 46, color: '#50f3bb', fontWeight: 'bold' }}>✅</Text>
                <Text style={{ color: '#fff', marginTop: 8, fontSize: 19, fontWeight: '600' }}>
                  Vidéo enregistrée !
                </Text>
              </View>
          )}
        </View>
      </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 4,
    width: "100%",
  },
  controls: {
    flex: 1.1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRecord: {
    backgroundColor: '#50f3bb',
    padding: 16,
    borderRadius: 32,
    width: 210,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#50f3bb',
    shadowOpacity: 0.17,
    shadowRadius: 8,
    elevation: 2,
  },
  text: {
    color: '#000',
    fontSize: 21,
    fontWeight: 'bold'
  },
  infoText: {
    color: '#fff',
    fontSize: 17,
    marginBottom: 18,
    fontWeight: '600',
    textAlign: 'center'
  },
});
