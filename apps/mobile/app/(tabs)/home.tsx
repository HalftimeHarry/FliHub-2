import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.statusBarRow}>
          <Text style={styles.time}>9:41</Text>
          <Text style={styles.statusMeta}>5G · 100%</Text>
        </View>

        <Text style={styles.eyebrow}>FliHub</Text>
        <Text style={styles.title}>Fantasy League Home</Text>
        <Text style={styles.body}>League activity, scheduled tournaments, and recent draft status.</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroBadge}>League Ready</Text>
          <Text style={styles.heroTitle}>Open / Ready to Draft</Text>
          <Text style={styles.heroSubtext}>1 owner + 5 participants</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Next Event</Text>
          <Text style={styles.cardValue}>Fantasy Draft</Text>
          <Text style={styles.cardMeta}>Thu • 7:00 PM</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Members</Text>
          <Text style={styles.cardValue}>6 total</Text>
          <Text style={styles.cardMeta}>5 approved + owner</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#f8fafc',
  },
  statusBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 8,
  },
  time: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusMeta: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#2563eb',
    fontWeight: '700',
  },
  title: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
  },
  body: {
    marginTop: 10,
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
  },
  heroCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#0f172a',
    shadowColor: '#0f172a',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1d4ed8',
    color: '#eff6ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
  },
  heroSubtext: {
    marginTop: 6,
    color: '#cbd5e1',
    fontSize: 15,
  },
  card: {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#cbd5e1',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
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
  cardMeta: {
    marginTop: 6,
    color: '#475569',
    fontSize: 14,
  },
});
