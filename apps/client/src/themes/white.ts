import { DashboardTheme } from './types';

export const whiteTheme: DashboardTheme = {
  name: 'White',
  id: 'white',
  description: 'Pure white theme',
  icon: '⬜',
  light: {
    // Primary - Classic Purple
    primary: '251 87% 62%',
    primaryForeground: '0 0% 100%',
    primaryHover: '251 87% 55%',
    primaryMuted: '251 87% 92%',

    // Secondary - Slate
    secondary: '215 16% 47%',
    secondaryForeground: '0 0% 100%',

    // Background - Pure white
    background: '0 0% 100%',
    foreground: '0 0% 10%',
    card: '0 0% 100%',
    cardForeground: '0 0% 10%',
    popover: '0 0% 100%',
    popoverForeground: '0 0% 10%',

    // Muted - Light gray
    muted: '0 0% 96%',
    mutedForeground: '0 0% 45%',

    // Accent - Light purple
    accent: '251 87% 92%',
    accentForeground: '251 87% 30%',

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
    border: '0 0% 90%',
    input: '0 0% 90%',
    ring: '251 87% 62%',
  },
  dark: {
    // Primary - Vibrant Purple
    primary: '262 100% 70%',
    primaryForeground: '0 0% 100%',
    primaryHover: '262 100% 65%',
    primaryMuted: '262 50% 20%',

    // Secondary - Slate
    secondary: '215 20% 65%',
    secondaryForeground: '0 0% 0%',

    // Background - Pure black
    background: '0 0% 0%',
    foreground: '0 0% 100%',
    card: '0 0% 5%',
    cardForeground: '0 0% 100%',
    popover: '0 0% 3%',
    popoverForeground: '0 0% 100%',

    // Muted - Dark gray
    muted: '0 0% 15%',
    mutedForeground: '0 0% 60%',

    // Accent - Purple glow
    accent: '262 100% 70%',
    accentForeground: '0 0% 100%',

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
