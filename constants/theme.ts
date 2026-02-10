/**
 * Modern Design System for Dealo App
 * Primary Brand Color: #FF6B35 (from Lottie animation)
 */

import { Platform } from 'react-native';

// Brand Colors
export const BrandColors = {
  primary: '#FF6B35',
  primaryDark: '#E85A28',
  primaryLight: '#FF8A5B',

  secondary: '#4A90E2',
  secondaryDark: '#357ABD',
  secondaryLight: '#6BA3E8',

  accent: '#50C878',
  accentWarn: '#FFA500',
  accentError: '#FF4444',
};

// Gradients
export const Gradients = {
  primary: ['#FF6B35', '#FFA500'],
  secondary: ['#4A90E2', '#357ABD'],
  success: ['#50C878', '#3AA65A'],
};

// Light Mode Colors
const lightColors = {
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',

  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundTertiary: '#F5F5F5',

  border: '#E0E0E0',
  borderLight: '#F0F0F0',

  tint: BrandColors.primary,
  icon: '#687076',
  tabIconDefault: '#999999',
  tabIconSelected: BrandColors.primary,
};

// Dark Mode Colors
const darkColors = {
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',

  background: '#1A1A1A',
  backgroundSecondary: '#2D2D2D',
  backgroundTertiary: '#3A3A3A',

  border: '#404040',
  borderLight: '#333333',

  tint: BrandColors.primary,
  icon: '#9BA1A6',
  tabIconDefault: '#808080',
  tabIconSelected: BrandColors.primary,
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
};

// Typography
export const Typography = {
  sizes: {
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
    tiny: 10,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing Scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

// Border Radius
export const Radius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  full: 9999,
};

// Shadows
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Fonts
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
