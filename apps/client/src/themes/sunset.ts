import { DashboardTheme } from './types';

export const sunsetTheme: DashboardTheme = {
  name: 'Sunset Orange',
  id: 'sunset',
  description: 'Warm orange tones for energetic studying',
  icon: '🌅',
  light: {
    // Primary - Sunset Orange
    primary: '24 95% 53%',
    primaryForeground: '0 0% 100%',
    primaryHover: '24 95% 48%',
    primaryMuted: '24 95% 92%',

    // Secondary - Coral
    secondary: '14 100% 65%',
    secondaryForeground: '0 0% 100%',

    // Background
    background: '30 50% 97%',
    foreground: '24 40% 15%',
    card: '0 0% 100%',
    cardForeground: '24 40% 15%',
    popover: '0 0% 100%',
    popoverForeground: '24 40% 15%',

    // Muted
    muted: '30 40% 92%',
    mutedForeground: '24 30% 45%',

    // Accent - Amber
    accent: '38 92% 50%',
    accentForeground: '0 0% 100%',

    // Utility
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 100%',
    success: '142 71% 45%',
    successForeground: '0 0% 100%',
    warning: '38 92% 50%',
    warningForeground: '0 0% 100%',
    info: '199 89% 48%',
    infoForeground: '0 0% 100%',

    // Border and input
    border: '30 40% 85%',
    input: '30 40% 85%',
    ring: '24 95% 53%',
  },
  dark: {
    // Primary - Vibrant Neon Orange
    primary: '20 100% 60%',
    primaryForeground: '0 0% 0%',
    primaryHover: '20 100% 55%',
    primaryMuted: '20 60% 18%',

    // Secondary - Hot Coral
    secondary: '10 100% 65%',
    secondaryForeground: '0 0% 0%',

    // Background - Dark grey
    background: '0 0% 6%',
    foreground: '30 40% 95%',
    card: '0 0% 10%',
    cardForeground: '30 40% 95%',
    popover: '0 0% 8%',
    popoverForeground: '30 40% 95%',

    // Muted - Grey
    muted: '0 0% 15%',
    mutedForeground: '0 0% 60%',

    // Accent - Bright Amber/Gold
    accent: '38 100% 55%',
    accentForeground: '0 0% 0%',

    // Utility
    destructive: '0 85% 65%',
    destructiveForeground: '0 0% 100%',
    success: '142 80% 50%',
    successForeground: '0 0% 0%',
    warning: '38 100% 55%',
    warningForeground: '0 0% 0%',
    info: '199 90% 65%',
    infoForeground: '0 0% 100%',

    // Border and input
    border: '0 0% 18%',
    input: '0 0% 18%',
    ring: '20 100% 60%',
  },
};
