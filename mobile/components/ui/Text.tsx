import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography } from '../../constants/theme';

export interface AppTextProps extends RNTextProps {
  variant?: 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'black';
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  weight = 'regular',
  color = colors.text,
  align = 'left',
  style,
  children,
  ...rest
}: AppTextProps) {
  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        { fontWeight: typography.weights[weight], color, textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: undefined, // System font
  },
  display: {
    fontSize: typography.sizes.display,
    lineHeight: typography.sizes.display * typography.lineHeights.tight,
  },
  title: {
    fontSize: typography.sizes.xl,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.sizes.lg * typography.lineHeights.normal,
  },
  body: {
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  caption: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  label: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.sizes.xs * typography.lineHeights.normal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default Text;
