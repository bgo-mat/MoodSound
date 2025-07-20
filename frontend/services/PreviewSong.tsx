// src/context/PreviewSongContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

type SpotifyTrack = {
    id: string;
    name: string;
    artists: { name: string }[];
    preview_url: string | null;
    album: { images: { url: string }[] };
    external_urls: { spotify: string };
};

type PreviewSongContextType = {
    musics: string[];
    setMusics: (titles: string[]) => void;
    tracksData: SpotifyTrack[];
    setTracksData: (tracks: SpotifyTrack[]) => void;
    spotifyToken: string | null;
    setSpotifyToken: (token: string) => void;
    spotifyClientToken: string | null;
    setSpotifyClientToken: (token: string) => void;
    spotifySecretToken: string | null;
    setSpotifySecretToken: (token: string) => void;
    fetchSpotifyTracks: (titles: string[], secret_token:string, client_token:string) => Promise<void>;
};

const PreviewSongContext = createContext<PreviewSongContextType | undefined>(undefined);

export const PreviewSongProvider = ({ children }: { children: ReactNode }) => {
    const [musics, setMusics] = useState<string[]>([]);
    const [tracksData, setTracksData] = useState<SpotifyTrack[]  >([]);
    const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
    const [spotifyClientToken, setSpotifyClientToken] = useState<string | null>(null);
    const [spotifySecretToken, setSpotifySecretToken] = useState<string | null>(null);

    const getToken = async (secret_token: string, client_token:string) => {
        const encoded = btoa(`${spotifyClientToken ? spotifyClientToken : client_token}:${spotifySecretToken ? spotifySecretToken : secret_token}`);
        const res = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${encoded}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        });
        const data = await res.json();
        setSpotifyToken(data.access_token);
        return data.access_token;
    };

    const fetchSpotifyTracks = async (titles: string[], secret_token:string, client_token:string) => {

        let token = "";
        if (!spotifyToken) {
            token = await getToken(secret_token, client_token);
        }else {
            token = spotifyToken
        }

        const results: SpotifyTrack[] = [];
        for (const title of titles) {
            const query = encodeURIComponent(title);
            const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;
            try {
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.tracks && data.tracks.items.length > 0) {
                    results.push(data.tracks.items[0]);
                } else {
                    console.warn(`[DEBUG][fetchSpotifyTracks] No track found for "${title}". Full response:`, data);
                }
            } catch (err) {
                console.log(err)
            }
        }
        setTracksData(results.filter(Boolean) as SpotifyTrack[]);
    };


    return (
        <PreviewSongContext.Provider value={{
            musics, setMusics,
            tracksData, setTracksData,
            spotifyToken, setSpotifyToken,
            spotifyClientToken, setSpotifyClientToken,
            spotifySecretToken,setSpotifySecretToken,
            fetchSpotifyTracks
        }}>
            {children}
        </PreviewSongContext.Provider>
    );
};

export function usePreviewSong() {
    const ctx = useContext(PreviewSongContext);
    if (!ctx) throw new Error("usePreviewSong must be used within PreviewSongProvider");
    return ctx;
}
