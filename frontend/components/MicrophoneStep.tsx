import { View, Text, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { useMood } from '../services/mood';
import { Audio } from 'expo-av';

export default function MicrophoneStep() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const { setAudioUri } = useMood();

  useEffect(() => {
    Audio.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        // Use high quality preset for recording
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await rec.startAsync();
      setRecording(rec);
      setUri(null);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setUri(uri);

      // Store audio uri in context for later use
      setAudioUri(uri ?? null);

    } catch (err) {
      console.error('Failed to stop recording', err);
    } finally {
      setRecording(null);
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
      {uri && (
        <Text style={{ color: 'white', marginTop: 10 }}>Fichier: {uri}</Text>
      )}
    </View>
  );
}
