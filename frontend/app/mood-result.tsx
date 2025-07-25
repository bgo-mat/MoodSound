import React, {useEffect, useRef, useState} from "react";
import {View, Text, Image, Dimensions, StyleSheet, TouchableOpacity, Platform, ScrollView, Linking} from "react-native";
import { Audio } from "expo-av";
import { FlatList } from "react-native";
import { usePreviewSong } from "../services/PreviewSong"
import {router} from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

export default function MoodResult() {
    const { tracksData,setTracksData } = usePreviewSong();
    const [playingIdx, setPlayingIdx] = useState<number | null>(null);
    const soundRef = useRef<Audio.Sound | null>(null);

    const restart = ()=>{
        setTracksData([]);
        router.push('/test-mood')
    }
    // Fonction pour jouer la preview
    const playPreview = async (url: string, idx: number) => {
        try {
            // Stoppe l'ancienne
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }
            setPlayingIdx(idx);
            const { sound } = await Audio.Sound.createAsync({ uri: url });
            soundRef.current = sound;
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate(status => {
                if (status.isLoaded && status.didJustFinish) setPlayingIdx(null);
            });
        } catch (e) {
            setPlayingIdx(null);
        }
    };

    // Arrête la musique à l’unmount du composant
    React.useEffect(() => {
        return () => { if (soundRef.current) soundRef.current.unloadAsync(); };
    }, []);

    // Rendu d’un item du carrousel
    const renderItem = ({ item, index }: any) => (
        <View style={styles.card}>
            <Image source={{ uri: item.album.images[0].url }} style={styles.image} />
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.artist}>{item.artists.map((a: any) => a.name).join(", ")}</Text>

            {item.preview_url ? (
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => playPreview(item.preview_url, index)}
                >
                    <Text style={styles.playButtonText}>
                        {playingIdx === index ? "⏸ Stop" : "▶️ Play preview"}
                    </Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.noPreview}>Aucun extrait dispo</Text>
            )}

            <TouchableOpacity
                style={styles.spotifyButton}
                onPress={() => {
                    if (Platform.OS === "web") {
                        window.open(item.external_urls.spotify, "_blank");
                    } else {
                        Linking.openURL(item.external_urls.spotify);
                    }
                }}
            >
                <Text style={styles.spotifyButtonText}>Ouvrir sur Spotify</Text>
            </TouchableOpacity>
        </View>
    );

    if (!tracksData?.length) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Aucune recommandation de musique trouvée.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#181818", paddingLeft:15, paddingTop:24 }}>
            <Text style={styles.header}>Voici ta sélection musicale</Text>
            <FlatList
                data={tracksData}
                renderItem={renderItem}
                keyExtractor={(_, i) => i.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ width: 24 }} />}
            />
            <TouchableOpacity style={styles.buttonRecord} onPress={() => restart()}>
                <Text style={styles.text}>Recommencer</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 22,
        textAlign: "center",
        marginVertical: 24,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: "#222a",
        borderRadius: 20,
        padding: 28,
        alignItems: "center",
        shadowColor: "#333",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 3,
        height: "80%",
        width:340
    },
    image: {
        width: 180,
        height: 180,
        borderRadius: 12,
        marginBottom: 18,
    },
    title: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "600",
        marginTop: 10,
        marginBottom: 3,
        textAlign: "center",
    },
    artist: {
        color: "#a9e1cb",
        fontSize: 15,
        marginBottom: 12,
        textAlign: "center",
    },
    buttonRecord: {
        position: "absolute",
        bottom: "5%",
        left: "50%",
        backgroundColor: '#50f3bb',
        padding: 12,
        borderRadius: 32,
        alignItems: 'center',
        shadowColor: '#50f3bb',
        shadowOpacity: 0.17,
        shadowRadius: 8,
        elevation: 2,
        minWidth: 210,
        transform: [{ translateX: -105 }],
    },
    text: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold'
    },
    playButton: {
        backgroundColor: "#1db954",
        borderRadius: 22,
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginVertical: 15,
    },
    playButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    noPreview: {
        color: "#ff9090",
        marginVertical: 12,
        fontSize: 13,
    },
    spotifyButton: {
        backgroundColor: "#1DB95433",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 18,
        marginTop: 15,
    },
    spotifyButtonText: {
        color: "#1DB954",
        fontWeight: "600",
        fontSize: 15,
        letterSpacing: 0.5,
    }
});
