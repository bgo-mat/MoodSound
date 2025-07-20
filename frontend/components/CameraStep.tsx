import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useMood } from '../services/mood';
import api from '../services/api';

const COUNTDOWN = 5;

export default function CameraStep({ onNext }: { onNext: () => void }) {
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [step, setStep] = useState<'idle' | 'recording' | 'done'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const { setVideoUri, setVideoUrl, setVideoUploading, videoUploading } = useMood();
  const [uploadError, setUploadError] = useState<boolean>(false);

  // Pour l’animation du border progress
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!cameraPermission) requestCameraPermission();
    if (!micPermission) requestMicPermission();
  }, [cameraPermission, micPermission]);

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

    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: COUNTDOWN * 1000,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();

    if (cameraRef.current) {
      try {
        let sec = COUNTDOWN;
        const interval = setInterval(() => {
          sec--;
          setSecondsLeft(sec);
          if (sec <= 0) clearInterval(interval);
        }, 1000);

        const video = await cameraRef.current.recordAsync({ maxDuration: COUNTDOWN });
        if (video && video.uri) {
          setVideoUri(video.uri);
          setVideoUploading(true);
          api.uploadVideo(video.uri)
              .then(url => {
                setVideoUrl(url);
              })
              .catch(() => setUploadError(true))
              .finally(() => setVideoUploading(false));
        }
        setStep('done');
        setTimeout(() => { if (onNext) onNext(); }, 1300);
      } catch (e) {
        setStep('idle');
        if (onNext) onNext();
      }
    }
  };

  const handleSwitchCamera = () => {
    setFacing(f => (f === 'back' ? 'front' : 'back'));
  };

  // Pour dessiner le border progress circulaire
  const strokeWidth = 7;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  const animatedStrokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  if (cameraPermission?.status !== 'granted' || micPermission?.status !== 'granted') {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
          <Text style={{ color: "#fff" }}>Demande de permissions caméra et micro...</Text>
        </View>
    );
  }

  // Sinon, rendu normal avec la caméra
  return (
      <View style={styles.container}>
        <CameraView
            key={cameraPermission.status + '-' + micPermission.status}
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            mode="video"
        />

        <TouchableOpacity style={styles.switchBtn} onPress={handleSwitchCamera}>
          <Text style={styles.switchIcon}>🔄</Text>
        </TouchableOpacity>

        <View style={styles.controls}>
          {step === 'idle' && (
              <View style={styles.previewContainer}>
                <Text style={styles.infoText}>
                  <Text style={{ fontSize: 18 }}>🎬</Text> Filme autour de toi !
                </Text>
                <TouchableOpacity style={styles.buttonRecord} onPress={handleStart}>
                  <Text style={styles.text}>Commencer</Text>
                </TouchableOpacity>
              </View>
          )}
          {(step === 'recording' || step === 'done') && (
              <View style={styles.previewContainer}>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <View style={{ position: 'relative', width: 108, height: 108, alignItems: 'center', justifyContent: 'center' }}>
                    <Animated.View style={{ position: 'absolute', top: 0, left: 0 }}>
                      <Svg width={108} height={108}>
                        <Circle
                            cx={54}
                            cy={54}
                            r={radius}
                            stroke="#333a"
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        <AnimatedCircle
                            cx={54}
                            cy={54}
                            r={radius}
                            stroke="#50f3bb"
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={animatedStrokeDashoffset}
                            strokeLinecap="round"
                        />
                      </Svg>
                    </Animated.View>
                    {step === 'done' && (
                        <Text style={{ fontSize: 54, textAlign: 'center', color: '#fff', zIndex: 2 }}>✅</Text>
                    )}
                    {step === 'recording' && (
                        <Text style={{ fontSize: 54, textAlign: 'center', color: '#fff', zIndex: 2 }}>🎥</Text>
                    )}
                  </View>
                  {step === 'recording' && (
                      <Text style={{ color: '#fff', fontSize: 19, fontWeight: 'bold', marginTop:4 }}>Enregistrement...</Text>
                  )}
                  {step === 'done' && (
                      <Text style={{ color: '#fff', fontSize: 19, fontWeight: 'bold' , marginTop:4}}>Parfait !</Text>
                  )}
                </View>
              </View>
          )}
        </View>
      </View>
  );
}

// Pour l’animation SVG
import Svg, { Circle } from 'react-native-svg';
import { Animated as RNAnimated } from 'react-native';

const AnimatedCircle = RNAnimated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  previewContainer: {
    backgroundColor: '#202530cc',
    borderRadius: 30,
    padding: 34,
    shadowColor: '#000',
    shadowRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: "80%",
    minHeight: 180,
    marginBottom: 28,
  },
  camera: {
    flex: 4,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  switchBtn: {
    position: 'absolute',
    top: 36,
    right: 26,
    zIndex: 20,
    backgroundColor: '#202530cc',
    borderRadius: 32,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#50f3bb',
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  switchIcon: {
    fontSize: 26,
    color: '#fff',
  },
  controls: {
    flex: 1.1,
    padding: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonRecord: {
    backgroundColor: '#50f3bb',
    padding: 12,
    borderRadius: 32,
    alignItems: 'center',
    shadowColor: '#50f3bb',
    shadowOpacity: 0.17,
    shadowRadius: 8,
    elevation: 2,
    minWidth: 110,
    marginTop: 18,
  },
  text: {
    color: '#000',
    fontSize: 15,
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
