import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { colors, spacing, radii } from '../constants/theme';
import Text from '../components/ui/Text';
import LoadingState from '../components/ui/LoadingState';
import useAuth from '../hooks/useAuth';

export default function EntryScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <View style={styles.container}>
      {/* Background Ambience Bubble */}
      <View style={styles.ambienceBubble} />

      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <Sparkles size={28} color={colors.white} />
        </View>
        <Text variant="title" weight="black" color={colors.text} style={styles.brandTitle}>
          FinAI
        </Text>
        <Text variant="caption" color={colors.secondary} style={styles.brandSubtitle}>
          Spatial Finance & Personal Budgeting
        </Text>
      </View>

      <View style={styles.loadingWrapper}>
        <LoadingState message="Menyiapkan FinAI..." />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  ambienceBubble: {
    position: 'absolute',
    top: '20%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.softLavender,
    opacity: 0.6,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 26,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    marginTop: spacing.xxs,
  },
  loadingWrapper: {
    marginTop: spacing.lg,
  },
});
