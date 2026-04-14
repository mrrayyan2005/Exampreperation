import { DashboardTheme } from './types';

export const summerTheme: DashboardTheme = {
  name: 'Summer',
  id: 'summer',
  description: 'Bright yellows and ocean blues',
  icon: '☀️',
  light: {
    // Primary - Ocean blue
    primary: '200 100% 45%',
    primaryForeground: '0 0% 100%',
    primaryHover: '200 100% 38%',
    primaryMuted: '200 100% 92%',

    // Secondary - Sunny yellow
    secondary: '45 100% 55%',
    secondaryForeground: '0 0% 0%',

    // Background - Sandy white
    background: '45 30% 97%',
    foreground: '200 30% 15%',
    card: '0 0% 100%',
    cardForeground: '200 30% 15%',
    popover: '0 0% 100%',
    popoverForeground: '200 30% 15%',

    // Muted - Light sand
    muted: '45 20% 92%',
    mutedForeground: '45 15% 40%',

    // Accent - Coral orange
    accent: '15 100% 65%',
    accentForeground: '0 0% 100%',

    // Utility - Beach vibes
    destructive: '0 72% 51%',
    destructiveForeground: '0 0% 100%',
    success: '160 60% 45%',
    successForeground: '0 0% 100%',
    warning: '35 100% 55%',
    warningForeground: '0 0% 0%',
    info: '200 100% 50%',
    infoForeground: '0 0% 100%',

    // Border and input - Sandy beige
    border: '45 20% 85%',
    input: '45 20% 85%',
    ring: '200 100% 45%',
  },
  dark: {
    // Primary - Bright cyan
    primary: '190 100% 55%',
    primaryForeground: '0 0% 5%',
    primaryHover: '190 100% 60%',
    primaryMuted: '190 40% 20%',

    // Secondary - Golden yellow
    secondary: '45 100% 60%',
    secondaryForeground: '0 0% 5%',

    // Background - Deep ocean
    background: '210 50% 8%',
    foreground: '190 30% 95%',
    card: '210 45% 10%',
    cardForeground: '190 30% 95%',
    popover: '210 45% 6%',
    popoverForeground: '190 30% 95%',

    // Muted - Ocean depths
    muted: '210 30% 18%',
    mutedForeground: '210 20% 55%',

    // Accent - Bright coral
    accent: '15 100% 65%',
    accentForeground: '0 0% 5%',

    // Utility - Beach vibes
    destructive: '0 85% 65%',
    destructiveForeground: '0 0% 0%',
    success: '160 70% 55%',
    successForeground: '0 0% 0%',
    warning: '40 100% 60%',
    warningForeground: '0 0% 0%',
    info: '190 100% 60%',
    infoForeground: '0 0% 0%',

    // Border and input - Ocean depths
    border: '210 30% 20%',
    input: '210 30% 20%',
    ring: '190 100% 55%',
  },
};
