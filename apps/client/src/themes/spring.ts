import { DashboardTheme } from './types';

export const springTheme: DashboardTheme = {
  name: 'Spring',
  id: 'spring',
  description: 'Fresh greens and soft pinks',
  icon: '🌸',
  light: {
    // Primary - Fresh green
    primary: '142 56% 45%',
    primaryForeground: '0 0% 100%',
    primaryHover: '142 56% 38%',
    primaryMuted: '142 56% 92%',

    // Secondary - Soft pink
    secondary: '340 75% 75%',
    secondaryForeground: '340 30% 25%',

    // Background - Creamy white
    background: '60 30% 97%',
    foreground: '142 30% 15%',
    card: '0 0% 100%',
    cardForeground: '142 30% 15%',
    popover: '0 0% 100%',
    popoverForeground: '142 30% 15%',

    // Muted - Light sage
    muted: '100 30% 92%',
    mutedForeground: '100 20% 40%',

    // Accent - Cherry blossom pink
    accent: '340 82% 76%',
    accentForeground: '340 30% 25%',

    // Utility - Fresh spring colors
    destructive: '0 72% 51%',
    destructiveForeground: '0 0% 100%',
    success: '142 71% 45%',
    successForeground: '0 0% 100%',
    warning: '38 92% 50%',
    warningForeground: '0 0% 0%',
    info: '190 90% 50%',
    infoForeground: '0 0% 100%',

    // Border and input - Soft green
    border: '100 20% 85%',
    input: '100 20% 85%',
    ring: '142 56% 45%',
  },
  dark: {
    // Primary - Bright lime green
    primary: '142 70% 55%',
    primaryForeground: '0 0% 5%',
    primaryHover: '142 70% 60%',
    primaryMuted: '142 30% 20%',

    // Secondary - Bright pink
    secondary: '340 80% 70%',
    secondaryForeground: '0 0% 5%',

    // Background - Deep forest
    background: '142 30% 8%',
    foreground: '100 30% 95%',
    card: '142 25% 10%',
    cardForeground: '100 30% 95%',
    popover: '142 25% 6%',
    popoverForeground: '100 30% 95%',

    // Muted - Dark sage
    muted: '142 20% 18%',
    mutedForeground: '100 20% 55%',

    // Accent - Bright cherry blossom
    accent: '340 80% 70%',
    accentForeground: '0 0% 5%',

    // Utility - Fresh spring colors
    destructive: '0 85% 65%',
    destructiveForeground: '0 0% 0%',
    success: '142 80% 55%',
    successForeground: '0 0% 0%',
    warning: '45 100% 60%',
    warningForeground: '0 0% 0%',
    info: '190 100% 65%',
    infoForeground: '0 0% 0%',

    // Border and input - Dark green
    border: '142 20% 20%',
    input: '142 20% 20%',
    ring: '142 70% 55%',
  },
};
