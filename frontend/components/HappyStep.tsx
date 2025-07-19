import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMood } from '../services/mood';
import { AnimatePresence, MotiView, MotiText } from 'moti';

const smileys = [
    { emoji: '😢', label: 'Très triste' },
    { emoji: '🙁', label: 'Triste' },
    { emoji: '😐', label: 'Neutre' },
    { emoji: '🙂', label: 'Heureux' },
    { emoji: '😄', label: 'Très heureux' },
];

export default function HappyStep({ onNext }: { onNext: () => void }) {
    const { happiness, setHappiness } = useMood();
    const [locked, setLocked] = useState(false);

    // RESET à chaque affichage du composant
    useEffect(() => {
        setHappiness(null);
        setLocked(false);
    }, [setHappiness]);

    const handleSelect = (idx: number) => {
        if (locked) return;
        setHappiness(idx + 1);
        setLocked(true);
        setTimeout(() => {
            if (onNext) onNext();
        }, 700);
    };

    // Affichage unique et centré si verrouillé
    if (locked && happiness) {
        const selected = smileys[happiness - 1];
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Comment tu te sens&nbsp;?</Text>
                <View style={[styles.smileyRow, { justifyContent: 'center' }]}>
                    <MotiView
                        from={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 2, opacity: 1 }}
                        transition={{ type: 'timing', duration: 400 }}
                        style={styles.smileyBtn}
                    >
                        {/* @ts-ignore */}
                        <MotiText
                            style={[styles.smiley, styles.smileySelected]}
                            // @ts-ignore
                            from={{ fontSize: 34 }}
                            // @ts-ignore
                            animate={{ fontSize: 64 }}
                            transition={{ type: 'timing', duration: 400 }}
                        >
                            {selected.emoji}
                        </MotiText>
                    </MotiView>
                </View>
                <Text style={styles.label}>{selected.label}</Text>
            </View>
        );
    }

    // Affichage classique avant choix
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Comment tu te sens&nbsp;?</Text>
            <View style={styles.smileyRow}>
                <AnimatePresence>
                    {smileys.map((item, idx) => (
                        <MotiView
                            key={idx}
                            from={{
                                scale: 1,
                                opacity: 1,
                            }}
                            animate={{
                                scale: happiness === idx + 1 ? 1.2 : 1,
                                opacity: happiness === idx + 1 ? 1 : 0.6,
                            }}
                            transition={{
                                type: 'timing',
                                duration: 400,
                            }}
                            style={[
                                styles.smileyBtn,
                                happiness === idx + 1 && styles.selected,
                            ]}
                        >
                            <TouchableOpacity
                                disabled={locked}
                                onPress={() => handleSelect(idx)}
                                accessibilityLabel={item.label}
                                style={{ alignItems: 'center', justifyContent: 'center' }}
                            >
                                {/* @ts-ignore */}
                                <MotiText
                                    style={[
                                        styles.smiley,
                                        happiness === idx + 1 && styles.smileySelected
                                    ]}
                                    // @ts-ignore
                                    from={{ fontSize: 34 }}
                                    // @ts-ignore
                                    animate={{ fontSize: happiness === idx + 1 ? 48 : 34 }}
                                    transition={{ type: 'timing', duration: 400 }}
                                >
                                    {item.emoji}
                                </MotiText>
                            </TouchableOpacity>
                        </MotiView>
                    ))}
                </AnimatePresence>
            </View>
            <Text style={styles.label}>
                {happiness && happiness > 0
                    ? smileys[happiness - 1].label
                    : 'Sélectionne un mood'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginTop: 30 },
    title: { color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 20 },
    smileyRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 10,
        minHeight: 80,
        alignItems: 'center',
        justifyContent: 'center'
    },
    smileyBtn: {
        padding: 8,
        borderRadius: 24,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selected: {
        backgroundColor: '#222a',
        borderColor: '#fff',
    },
    smiley: { fontSize: 34, opacity: 0.6 },
    smileySelected: { opacity: 1 },
    label: { color: '#fff', fontSize: 16, marginTop: 10 },
});
