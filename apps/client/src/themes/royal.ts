import { DashboardTheme } from './types';

export const royalTheme: DashboardTheme = {
  name: 'Royal Purple',
  id: 'royal',
  description: 'Rich purple tones for a premium feel',
  icon: '👑',
  light: {
    // Primary - Royal Purple
    primary: '270 60% 55%',
    primaryForeground: '0 0% 100%',
    primaryHover: '270 60% 48%',
    primaryMuted: '270 60% 92%',

    // Secondary - Lavender
    secondary: '280 50% 65%',
    secondaryForeground: '0 0% 100%',

    // Background
    background: '270 40% 97%',
    foreground: '270 40% 15%',
    card: '0 0% 100%',
    cardForeground: '270 40% 15%',
    popover: '0 0% 100%',
    popoverForeground: '270 40% 15%',

    // Muted
    muted: '270 30% 92%',
    mutedForeground: '270 25% 45%',

    // Accent - Violet
    accent: '260 60% 60%',
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
    border: '270 30% 85%',
    input: '270 30% 85%',
    ring: '270 60% 55%',
  },
  dark: {
    // Primary - Vibrant Neon Purple
    primary: '270 80% 70%',
    primaryForeground: '0 0% 100%',
    primaryHover: '270 80% 65%',
    primaryMuted: '270 50% 20%',

    // Secondary - Bright Magenta
    secondary: '290 80% 65%',
    secondaryForeground: '0 0% 100%',

    // Background - Dark grey
    background: '0 0% 6%',
    foreground: '280 40% 95%',
    card: '0 0% 10%',
    cardForeground: '280 40% 95%',
    popover: '0 0% 8%',
    popoverForeground: '280 40% 95%',

    // Muted - Grey
    muted: '0 0% 15%',
    mutedForeground: '0 0% 60%',

    // Accent - Bright Violet
    accent: '260 90% 70%',
    accentForeground: '0 0% 100%',

    // Utility
    destructive: '0 85% 65%',
    destructiveForeground: '0 0% 100%',
    success: '142 80% 50%',
    successForeground: '0 0% 0%',
    warning: '38 95% 55%',
    warningForeground: '0 0% 0%',
    info: '199 90% 65%',
    infoForeground: '0 0% 100%',

    // Border and input
    border: '0 0% 18%',
    input: '0 0% 18%',
    ring: '270 80% 70%',
  },
};
