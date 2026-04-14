import { DashboardTheme } from './types';

export const contrastTheme: DashboardTheme = {
  name: 'High Contrast',
  id: 'contrast',
  description: 'Maximum accessibility with bold contrast',
  icon: '◐',
  light: {
    // Primary - Pure black for maximum contrast
    primary: '0 0% 0%',
    primaryForeground: '0 0% 100%',
    primaryHover: '0 0% 15%',
    primaryMuted: '0 0% 90%',

    // Secondary - Dark gray
    secondary: '0 0% 20%',
    secondaryForeground: '0 0% 100%',

    // Background - Pure white
    background: '0 0% 100%',
    foreground: '0 0% 0%',
    card: '0 0% 100%',
    cardForeground: '0 0% 0%',
    popover: '0 0% 100%',
    popoverForeground: '0 0% 0%',

    // Muted - Light gray with dark text
    muted: '0 0% 95%',
    mutedForeground: '0 0% 25%',

    // Accent - Bright blue for focus indicators
    accent: '220 100% 50%',
    accentForeground: '0 0% 100%',

    // Utility - High contrast colors
    destructive: '0 100% 40%',
    destructiveForeground: '0 0% 100%',
    success: '140 100% 30%',
    successForeground: '0 0% 100%',
    warning: '45 100% 45%',
    warningForeground: '0 0% 0%',
    info: '210 100% 45%',
    infoForeground: '0 0% 100%',

    // Border and input - Thick dark borders
    border: '0 0% 0%',
    input: '0 0% 0%',
    ring: '220 100% 50%',
  },
  dark: {
    // Primary - Pure white for maximum contrast
    primary: '0 0% 100%',
    primaryForeground: '0 0% 0%',
    primaryHover: '0 0% 90%',
    primaryMuted: '0 0% 20%',

    // Secondary - Light gray
    secondary: '0 0% 85%',
    secondaryForeground: '0 0% 0%',

    // Background - Pure black
    background: '0 0% 0%',
    foreground: '0 0% 100%',
    card: '0 0% 0%',
    cardForeground: '0 0% 100%',
    popover: '0 0% 5%',
    popoverForeground: '0 0% 100%',

    // Muted - Dark gray with light text
    muted: '0 0% 15%',
    mutedForeground: '0 0% 85%',

    // Accent - Bright cyan for focus indicators
    accent: '180 100% 60%',
    accentForeground: '0 0% 0%',

    // Utility - High contrast colors
    destructive: '0 100% 70%',
    destructiveForeground: '0 0% 0%',
    success: '140 100% 60%',
    successForeground: '0 0% 0%',
    warning: '45 100% 60%',
    warningForeground: '0 0% 0%',
    info: '210 100% 70%',
    infoForeground: '0 0% 0%',

    // Border and input - Thick white borders
    border: '0 0% 100%',
    input: '0 0% 100%',
    ring: '180 100% 60%',
  },
};
