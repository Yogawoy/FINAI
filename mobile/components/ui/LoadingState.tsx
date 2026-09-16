import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import Text from './Text';

export interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Memuat...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="caption" color={colors.secondary} style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  text: {
    marginTop: spacing.md,
  },
});

export default LoadingState;
