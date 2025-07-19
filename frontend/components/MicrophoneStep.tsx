import { View, Text } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useMood } from '../services/mood';
import { Audio } from 'expo-av';

export default function MicrophoneStep({ onNext }: { onNext: () => void }) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const { setAudioUri } = useMood();
  const timerRef = useRef<number | null>(null);

  // Démarre l'enregistrement au montage
  useEffect(() => {
    let rec: Audio.Recording;

    const startRecording = async () => {
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) return;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await rec.startAsync();
        setRecording(rec);
        setUri(null);

        // Stop automatique après 10s
        timerRef.current = setTimeout(() => {
          stopRecording(rec);
        }, 10000);
      } catch (err) {
        console.error('Failed to start recording', err);
      }
    };

    startRecording();

    // Cleanup si le composant démonte avant la fin
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rec) {
        rec.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  // Fonction de stop modifiée
  const stopRecording = async (recToStop?: Audio.Recording) => {
    const rec = recToStop ?? recording;
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
    }
  };

  return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white', fontSize: 18, marginBottom: 8 }}>
          {recording ? "Enregistrement en cours..." : "Enregistrement terminé !"}
        </Text>
        {uri && (
            <Text style={{ color: 'white', marginTop: 10 }}>Fichier: {uri}</Text>
        )}
      </View>
  );
}
