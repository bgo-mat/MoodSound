import React, { createContext, useContext, useState } from 'react';

export interface ActivityData {
    activityLevel: string | null;
    speedLevel: string | null;
}

export interface EnvironnementData{
    country: string | null;
    region: string | null;
    weather:any
}

export interface MoodContextValue {
    audioUri: string | null;
    setAudioUri: (uri: string | null) => void;
    videoUri: string | null;
    setVideoUri: (uri: string | null) => void;
    activityData: ActivityData | null;
    setActivityData: (data: ActivityData) => void;
    happiness: string | null;
    setHappiness: (h: string | null) => void;
    energy: string | null;
    setEnergy: (e: string | null) => void;
    environnementData: EnvironnementData | null,
    setEnvironnementData: (data: EnvironnementData) => void
}

const MoodContext = createContext<MoodContextValue | undefined>(undefined);

export function MoodProvider({ children }: { children: React.ReactNode }) {
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [activityData, setActivityDataState] = useState<ActivityData | null>(null);
    const [happiness, setHappiness] = useState<string | null>(null);
    const [energy, setEnergy] = useState<string | null>(null);
    const [environnementData, setEnvironnementData] = useState<EnvironnementData | null>(null);

    const setActivityData = (data: ActivityData) => {
        setActivityDataState(data);
    };

    return (
        <MoodContext.Provider
            value={{
                audioUri,
                setAudioUri,
                videoUri,
                setVideoUri,
                activityData,
                setActivityData,
                happiness,
                setHappiness,
                energy,
                setEnergy,
                environnementData,
                setEnvironnementData
            }}
        >
            {children}
        </MoodContext.Provider>
    );
}

export function useMood() {
    const ctx = useContext(MoodContext);
    if (!ctx) throw new Error('useMood must be used within MoodProvider');
    return ctx;
}
