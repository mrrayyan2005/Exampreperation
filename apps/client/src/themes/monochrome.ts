import { DashboardTheme } from './types';

export const monochromeTheme: DashboardTheme = {
  name: 'Monochrome',
  id: 'monochrome',
  description: 'Elegant grays with blue accent',
  icon: '◼',
  light: {
    // Primary - Slate gray
    primary: '215 25% 27%',
    primaryForeground: '0 0% 100%',
    primaryHover: '215 25% 20%',
    primaryMuted: '215 25% 92%',

    // Secondary - Medium gray
    secondary: '220 13% 46%',
    secondaryForeground: '0 0% 100%',

    // Background - Off-white with slight warmth
    background: '0 0% 98%',
    foreground: '215 25% 15%',
    card: '0 0% 100%',
    cardForeground: '215 25% 15%',
    popover: '0 0% 100%',
    popoverForeground: '215 25% 15%',

    // Muted - Light gray
    muted: '220 14% 96%',
    mutedForeground: '220 9% 46%',

    // Accent - Subtle blue (only accent color)
    accent: '210 100% 50%',
    accentForeground: '0 0% 100%',

    // Utility - Grayscale with blue highlights
    destructive: '0 72% 51%',
    destructiveForeground: '0 0% 100%',
    success: '142 76% 36%',
    successForeground: '0 0% 100%',
    warning: '38 92% 50%',
    warningForeground: '0 0% 0%',
    info: '210 100% 50%',
    infoForeground: '0 0% 100%',

    // Border and input - Subtle grays
    border: '220 13% 85%',
    input: '220 13% 85%',
    ring: '210 100% 50%',
  },
  dark: {
    // Primary - Light gray
    primary: '0 0% 90%',
    primaryForeground: '0 0% 5%',
    primaryHover: '0 0% 95%',
    primaryMuted: '0 0% 20%',

    // Secondary - Medium gray
    secondary: '0 0% 70%',
    secondaryForeground: '0 0% 5%',

    // Background - Near black
    background: '0 0% 5%',
    foreground: '0 0% 95%',
    card: '0 0% 8%',
    cardForeground: '0 0% 95%',
    popover: '0 0% 6%',
    popoverForeground: '0 0% 95%',

    // Muted - Dark gray
    muted: '0 0% 15%',
    mutedForeground: '0 0% 60%',

    // Accent - Electric blue (only accent color)
    accent: '200 100% 60%',
    accentForeground: '0 0% 0%',

    // Utility - Grayscale with blue highlights
    destructive: '0 100% 65%',
    destructiveForeground: '0 0% 0%',
    success: '140 100% 55%',
    successForeground: '0 0% 0%',
    warning: '45 100% 55%',
    warningForeground: '0 0% 0%',
    info: '200 100% 60%',
    infoForeground: '0 0% 0%',

    // Border and input - Dark grays
    border: '0 0% 18%',
    input: '0 0% 18%',
    ring: '200 100% 60%',
  },
};
