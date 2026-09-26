import { Text, View, StyleSheet } from 'react-native';

export default function OrgPickerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Organization</Text>
      <Text style={styles.subtitle}>Select the org that owns the fantasy league.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 10,
    color: '#475569',
  },
});
