import { View, Text, StyleSheet } from 'react-native';

export default function DraftTabScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Draft</Text>
      <Text style={styles.body}>Track the current pick, draft order, and selections.</Text>
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
