import { DashboardTheme } from './types';

export const oceanTheme: DashboardTheme = {
  name: 'Ocean Blue',
  id: 'ocean',
  description: 'Deep blue tones for focused studying',
  icon: '🌊',
  light: {
    // Primary - Ocean Blue
    primary: '217 91% 40%',
    primaryForeground: '0 0% 100%',
    primaryHover: '217 91% 35%',
    primaryMuted: '217 91% 92%',

    // Secondary - Sky
    secondary: '199 89% 48%',
    secondaryForeground: '0 0% 100%',

    // Background
    background: '210 50% 97%',
    foreground: '217 50% 15%',
    card: '0 0% 100%',
    cardForeground: '217 50% 15%',
    popover: '0 0% 100%',
    popoverForeground: '217 50% 15%',

    // Muted
    muted: '210 40% 92%',
    mutedForeground: '217 30% 45%',

    // Accent - Cyan
    accent: '187 92% 43%',
    accentForeground: '0 0% 100%',

    // Utility
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 100%',
    success: '142 71% 45%',
    successForeground: '0 0% 100%',
    warning: '38 92% 50%',
    warningForeground: '0 0% 100%',
    info: '217 91% 60%',
    infoForeground: '0 0% 100%',

    // Border and input
    border: '210 40% 85%',
    input: '210 40% 85%',
    ring: '217 91% 40%',
  },
  dark: {
    // Primary - Bright Electric Blue
    primary: '210 100% 60%',
    primaryForeground: '0 0% 100%',
    primaryHover: '210 100% 55%',
    primaryMuted: '210 50% 20%',

    // Secondary - Vibrant Cyan
    secondary: '187 100% 50%',
    secondaryForeground: '0 0% 0%',

    // Background - Dark grey
    background: '0 0% 6%',
    foreground: '200 40% 95%',
    card: '0 0% 10%',
    cardForeground: '200 40% 95%',
    popover: '0 0% 8%',
    popoverForeground: '200 40% 95%',

    // Muted - Grey
    muted: '0 0% 15%',
    mutedForeground: '0 0% 60%',

    // Accent - Neon Cyan
    accent: '187 100% 55%',
    accentForeground: '0 0% 0%',

    // Utility
    destructive: '0 85% 65%',
    destructiveForeground: '0 0% 100%',
    success: '142 80% 50%',
    successForeground: '0 0% 0%',
    warning: '38 95% 55%',
    warningForeground: '0 0% 0%',
    info: '210 100% 65%',
    infoForeground: '0 0% 100%',

    // Border and input
    border: '0 0% 18%',
    input: '0 0% 18%',
    ring: '210 100% 60%',
  },
};
