import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { DashboardThemeContextType, DashboardTheme, ThemeName, ThemeCustomization, BorderRadius, SpacingDensity, FontFamily, GlassIntensity, CardStyle, ShadowIntensity } from './types';
import { defaultTheme } from './default';
import { forestTheme } from './forest';
import { oceanTheme } from './ocean';
import { sunsetTheme } from './sunset';
import { royalTheme } from './royal';
import { peachTheme } from './peach';
import { whiteTheme } from './white';
import { contrastTheme } from './contrast';
import { monochromeTheme } from './monochrome';
import { springTheme } from './spring';
import { summerTheme } from './summer';
import { autumnTheme } from './autumn';
import { winterTheme } from './winter';
import { MobileThemeConfig, defaultMobileTheme, MobileBreakpoint } from './mobileTheme';

// Export all available themes
export const dashboardThemes: DashboardTheme[] = [
  defaultTheme,
  forestTheme,
  oceanTheme,
  sunsetTheme,
  royalTheme,
  peachTheme,
  whiteTheme,
  contrastTheme,
  monochromeTheme,
  springTheme,
  summerTheme,
  autumnTheme,
  winterTheme,
];

const DashboardThemeContext = createContext<DashboardThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'dashboard-theme';
const CUSTOMIZATION_KEY = 'dashboard-customization';

interface DashboardThemeProviderProps {
  children: ReactNode;
}


// Default customization settings
const defaultCustomization: ThemeCustomization = {
  borderRadius: 'rounded',
  spacingDensity: 'comfortable',
  fontFamily: 'modern',
  glassIntensity: 'medium',
  cardStyle: 'elevated',
  shadowIntensity: 'medium',
};

// Mobile breakpoint detection
function getMobileBreakpoint(width: number): MobileBreakpoint {
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  return 'xl';
}

// Mobile-optimized customization
function getMobileOptimizedCustomization(isMobile: boolean): Partial<ThemeCustomization> {
  if (!isMobile) return {};
  
  return {
    // Use larger touch targets on mobile
    borderRadius: 'rounded', // Keep rounded for better touch feel
    spacingDensity: 'comfortable', // More spacing for touch
    cardStyle: 'elevated', // Clear visual hierarchy
    shadowIntensity: 'light', // Lighter shadows for performance
  };
}

// Helper to get card style CSS value
const getCardStyleValue = (style: CardStyle): string => {
  switch (style) {
    case 'elevated': return '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
    case 'flat': return 'none';
    case 'outlined': return 'inset 0 0 0 1px hsl(var(--border))';
    default: return '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
  }
};

// Helper to get shadow intensity CSS value
const getShadowValue = (intensity: ShadowIntensity): string => {
  switch (intensity) {
    case 'none': return 'none';
    case 'light': return '0 1px 2px 0 rgb(0 0 0 / 0.05)';
    case 'medium': return '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
    case 'heavy': return '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
    default: return '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
  }
};

// Helper to get glass intensity values
const getGlassIntensityValue = (intensity: GlassIntensity) => {
  switch (intensity) {
    case 'subtle':
      return { blur: '4px', opacity: '0.3', saturation: '100%' };
    case 'medium':
      return { blur: '12px', opacity: '0.5', saturation: '180%' };
    case 'heavy':
      return { blur: '24px', opacity: '0.7', saturation: '200%' };
    default:
      return { blur: '12px', opacity: '0.5', saturation: '180%' };
  }
};

// Helper to get border radius CSS value
const getBorderRadiusValue = (radius: BorderRadius): string => {
  switch (radius) {
    case 'sharp': return '0.25rem';  // 4px
    case 'rounded': return '0.5rem'; // 8px
    case 'pill': return '9999px';    // Full rounded
    default: return '0.5rem';
  }
};

// Helper to get spacing multiplier
const getSpacingMultiplier = (density: SpacingDensity): number => {
  switch (density) {
    case 'compact': return 0.75;
    case 'comfortable': return 1;
    case 'spacious': return 1.25;
    default: return 1;
  }
};

// Helper to get font family CSS value
const getFontFamilyValue = (font: FontFamily): string => {
  switch (font) {
    case 'modern':
      return 'Inter, system-ui, -apple-system, sans-serif';
    case 'classic':
      return 'Georgia, "Times New Roman", serif';
    case 'technical':
      return '"JetBrains Mono", "Fira Code", monospace';
    default:
      return 'Inter, system-ui, -apple-system, sans-serif';
  }
};


export function DashboardThemeProvider({ children }: DashboardThemeProviderProps) {
  const { resolvedTheme } = useNextTheme();
  const isDark = resolvedTheme === 'dark';

  const [themeName, setThemeName] = useState<ThemeName>('default');
  const [mounted, setMounted] = useState(false);
  const [pathname, setPathname] = useState(window.location.pathname);

  // Mobile detection state
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const breakpoint = getMobileBreakpoint(windowWidth);
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl';

  // Customization state with mobile optimization
  const [customization, setCustomization] = useState<ThemeCustomization>(() => {
    const mobileOptimizations = getMobileOptimizedCustomization(isMobile);
    return { ...defaultCustomization, ...mobileOptimizations };
  });

  // Public routes that should NOT have the dashboard theme applied
  // These pages use their own theme (dark/light only)
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/about', '/blog', '/careers', '/contact', '/privacy', '/terms', '/security'];
  const isPublicPage = publicRoutes.some(route => pathname === route || pathname.startsWith('/reset-password/'));


  // Listen for URL changes (since we're outside Router)
  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', handleLocationChange);

    // Also poll for changes in case of SPA navigation
    const interval = setInterval(() => {
      if (window.location.pathname !== pathname) {
        setPathname(window.location.pathname);
      }
    }, 100);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, [pathname]);

  // Listen for window resize to detect mobile
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update customization when mobile state changes
  useEffect(() => {
    const mobileOptimizations = getMobileOptimizedCustomization(isMobile);
    setCustomization(prev => ({ ...prev, ...mobileOptimizations }));
  }, [isMobile]);

  // Load saved theme and customization from localStorage
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeName;
    if (savedTheme && dashboardThemes.find(t => t.id === savedTheme)) {
      setThemeName(savedTheme);
    }

    const savedCustomization = localStorage.getItem(CUSTOMIZATION_KEY);
    if (savedCustomization) {
      try {
        const parsed = JSON.parse(savedCustomization);
        setCustomization({ ...defaultCustomization, ...parsed });
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, []);

  const currentTheme = dashboardThemes.find(t => t.id === themeName) || defaultTheme;

  // Apply theme CSS variables
  useEffect(() => {
    if (!mounted) return;

    // Don't apply dashboard theme on public pages
    // Public pages (landing, login, register, etc.) use their own theme system
    if (isPublicPage) {
      return;
    }

    const root = document.documentElement;
    const colors = isDark ? currentTheme.dark : currentTheme.light;

    // Apply all theme colors as CSS variables
    const colorVariables: Record<string, string> = {
      '--primary': colors.primary,
      '--primary-foreground': colors.primaryForeground,
      '--secondary': colors.secondary,
      '--secondary-foreground': colors.secondaryForeground,
      '--background': colors.background,
      '--foreground': colors.foreground,
      '--card': colors.card,
      '--card-foreground': colors.cardForeground,
      '--popover': colors.popover,
      '--popover-foreground': colors.popoverForeground,
      '--muted': colors.muted,
      '--muted-foreground': colors.mutedForeground,
      '--accent': colors.accent,
      '--accent-foreground': colors.accentForeground,
      '--destructive': colors.destructive,
      '--destructive-foreground': colors.destructiveForeground,
      '--success': colors.success,
      '--success-foreground': colors.successForeground,
      '--warning': colors.warning,
      '--warning-foreground': colors.warningForeground,
      '--info': colors.info,
      '--info-foreground': colors.infoForeground,
      '--border': colors.border,
      '--input': colors.input,
      '--ring': colors.ring,
    };

    Object.entries(colorVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

  }, [currentTheme, isDark, isPublicPage, mounted, pathname]);

  // Apply customization CSS variables
  useEffect(() => {
    if (!mounted || isPublicPage) return;

    const root = document.documentElement;

    // Apply border radius
    root.style.setProperty('--radius', getBorderRadiusValue(customization.borderRadius));

    // Apply font family
    root.style.setProperty('--font-family', getFontFamilyValue(customization.fontFamily));

    // Apply custom colors if using 'custom' theme
    if (themeName === 'custom' && customization.customPrimaryColor) {
      const primaryHsl = customization.customPrimaryColor;
      root.style.setProperty('--primary', primaryHsl);
    }
    if (themeName === 'custom' && customization.customAccentColor) {
      const accentHsl = customization.customAccentColor;
      root.style.setProperty('--accent', accentHsl);
    }

    // Apply glass intensity
    const glass = getGlassIntensityValue(customization.glassIntensity);
    root.style.setProperty('--glass-blur', glass.blur);
    root.style.setProperty('--glass-opacity', glass.opacity);
    root.style.setProperty('--glass-saturation', glass.saturation);

    // Apply card style and shadow
    root.style.setProperty('--card-shadow', getCardStyleValue(customization.cardStyle));
    root.style.setProperty('--shadow-intensity', getShadowValue(customization.shadowIntensity));

  }, [customization, themeName, mounted, isPublicPage]);


  // Memoize computed values
  const borderRadiusValue = useMemo(() => getBorderRadiusValue(customization.borderRadius), [customization.borderRadius]);
  const spacingValue = useMemo(() => getSpacingMultiplier(customization.spacingDensity), [customization.spacingDensity]);
  const fontFamilyValue = useMemo(() => getFontFamilyValue(customization.fontFamily), [customization.fontFamily]);
  const glassIntensityValue = useMemo(() => getGlassIntensityValue(customization.glassIntensity), [customization.glassIntensity]);
  const cardStyleValue = useMemo(() => getCardStyleValue(customization.cardStyle), [customization.cardStyle]);
  const shadowValue = useMemo(() => getShadowValue(customization.shadowIntensity), [customization.shadowIntensity]);

  // Apply mobile-specific CSS variables
  useEffect(() => {
    if (!mounted || isPublicPage) return;

    const root = document.documentElement;

    // Apply mobile breakpoint classes
    root.style.setProperty('--mobile-breakpoint', breakpoint);
    root.setAttribute('data-mobile-breakpoint', breakpoint);

    // Apply mobile-optimized variables
    if (isMobile) {
      root.setAttribute('data-mobile', 'true');
      // Reduce animation duration on mobile for better performance
      root.style.setProperty('--animation-duration-scale', '0.8');
    } else {
      root.removeAttribute('data-mobile');
      root.style.setProperty('--animation-duration-scale', '1');
    }

  }, [breakpoint, isMobile, mounted, isPublicPage]);

  const setTheme = useCallback((newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    localStorage.setItem(STORAGE_KEY, newThemeName);
  }, []);

  const setBorderRadius = useCallback((radius: BorderRadius) => {
    setCustomization(prev => {
      const updated = { ...prev, borderRadius: radius };
      localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setSpacingDensity = useCallback((density: SpacingDensity) => {
    setCustomization(prev => {
      const updated = { ...prev, spacingDensity: density };
      localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setFontFamily = useCallback((font: FontFamily) => {
    setCustomization(prev => {
      const updated = { ...prev, fontFamily: font };
      localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setGlassIntensity = useCallback((intensity: GlassIntensity) => {
    setCustomization(prev => {
      const updated = { ...prev, glassIntensity: intensity };
      localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setCardStyle = useCallback((style: CardStyle) => {
    setCustomization(prev => {
      const updated = { ...prev, cardStyle: style };
      localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setShadowIntensity = useCallback((intensity: ShadowIntensity) => {
    setCustomization(prev => {
      const updated = { ...prev, shadowIntensity: intensity };
      localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setCustomColors = useCallback((primary?: string, accent?: string) => {
    setCustomization(prev => {
      const updated = {
        ...prev,
        customPrimaryColor: primary,
        customAccentColor: accent,
      };
      localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);


  const value: DashboardThemeContextType & {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    breakpoint: MobileBreakpoint;
    mobileConfig: MobileThemeConfig;
  } = {
    currentTheme,
    themeName,
    setTheme,
    isDark,
    availableThemes: dashboardThemes,
    customization,
    setBorderRadius,
    setSpacingDensity,
    setFontFamily,
    setGlassIntensity,
    setCardStyle,
    setShadowIntensity,
    setCustomColors,
    borderRadiusValue,
    spacingValue,
    fontFamilyValue,
    glassIntensityValue,
    cardStyleValue,
    shadowValue,
    // Mobile-specific properties
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
    mobileConfig: defaultMobileTheme,
  };

  return (
    <DashboardThemeContext.Provider value={value}>
      {children}
    </DashboardThemeContext.Provider>
  );
}

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext);
  if (context === undefined) {
    throw new Error('useDashboardTheme must be used within a DashboardThemeProvider');
  }
  return context;
}
