import { View, Text, Button } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

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

  let message;
  if (step === 1) message = 'Étape 1';
  else if (step === 2) message = 'Étape 2';
  else message = 'Étape 3';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: 'white', marginBottom: 20 }}>{message}</Text>
      <Button title={step < 3 ? 'Suivant' : 'Terminer'} onPress={next} />
    </View>
  );
}
