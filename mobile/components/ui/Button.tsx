import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, radii, typography } from '../../constants/theme';
import Text from './Text';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
  ...rest
}: ButtonProps) {
  const isInteractive = !disabled && !loading;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={!isInteractive}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            variant={size === 'sm' ? 'caption' : 'body'}
            weight="semibold"
            color={getTextColor(variant, disabled)}
            style={icon ? styles.textWithIcon : undefined}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function getTextColor(variant: ButtonProps['variant'], disabled: boolean): string {
  if (disabled) return colors.muted;
  switch (variant) {
    case 'primary':
      return colors.white;
    case 'secondary':
      return colors.text;
    case 'outline':
    case 'ghost':
      return colors.primary;
    case 'soft':
      return colors.primaryDark;
    default:
      return colors.white;
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.base,
    minHeight: 48, // Touch target minimum
  },
  fullWidth: {
    width: '100%',
  },
  textWithIcon: {
    marginLeft: spacing.sm,
  },
  size_sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 38,
    borderRadius: radii.md,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    borderRadius: radii.base,
  },
  size_lg: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
    borderRadius: radii.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  soft: {
    backgroundColor: colors.softLavender,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    opacity: 0.6,
  },
});

export default Button;
