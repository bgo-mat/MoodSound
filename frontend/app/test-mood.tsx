import { View, Button } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import CameraStep from '../components/CameraStep';
import MicrophoneStep from '../components/MicrophoneStep';
import ActivityStep from '../components/ActivityStep';
import EnergieStep from "../components/EnergieStep";
import HappyStep from "../components/HappyStep";
import { useMood } from '../services/mood';
import api from '../services/api';
import WaitingBackend from "@/components/waitingBackend";
import {AnimatePresence, MotiView} from "moti";
import EnvironnementStep from "@/components/EnvironnementStep";

export default function TestMoodScreen() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const {
    audioUri,
    videoUri,
    activityData,
    happiness,
    energy,
  } = useMood();

  const next = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      setStep(step + 1);
      sendToBackend();
    }
  };

  async function sendToBackend() {
    const payload = {
      audioUri,
      videoUri,
      activity: activityData,
      happiness,
      energy,
    };
    console.log(payload)

    try {

      await api.post('/test-mood/', payload);
      // TODO Redirection après envoie
      router.replace('/');
    } catch (error) {
      // console.error('Erreur d\'envoi au backend:', error);
      // TODO gestion error
    }
  }

  let content;
  if (step === 1) content = <CameraStep onNext={next} />;
  else if (step === 2) content = <MicrophoneStep onNext={next}/>;
  else if (step === 3) content = <ActivityStep onNext={next}/>;
  else if (step === 4) content = <EnvironnementStep onNext={next}/>;
  else if (step === 5) content = <EnergieStep onNext={next}/>;
  else if (step === 6) content = <HappyStep onNext={next}/>;
  else if (step === 7) content = <WaitingBackend/>

  return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence exitBeforeEnter>
          <MotiView
              key={step}
              from={{ opacity: 0, translateY: 24 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -24 }}
              transition={{ type: 'timing', duration: 400 }}
              style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
          >
            {content}
          </MotiView>
        </AnimatePresence>
      </View>
  );
}
