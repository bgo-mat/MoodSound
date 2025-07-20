import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../services/auth';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { token } = useAuth();
  const router = useRouter();

  return (
      <View style={styles.bg}>
        <View style={styles.container}>
          <Text style={styles.logo}>🧠</Text>
          <Text style={styles.mainTitle}>MOODSOUND</Text>
          <Text style={styles.title}>Bienvenue !</Text>
          <Text style={styles.subtitle}>
            Découvre la playlist qui colle à ton humeur du moment.<Text style={{ color: '#50f3bb' }}> Analyse IA instantanée !</Text>
          </Text>

          <TouchableOpacity
              style={styles.cta}
              onPress={() => router.push('/test-mood')}
          >
            <Text style={styles.ctaText}>Tester mon mood</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>— Ta vibe du jour, sur mesure —</Text>
      </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#ffffff11',
    borderRadius: 32,
    padding: 32,
    width: width * 0.87,
    alignItems: 'center',
    shadowColor: '#1db954',
    shadowOpacity: 0.09,
    shadowRadius: 42,
    elevation: 4,
  },
  logo: {
    fontSize: 56,
    marginBottom: 10,
    textAlign: 'center',
  },
  mainTitle:{
    color: '#50f3bb',
    fontSize: 38,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ededed',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.93,
    marginBottom: 28,
    maxWidth: 320,
    lineHeight: 22,
  },
  cta: {
    backgroundColor: '#50f3bb',
    borderRadius: 28,
    paddingHorizontal: 38,
    paddingVertical: 16,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#50f3bb',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaText: {
    color: '#181818',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  hint: {
    color: '#50f3bb',
    fontSize: 15,
    marginTop: 40,
    textAlign: 'center',
    letterSpacing: 0.3,
    fontWeight: '600',
  }
});
