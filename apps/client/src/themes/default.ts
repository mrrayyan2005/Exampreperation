import { DashboardTheme } from './types';

export const defaultTheme: DashboardTheme = {
  name: 'Default',
  id: 'default',
  description: 'Classic purple theme',
  icon: '⚡',
  light: {
    // Primary - Classic Purple
    primary: '251 87% 62%',
    primaryForeground: '0 0% 100%',
    primaryHover: '251 87% 55%',
    primaryMuted: '251 87% 92%',

    // Secondary - Gold
    secondary: '43 90% 62%',
    secondaryForeground: '0 0% 0%',

    // Background
    background: '255 100% 97%',
    foreground: '251 20% 15%',
    card: '0 0% 100%',
    cardForeground: '251 20% 15%',
    popover: '0 0% 100%',
    popoverForeground: '251 20% 15%',

    // Muted
    muted: '251 30% 92%',
    mutedForeground: '251 20% 45%',

    // Accent - Light Blue
    accent: '197 100% 77%',
    accentForeground: '251 20% 15%',

    // Utility
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 100%',
    success: '142 71% 45%',
    successForeground: '0 0% 100%',
    warning: '43 90% 62%',
    warningForeground: '0 0% 0%',
    info: '199 89% 48%',
    infoForeground: '0 0% 100%',

    // Border and input
    border: '251 30% 85%',
    input: '251 30% 85%',
    ring: '251 87% 62%',
  },
  dark: {
    // Primary - Vibrant Electric Purple
    primary: '262 100% 70%',
    primaryForeground: '0 0% 100%',
    primaryHover: '262 100% 65%',
    primaryMuted: '262 50% 20%',

    // Secondary - Bright Gold/Amber
    secondary: '43 100% 60%',
    secondaryForeground: '0 0% 0%',

    // Background - Dark grey
    background: '0 0% 6%',
    foreground: '250 30% 95%',
    card: '0 0% 10%',
    cardForeground: '250 30% 95%',
    popover: '0 0% 8%',
    popoverForeground: '250 30% 95%',

    // Muted - Grey
    muted: '0 0% 15%',
    mutedForeground: '0 0% 60%',

    // Accent - Cyan glow
    accent: '187 100% 65%',
    accentForeground: '0 0% 0%',

    // Utility
    destructive: '0 85% 65%',
    destructiveForeground: '0 0% 100%',
    success: '142 80% 50%',
    successForeground: '0 0% 0%',
    warning: '43 100% 60%',
    warningForeground: '0 0% 0%',
    info: '199 100% 65%',
    infoForeground: '0 0% 100%',

    // Border and input
    border: '0 0% 18%',
    input: '0 0% 18%',
    ring: '262 100% 70%',
  },
};
