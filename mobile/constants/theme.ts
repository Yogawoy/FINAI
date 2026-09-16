/**
 * FinAI Mobile Design System — Centralized Theme
 * 
 * Strict Colors Rule:
 * Background: #F6F7FB
 * Primary: #7C7CE6
 * Soft Lavender: #E4E2FB
 * Ice Blue: #D6E4FA
 * Mint: #D0EFE5
 * Soft Coral: #FCE2E0
 * Text: #242636
 * Secondary: #757A95
 */

export const colors = {
  // Brand & Core
  background: '#F6F7FB',
  primary: '#7C7CE6',
  primaryDark: '#6767D8',
  primaryLight: '#8F8FE9',
  
  // Soft Accent Palettes
  softLavender: '#E4E2FB',
  iceBlue: '#D6E4FA',
  mint: '#D0EFE5',
  softCoral: '#FCE2E0',
  
  // Neutral & Typography
  text: '#242636',
  secondary: '#757A95',
  muted: '#A5A9BF',
  white: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F0F2FA',
  border: '#E8EAF2',
  borderFocus: '#C6C6F5',
  
  // Semantic Status (Calm Tone)
  success: '#1B7354',
  successLight: '#D0EFE5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FCE2E0',
  info: '#2563EB',
  infoLight: '#D6E4FA',
} as const;

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 48,
} as const;

export const radii = {
  none: 0,
  sm: 6,
  md: 10,
  base: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export const typography = {
  sizes: {
    xxs: 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.6,
  },
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: '#242636',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#7C7CE6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  dock: {
    shadowColor: '#242636',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
};

export default theme;
