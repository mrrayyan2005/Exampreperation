import { DashboardTheme } from './types';

// Convert hex to HSL helper
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Peachy/Sunset color palette
// Light: #FFF7CD, #FDC3A1, #FB9B8F, #F57799
// Dark: rgb(255, 247, 205), rgb(253, 195, 161), rgb(251, 155, 143), rgb(245, 119, 153)

const peachLight = '#FFF7CD';      // Cream yellow
const peachMedium = '#FDC3A1';     // Peach
const peachCoral = '#FB9B8F';      // Salmon/coral
const peachPink = '#F57799';       // Pink

export const peachTheme: DashboardTheme = {
  name: 'Peach Sunset',
  id: 'peach',
  description: 'Warm peachy tones for a cozy study vibe',
  icon: '🍑',
  light: {
    // Primary - Pink
    primary: hexToHsl(peachPink),
    primaryForeground: '0 0% 100%',
    primaryHover: '343 85% 65%',
    primaryMuted: '343 60% 92%',

    // Secondary - Coral
    secondary: hexToHsl(peachCoral),
    secondaryForeground: '0 0% 100%',

    // Background - Cream tint
    background: '40 100% 97%',
    foreground: '20 40% 20%',
    card: '0 0% 100%',
    cardForeground: '20 40% 20%',
    popover: '0 0% 100%',
    popoverForeground: '20 40% 20%',

    // Muted
    muted: '30 60% 94%',
    mutedForeground: '20 30% 45%',

    // Accent - Peach
    accent: hexToHsl(peachMedium),
    accentForeground: '20 40% 20%',

    // Utility
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 100%',
    success: '142 71% 45%',
    successForeground: '0 0% 100%',
    warning: '38 92% 50%',
    warningForeground: '0 0% 0%',
    info: '199 89% 48%',
    infoForeground: '0 0% 100%',

    // Border and input
    border: '30 50% 88%',
    input: '30 50% 88%',
    ring: hexToHsl(peachPink),
  },
  dark: {
    // Primary - Vibrant Neon Pink
    primary: '343 100% 72%',
    primaryForeground: '0 0% 100%',
    primaryHover: '343 100% 67%',
    primaryMuted: '343 50% 20%',

    // Secondary - Bright Neon Coral
    secondary: '7 100% 70%',
    secondaryForeground: '0 0% 100%',

    // Background - Dark grey
    background: '0 0% 6%',
    foreground: '35 40% 95%',
    card: '0 0% 10%',
    cardForeground: '35 40% 95%',
    popover: '0 0% 8%',
    popoverForeground: '35 40% 95%',

    // Muted - Grey
    muted: '0 0% 15%',
    mutedForeground: '0 0% 60%',

    // Accent - Bright Peach Glow
    accent: '25 100% 68%',
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
    ring: '343 100% 72%',
  },
};
