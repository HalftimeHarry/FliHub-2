import type { ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

type MobileShellProps = {
  children: ReactNode;
};

export function MobileShell({ children }: MobileShellProps) {
  return (
    <View style={styles.pageShell}>
      <View style={styles.deviceFrame}>
        <View style={styles.notchArea} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageShell: {
    flex: 1,
    backgroundColor: '#020817',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 24 : 0,
    paddingVertical: Platform.OS === 'web' ? 24 : 0,
  },
  deviceFrame: {
    width: '100%',
    maxWidth: 430,
    height: Platform.OS === 'web' ? '100%' : '100%',
    minHeight: Platform.OS === 'web' ? 820 : '100%',
    maxHeight: 940,
    backgroundColor: '#f8fafc',
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0f172a',
    shadowColor: '#0f172a',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  notchArea: {
    height: 32,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
