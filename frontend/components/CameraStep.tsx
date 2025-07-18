import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { Camera, CameraType } from 'expo-camera';

export default function CameraStep() {
  const [permission, setPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const camera = await Camera.requestCameraPermissionsAsync();
      const audio = await Camera.requestMicrophonePermissionsAsync();
      setPermission(camera.status === 'granted' && audio.status === 'granted');
    })();

    return () => {
      cameraRef.current?.stopRecording();
    };
  }, []);

  const startRecording = async () => {
    if (!cameraRef.current) return;
    try {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync();
      setVideoUri(video.uri);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  if (permission === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Requesting permissions...</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        ref={cameraRef}
        type={CameraType.back}
        ratio="16:9"
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 10 }}>
        {!isRecording ? (
          <Button title="Start Recording" onPress={startRecording} />
        ) : (
          <Button title="Stop Recording" onPress={stopRecording} />
        )}
      </View>
      {videoUri && (
        <Text style={{ color: 'white', textAlign: 'center' }}>Video saved to: {videoUri}</Text>
      )}
    </View>
  );
}
