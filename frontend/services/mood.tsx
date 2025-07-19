import React, { createContext, useContext, useState } from 'react';

export interface ActivityData {
    activityLevel: string | null;
    speedLevel: string | null;
    country: string | null;
    region: string | null;
}

export interface MoodContextValue {
    audioUri: string | null;
    setAudioUri: (uri: string | null) => void;
    videoUri: string | null;
    setVideoUri: (uri: string | null) => void;
    activityData: ActivityData | null;
    setActivityData: (data: ActivityData) => void;
    happiness: number | null;
    setHappiness: (h: number | null) => void;
    energy: number | null;
    setEnergy: (e: number | null) => void;
    weather: any;
    setWeather: (w: any) => void;
}

const MoodContext = createContext<MoodContextValue | undefined>(undefined);

export function MoodProvider({ children }: { children: React.ReactNode }) {
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [activityData, setActivityDataState] = useState<ActivityData | null>(null);
    const [happiness, setHappiness] = useState<number | null>(null);
    const [energy, setEnergy] = useState<number | null>(null);
    const [weather, setWeather] = useState<any>(null);

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
                weather,
                setWeather,
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
