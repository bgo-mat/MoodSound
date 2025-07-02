import { View, Button } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import CameraStep from './CameraStep';
import MicrophoneStep from './MicrophoneStep';
import ActivityStep from './ActivityStep';

export default function TestMoodScreen() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const next = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      router.replace('/');
    }
  };

  let content;
  if (step === 1) content = <CameraStep />;
  else if (step === 2) content = <MicrophoneStep />;
  else content = <ActivityStep />;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {content}
      <Button title={step < 3 ? 'Suivant' : 'Terminer'} onPress={next} />
    </View>
  );
}
