import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Button, Text, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useMood } from '../services/mood'

export default function CameraStep({ onNext }: { onNext: () => void }) {
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [recording, setRecording] = useState(false);
  const [videoUri, setLocalVideoUri] = useState<string | null>(null);
  const { setVideoUri } = useMood();

  useEffect(() => {
    if (!cameraPermission?.granted) requestCameraPermission();
    if (!micPermission?.granted) requestMicPermission();
  }, []);

  const saveVideo = async () => {
    if (videoUri) {
      setVideoUri(videoUri);
    }
  };

  const startRecording = async () => {
    if (cameraRef.current && !recording) {
      try {
        setRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 60, // max 60 sec
        });
        // @ts-ignore
        setLocalVideoUri(video.uri);
      } catch (error) {
        console.error("Recording error:", error);
        setRecording(false);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && recording) {
      cameraRef.current.stopRecording();
      setRecording(false);
      await saveVideo();
      if (onNext) onNext();
    }
  };

  if (!cameraPermission || !micPermission) {
    return <View style={styles.container}><Text>Demande de permissions...</Text></View>;
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
        <View style={styles.container}>
          <Text>Permission refusée pour la caméra ou le micro.</Text>
          <Button title="Accorder Permissions" onPress={() => { requestCameraPermission(); requestMicPermission(); }} />
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
          {!recording ? (
              <TouchableOpacity style={styles.buttonRecord} onPress={startRecording}>
                <Text style={styles.text}>Enregistrer</Text>
              </TouchableOpacity>
          ) : (
              <TouchableOpacity style={styles.buttonStop} onPress={stopRecording}>
                <Text style={styles.text}>Arrêter</Text>
              </TouchableOpacity>
          )}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:"100%",
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 4,
    width:"100%",
  },
  controls: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRecord: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
  },
  buttonStop: {
    backgroundColor: 'gray',
    padding: 15,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
  uriText: {
    color: 'white',
    marginTop: 15,
    textAlign: 'center',
  },
});
