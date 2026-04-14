// Dashboard Theme System - Separate from Landing Page Theme
// This theme applies to all internal pages (dashboard, notes, etc.) but NOT the landing page

export type ThemeName = 'forest' | 'ocean' | 'sunset' | 'royal' | 'peach' | 'white' | 'contrast' | 'monochrome' | 'spring' | 'summer' | 'autumn' | 'winter' | 'custom' | 'default';

export type BorderRadius = 'sharp' | 'rounded' | 'pill';
export type SpacingDensity = 'compact' | 'comfortable' | 'spacious';
export type FontFamily = 'modern' | 'classic' | 'technical';
export type GlassIntensity = 'subtle' | 'medium' | 'heavy';
export type CardStyle = 'elevated' | 'flat' | 'outlined';
export type ShadowIntensity = 'none' | 'light' | 'medium' | 'heavy';

// Preset accent colors for color picker
export interface AccentColorOption {
  name: string;
  hsl: string;
}

export const presetAccentColors: AccentColorOption[] = [
  { name: 'Purple', hsl: '251 87% 62%' },
  { name: 'Blue', hsl: '210 100% 50%' },
  { name: 'Green', hsl: '142 71% 45%' },
  { name: 'Orange', hsl: '25 95% 53%' },
  { name: 'Pink', hsl: '330 80% 60%' },
  { name: 'Teal', hsl: '174 72% 46%' },
  { name: 'Red', hsl: '0 84% 60%' },
  { name: 'Yellow', hsl: '45 93% 47%' },
  { name: 'Indigo', hsl: '240 60% 55%' },
  { name: 'Cyan', hsl: '190 90% 50%' },
];

export interface ThemeCustomization {
  // Custom color overrides (when using 'custom' theme)
  customPrimaryColor?: string;
  customAccentColor?: string;

  // UI styling preferences
  borderRadius: BorderRadius;
  spacingDensity: SpacingDensity;
  fontFamily: FontFamily;
  glassIntensity: GlassIntensity;
  cardStyle: CardStyle;
  shadowIntensity: ShadowIntensity;
}

export interface ThemeColors {
  // Primary brand color
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  primaryMuted: string;

  // Secondary accent
  secondary: string;
  secondaryForeground: string;

  // Background colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;

  // Muted/secondary content
  muted: string;
  mutedForeground: string;

  // Accent color (different from primary)
  accent: string;
  accentForeground: string;

  // Utility colors
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;

  // Border and input
  border: string;
  input: string;
  ring: string;
}

export interface DashboardTheme {
  name: string;
  id: ThemeName;
  description: string;
  icon: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export interface DashboardThemeContextType {
  currentTheme: DashboardTheme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  isDark: boolean;
  availableThemes: DashboardTheme[];

  // Customization options
  customization: ThemeCustomization;
  setBorderRadius: (radius: BorderRadius) => void;
  setSpacingDensity: (density: SpacingDensity) => void;
  setFontFamily: (font: FontFamily) => void;
  setGlassIntensity: (intensity: GlassIntensity) => void;
  setCardStyle: (style: CardStyle) => void;
  setShadowIntensity: (intensity: ShadowIntensity) => void;
  setCustomColors: (primary?: string, accent?: string) => void;

  // Helper to apply CSS variables for customization
  borderRadiusValue: string;
  spacingValue: number;
  fontFamilyValue: string;
  glassIntensityValue: {
    blur: string;
    opacity: string;
    saturation: string;
  };
  cardStyleValue: string;
  shadowValue: string;
}
