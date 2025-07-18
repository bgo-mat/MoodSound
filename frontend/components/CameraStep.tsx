import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Button, Text, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export default function CameraStep() {
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  useEffect(() => {
    if (!cameraPermission?.granted) requestCameraPermission();
    if (!micPermission?.granted) requestMicPermission();
  }, []);

  const saveVideo = async () => {
    if (videoUri) {
      //TODO envoyer la vidéo au back icicicic
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
        setVideoUri(video.uri);
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
