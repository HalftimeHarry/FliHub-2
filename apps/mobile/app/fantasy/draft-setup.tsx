import { Text, View, StyleSheet } from 'react-native';

export default function DraftSetup() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Draft Setup</Text>
      <Text style={styles.subtitle}>Seed the draft room and prepare the league for the first pick.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 10,
    color: '#475569',
  },
});
