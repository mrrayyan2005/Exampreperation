import { DashboardTheme } from './types';

export const autumnTheme: DashboardTheme = {
  name: 'Autumn',
  id: 'autumn',
  description: 'Warm oranges and deep browns',
  icon: '🍂',
  light: {
    // Primary - Rust orange
    primary: '25 75% 45%',
    primaryForeground: '0 0% 100%',
    primaryHover: '25 75% 38%',
    primaryMuted: '25 75% 92%',

    // Secondary - Mustard yellow
    secondary: '40 90% 55%',
    secondaryForeground: '0 0% 0%',

    // Background - Cream
    background: '35 30% 96%',
    foreground: '25 30% 15%',
    card: '0 0% 100%',
    cardForeground: '25 30% 15%',
    popover: '0 0% 100%',
    popoverForeground: '25 30% 15%',

    // Muted - Light tan
    muted: '30 20% 90%',
    mutedForeground: '30 15% 40%',

    // Accent - Deep burgundy
    accent: '350 60% 45%',
    accentForeground: '0 0% 100%',

    // Utility - Fall foliage
    destructive: '0 72% 51%',
    destructiveForeground: '0 0% 100%',
    success: '140 50% 40%',
    successForeground: '0 0% 100%',
    warning: '35 90% 55%',
    warningForeground: '0 0% 0%',
    info: '200 60% 50%',
    infoForeground: '0 0% 100%',

    // Border and input - Warm beige
    border: '30 20% 85%',
    input: '30 20% 85%',
    ring: '25 75% 45%',
  },
  dark: {
    // Primary - Pumpkin orange
    primary: '25 85% 55%',
    primaryForeground: '0 0% 5%',
    primaryHover: '25 85% 60%',
    primaryMuted: '25 40% 20%',

    // Secondary - Gold
    secondary: '45 100% 60%',
    secondaryForeground: '0 0% 5%',

    // Background - Deep brown
    background: '25 30% 8%',
    foreground: '35 30% 95%',
    card: '25 25% 10%',
    cardForeground: '35 30% 95%',
    popover: '25 25% 6%',
    popoverForeground: '35 30% 95%',

    // Muted - Dark sepia
    muted: '25 20% 18%',
    mutedForeground: '30 20% 55%',

    // Accent - Deep red
    accent: '350 70% 55%',
    accentForeground: '0 0% 100%',

    // Utility - Fall foliage
    destructive: '0 85% 65%',
    destructiveForeground: '0 0% 0%',
    success: '140 60% 50%',
    successForeground: '0 0% 0%',
    warning: '40 100% 60%',
    warningForeground: '0 0% 0%',
    info: '200 70% 60%',
    infoForeground: '0 0% 0%',

    // Border and input - Dark brown
    border: '25 20% 20%',
    input: '25 20% 20%',
    ring: '25 85% 55%',
  },
};
