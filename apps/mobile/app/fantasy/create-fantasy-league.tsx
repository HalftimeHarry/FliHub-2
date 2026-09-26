import { Text, View, StyleSheet } from 'react-native';

export default function CreateFantasyLeague() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Fantasy League</Text>
      <Text style={styles.subtitle}>Set the league name, owner, and participant threshold.</Text>
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
