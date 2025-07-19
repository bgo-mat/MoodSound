import React, { createContext, useContext, useState } from 'react';

export interface ActivityData {
  activityLevel: string | null;
  speedLevel: string | null;
  country: string | null;
  region: string | null;
}

interface MoodContextValue {
  audioUri: string | null;
  setAudioUri: (uri: string | null) => void;
  activityData: ActivityData | null;
  setActivityData: (data: ActivityData) => void;
}

const MoodContext = createContext<MoodContextValue | undefined>(undefined);

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [activityData, setActivityDataState] = useState<ActivityData | null>(null);

  const setActivityData = (data: ActivityData) => {
    setActivityDataState(data);
  };

  return (
    <MoodContext.Provider value={{ audioUri, setAudioUri, activityData, setActivityData }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error('useMood must be used within MoodProvider');
  return ctx;
}
