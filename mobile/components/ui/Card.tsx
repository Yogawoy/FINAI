import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, spacing, radii, shadows } from '../../constants/theme';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'flat' | 'accent' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        styles[`padding_${padding}`],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  default: {
    ...shadows.card,
  },
  flat: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 0,
  },
  accent: {
    backgroundColor: colors.softLavender,
    borderColor: colors.borderFocus,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: spacing.sm,
  },
  padding_md: {
    padding: spacing.base,
  },
  padding_lg: {
    padding: spacing.xl,
  },
});

export default Card;
