import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useMood } from '../services/mood';
import { AnimatePresence, MotiView, MotiText } from 'moti';

const energyLevels = [
    { emoji: '🛌', label: 'Fatigué', value: 1 },
    { emoji: '🙂', label: 'Normal', value: 2 },
    { emoji: '⚡️', label: 'En forme', value: 3 },
];

export default function EnergieStep({ onNext }: { onNext: () => void }) {
    const { energy, setEnergy } = useMood();
    const [locked, setLocked] = useState(false);

    // RESET à chaque affichage du composant
    useEffect(() => {
        setEnergy(null);
        setLocked(false);
    }, [setEnergy]);

    const handleSelect = (item: any) => {
        if (locked) return;
        setEnergy(item.label);
        setLocked(true);
        setTimeout(() => {
            if (onNext) onNext();
        }, 700);
    };

    // Affichage unique et centré si verrouillé
    if (locked && energy) {
        const selected = energyLevels.find(e => e.label === energy);
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Ton niveau d'énergie&nbsp;?</Text>
                <View style={[styles.row, { justifyContent: 'center' }]}>
                    <MotiView
                        from={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 2, opacity: 1 }}
                        transition={{ type: 'timing', duration: 400 }}
                        style={styles.btn}
                    >
                        {/* @ts-ignore */}
                        <MotiText
                            style={[styles.emoji, styles.emojiSelected]}
                            // @ts-ignore
                            from={{ fontSize: 32 }}
                            // @ts-ignore
                            animate={{ fontSize: 64 }}
                            transition={{ type: 'timing', duration: 400 }}
                        >
                            {selected?.emoji}
                        </MotiText>
                        <Text style={[styles.label, styles.labelSelected]}>{selected?.label}</Text>
                    </MotiView>
                </View>
            </View>
        );
    }

    // Affichage classique avant choix
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ton niveau d'énergie&nbsp;?</Text>
            <View style={styles.row}>
                <AnimatePresence>
                    {energyLevels.map((item) => (
                        <MotiView
                            key={item.value}
                            from={{
                                scale: 1,
                                opacity: 1,
                            }}
                            animate={{
                                scale: energy === item.label ? 1.2 : 1,
                                opacity: energy === item.label ? 1 : 0.65,
                            }}
                            transition={{
                                type: 'timing',
                                duration: 400,
                            }}
                            style={[
                                styles.btn,
                                energy === item.label && styles.selected,
                            ]}
                        >
                            <TouchableOpacity
                                disabled={locked}
                                onPress={() => handleSelect(item)}
                                accessibilityLabel={item.label}
                                style={{ alignItems: 'center', justifyContent: 'center' }}
                            >
                                {/* @ts-ignore */}
                                <MotiText
                                    style={[
                                        styles.emoji,
                                        energy === item.label && styles.emojiSelected
                                    ]}
                                    // @ts-ignore
                                    from={{ fontSize: 32 }}
                                    // @ts-ignore
                                    animate={{ fontSize: energy === item.value ? 48 : 32 }}
                                    transition={{ type: 'timing', duration: 400 }}
                                >
                                    {item.emoji}
                                </MotiText>
                                <Text style={[
                                    styles.label,
                                    energy === item.label && styles.labelSelected
                                ]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        </MotiView>
                    ))}
                </AnimatePresence>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginTop: 30 },
    title: { color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 80 },
    row: { flexDirection: 'row', gap: 20, marginBottom: 10, minHeight: 80, alignItems: 'center', justifyContent: 'center' },
    btn: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 24,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'transparent',
        minWidth: 70,
    },
    selected: {
        backgroundColor: '#222a',
        borderColor: '#fff',
    },
    emoji: { fontSize: 32, opacity: 0.65 },
    emojiSelected: { opacity: 1 },
    label: { color: '#fff', marginTop: 5, fontSize: 13, opacity: 0.65 },
    labelSelected: { opacity: 1, fontWeight: 'bold' },
    status: { color: '#fff', fontSize: 15, marginTop: 12 },
});
