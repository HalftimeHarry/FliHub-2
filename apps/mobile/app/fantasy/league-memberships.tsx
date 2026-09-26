import { Text, View, StyleSheet } from 'react-native';

export default function LeagueMemberships() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>League Memberships</Text>
      <Text style={styles.subtitle}>Approve pending members and update league readiness.</Text>
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
