import { DashboardTheme } from './types';

export const winterTheme: DashboardTheme = {
  name: 'Winter',
  id: 'winter',
  description: 'Cool blues and crisp whites',
  icon: '❄️',
  light: {
    // Primary - Icy blue
    primary: '210 100% 50%',
    primaryForeground: '0 0% 100%',
    primaryHover: '210 100% 42%',
    primaryMuted: '210 100% 92%',

    // Secondary - Silver gray
    secondary: '215 20% 65%',
    secondaryForeground: '215 30% 15%',

    // Background - Snow white
    background: '210 20% 98%',
    foreground: '215 30% 15%',
    card: '0 0% 100%',
    cardForeground: '215 30% 15%',
    popover: '0 0% 100%',
    popoverForeground: '215 30% 15%',

    // Muted - Light frost
    muted: '210 20% 94%',
    mutedForeground: '215 15% 45%',

    // Accent - Aurora purple
    accent: '270 60% 60%',
    accentForeground: '0 0% 100%',

    // Utility - Winter palette
    destructive: '0 72% 51%',
    destructiveForeground: '0 0% 100%',
    success: '160 60% 45%',
    successForeground: '0 0% 100%',
    warning: '45 90% 55%',
    warningForeground: '0 0% 0%',
    info: '210 100% 55%',
    infoForeground: '0 0% 100%',

    // Border and input - Ice blue
    border: '210 20% 88%',
    input: '210 20% 88%',
    ring: '210 100% 50%',
  },
  dark: {
    // Primary - Bright arctic blue
    primary: '200 100% 65%',
    primaryForeground: '0 0% 5%',
    primaryHover: '200 100% 70%',
    primaryMuted: '200 50% 20%',

    // Secondary - Ice gray
    secondary: '210 30% 75%',
    secondaryForeground: '0 0% 5%',

    // Background - Deep arctic night
    background: '220 40% 8%',
    foreground: '210 30% 95%',
    card: '220 35% 10%',
    cardForeground: '210 30% 95%',
    popover: '220 35% 6%',
    popoverForeground: '210 30% 95%',

    // Muted - Dark frost
    muted: '220 25% 18%',
    mutedForeground: '210 20% 55%',

    // Accent - Aurora glow
    accent: '270 80% 70%',
    accentForeground: '0 0% 5%',

    // Utility - Winter palette
    destructive: '0 85% 70%',
    destructiveForeground: '0 0% 0%',
    success: '160 70% 55%',
    successForeground: '0 0% 0%',
    warning: '45 100% 60%',
    warningForeground: '0 0% 0%',
    info: '200 100% 65%',
    infoForeground: '0 0% 0%',

    // Border and input - Dark ice
    border: '220 25% 20%',
    input: '220 25% 20%',
    ring: '200 100% 65%',
  },
};
