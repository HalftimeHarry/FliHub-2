import { Text, View, StyleSheet } from 'react-native';

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FliHub</Text>
      <Text style={styles.subtitle}>Build fantasy leagues, approve members, then draft and track results.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#111827',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 10,
    color: '#d1d5db',
    textAlign: 'center',
  },
});
