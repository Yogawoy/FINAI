import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../../constants/theme';
import Text from './Text';
import Button from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Terjadi masalah saat memuat data.',
  message,
  onRetry,
  retryLabel = 'Coba Lagi',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text variant="caption" weight="bold" color={colors.danger}>
          INFO
        </Text>
      </View>
      <Text variant="subtitle" weight="semibold" align="center" style={styles.title}>
        {title}
      </Text>
      {message ? (
        <Text variant="caption" color={colors.secondary} align="center" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <Button
          title={retryLabel}
          variant="outline"
          size="sm"
          onPress={onRetry}
          style={styles.button}
          fullWidth={false}
        />
      ) : null}
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
  badge: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  message: {
    marginBottom: spacing.md,
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.xs,
  },
});

export default ErrorState;
