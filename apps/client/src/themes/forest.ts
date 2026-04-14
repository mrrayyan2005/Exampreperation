import { DashboardTheme } from './types';

export const forestTheme: DashboardTheme = {
  name: 'Forest Green',
  id: 'forest',
  description: 'Natural green tones for a calm study environment',
  icon: '🌲',
  light: {
    // Primary - Forest Green
    primary: '142 76% 36%',
    primaryForeground: '0 0% 100%',
    primaryHover: '142 76% 30%',
    primaryMuted: '142 76% 90%',

    // Secondary - Sage
    secondary: '152 30% 60%',
    secondaryForeground: '0 0% 100%',

    // Background
    background: '138 50% 97%',
    foreground: '142 30% 15%',
    card: '0 0% 100%',
    cardForeground: '142 30% 15%',
    popover: '0 0% 100%',
    popoverForeground: '142 30% 15%',

    // Muted
    muted: '138 30% 92%',
    mutedForeground: '142 20% 45%',

    // Accent - Mint
    accent: '158 64% 52%',
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
    border: '138 30% 85%',
    input: '138 30% 85%',
    ring: '142 76% 36%',
  },
  dark: {
    // Primary - Bright Neon Green
    primary: '142 80% 55%',
    primaryForeground: '0 0% 0%',
    primaryHover: '142 80% 50%',
    primaryMuted: '142 40% 18%',

    // Secondary - Soft Sage
    secondary: '150 40% 45%',
    secondaryForeground: '0 0% 100%',

    // Background - Dark grey
    background: '0 0% 6%',
    foreground: '140 30% 95%',
    card: '0 0% 10%',
    cardForeground: '140 30% 95%',
    popover: '0 0% 8%',
    popoverForeground: '140 30% 95%',

    // Muted - Grey
    muted: '0 0% 15%',
    mutedForeground: '0 0% 60%',

    // Accent - Bright Mint
    accent: '158 80% 55%',
    accentForeground: '0 0% 0%',

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
    ring: '142 80% 55%',
  },
};
