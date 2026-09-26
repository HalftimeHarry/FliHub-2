import { View, Text, StyleSheet } from 'react-native';

export default function LeaguesTabScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fantasy Leagues</Text>
      <Text style={styles.body}>List and manage fantasy leagues for the org.</Text>
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
  body: {
    marginTop: 8,
    color: '#475569',
  },
});
