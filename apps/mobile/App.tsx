import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.phoneFrame}>
        <View style={styles.notch} />
        <View style={styles.content}>
          <Text style={styles.eyebrow}>FliHub</Text>
          <Text style={styles.title}>Fantasy League</Text>
          <Text style={styles.subtitle}>1 owner + 5 participants</Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>League Status</Text>
            <Text style={styles.cardValue}>Open / Ready to Draft</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Next Event</Text>
            <Text style={styles.cardValue}>Fantasy Draft</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020817',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 420,
    height: '100%',
    maxHeight: 900,
    backgroundColor: '#f8fafc',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#0f172a',
    overflow: 'hidden',
  },
  notch: {
    height: 32,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#f8fafc',
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#475569',
  },
  card: {
    marginTop: 18,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#cbd5e1',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  cardLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  cardValue: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
});
