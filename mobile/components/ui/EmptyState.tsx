import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../../constants/theme';
import Text from './Text';
import Button from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'Belum ada data.',
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.indicator}>
        <View style={styles.indicatorDot} />
      </View>
      <Text variant="body" weight="semibold" align="center" style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text variant="caption" color={colors.secondary} align="center" style={styles.description}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          variant="soft"
          size="sm"
          onPress={onAction}
          style={styles.action}
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
    minHeight: 160,
  },
  indicator: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.muted,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    maxWidth: 260,
  },
  action: {
    marginTop: spacing.md,
  },
});

export default EmptyState;
