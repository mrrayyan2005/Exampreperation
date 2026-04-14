// Mobile Theme Optimizations
// These utilities help adapt the theme for mobile devices

export type MobileBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TouchTargetSize = 'small' | 'medium' | 'large';
export type MobileDensity = 'compact' | 'normal' | 'spacious';

export interface MobileThemeConfig {
  // Breakpoint values (in pixels)
  breakpoints: {
    xs: number;  // Extra small (phones)
    sm: number;  // Small (large phones, small tablets)
    md: number;  // Medium (tablets)
    lg: number;  // Large (desktops)
    xl: number;  // Extra large (large desktops)
  };
  
  // Touch target sizes (minimum 44px for iOS, 48px for Android)
  touchTargets: {
    small: string;   // 36px - Small buttons, icons
    medium: string;  // 44px - Standard buttons (iOS minimum)
    large: string;   // 48px - Large buttons (Android minimum)
  };
  
  // Mobile-specific spacing
  spacing: {
    safeAreaTop: string;
    safeAreaBottom: string;
    safeAreaLeft: string;
    safeAreaRight: string;
    gestureArea: string;  // Area reserved for gestures
  };
  
  // Typography scale for mobile
  typography: {
    xs: string;   // 10px - Captions, badges
    sm: string;   // 12px - Small text
    base: string; // 14px - Body text on mobile
    lg: string;   // 16px - Large body text
    xl: string;   // 18px - Headings
    '2xl': string;// 20px - Large headings
    '3xl': string;// 24px - Hero text
  };
  
  // Mobile shadows (lighter for performance)
  shadows: {
    none: string;
    sm: string;   // Subtle shadow
    md: string;   // Medium shadow
    lg: string;   // Large shadow
    floating: string; // For floating action buttons
  };
  
  // Border radius for mobile
  radius: {
    none: string;
    sm: string;   // 4px - Small elements
    md: string;   // 8px - Standard
    lg: string;   // 12px - Large elements
    xl: string;   // 16px - Cards on mobile
    full: string; // 9999px - Pills
  };
  
  // Animation durations (shorter for mobile)
  animation: {
    instant: string; // 0ms
    fast: string;    // 100ms
    normal: string;  // 200ms
    slow: string;    // 300ms
    modal: string;   // 250ms - Modal transitions
  };
}

// Default mobile theme configuration
export const defaultMobileTheme: MobileThemeConfig = {
  breakpoints: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  touchTargets: {
    small: '36px',
    medium: '44px', // iOS minimum
    large: '48px',  // Android minimum
  },
  
  spacing: {
    safeAreaTop: 'env(safe-area-inset-top, 0px)',
    safeAreaBottom: 'env(safe-area-inset-bottom, 0px)',
    safeAreaLeft: 'env(safe-area-inset-left, 0px)',
    safeAreaRight: 'env(safe-area-inset-right, 0px)',
    gestureArea: '20px', // Bottom gesture area
  },
  
  typography: {
    xs: '0.625rem',   // 10px
    sm: '0.75rem',    // 12px
    base: '0.875rem', // 14px (mobile body)
    lg: '1rem',       // 16px
    xl: '1.125rem',   // 18px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 2px 4px -1px rgb(0 0 0 / 0.1)',
    lg: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    floating: '0 8px 16px -4px rgb(0 0 0 / 0.15)',
  },
  
  radius: {
    none: '0',
    sm: '0.25rem',  // 4px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    full: '9999px',
  },
  
  animation: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    modal: '250ms',
  },
};

// CSS custom properties generator
export function generateMobileCSSVariables(config: MobileThemeConfig = defaultMobileTheme): string {
  return `
    /* Mobile Breakpoints */
    --mobile-breakpoint-xs: ${config.breakpoints.xs}px;
    --mobile-breakpoint-sm: ${config.breakpoints.sm}px;
    --mobile-breakpoint-md: ${config.breakpoints.md}px;
    --mobile-breakpoint-lg: ${config.breakpoints.lg}px;
    --mobile-breakpoint-xl: ${config.breakpoints.xl}px;
    
    /* Touch Targets */
    --touch-target-sm: ${config.touchTargets.small};
    --touch-target-md: ${config.touchTargets.medium};
    --touch-target-lg: ${config.touchTargets.large};
    
    /* Safe Areas */
    --safe-area-top: ${config.spacing.safeAreaTop};
    --safe-area-bottom: ${config.spacing.safeAreaBottom};
    --safe-area-left: ${config.spacing.safeAreaLeft};
    --safe-area-right: ${config.spacing.safeAreaRight};
    --gesture-area: ${config.spacing.gestureArea};
    
    /* Mobile Typography */
    --font-size-mobile-xs: ${config.typography.xs};
    --font-size-mobile-sm: ${config.typography.sm};
    --font-size-mobile-base: ${config.typography.base};
    --font-size-mobile-lg: ${config.typography.lg};
    --font-size-mobile-xl: ${config.typography.xl};
    --font-size-mobile-2xl: config.typography['2xl']};
    --font-size-mobile-3xl: ${config.typography['3xl']};
    
    /* Mobile Shadows */
    --shadow-mobile-none: ${config.shadows.none};
    --shadow-mobile-sm: ${config.shadows.sm};
    --shadow-mobile-md: ${config.shadows.md};
    --shadow-mobile-lg: ${config.shadows.lg};
    --shadow-mobile-floating: ${config.shadows.floating};
    
    /* Mobile Radius */
    --radius-mobile-none: ${config.radius.none};
    --radius-mobile-sm: ${config.radius.sm};
    --radius-mobile-md: ${config.radius.md};
    --radius-mobile-lg: ${config.radius.lg};
    --radius-mobile-xl: ${config.radius.xl};
    --radius-mobile-full: ${config.radius.full};
    
    /* Mobile Animation */
    --duration-instant: ${config.animation.instant};
    --duration-fast: ${config.animation.fast};
    --duration-normal: ${config.animation.normal};
    --duration-slow: ${config.animation.slow};
    --duration-modal: ${config.animation.modal};
  `;
}

// Hook to detect mobile viewport
export function useMobileDetection(): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: MobileBreakpoint;
  touchTarget: (size: TouchTargetSize) => string;
} {
  // This will be implemented as a React hook in the actual component
  return {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: 'lg',
    touchTarget: (size: TouchTargetSize) => defaultMobileTheme.touchTargets[size],
  };
}

// Utility classes for mobile
export const mobileUtilityClasses = {
  // Safe area padding
  safeAreaTop: 'pt-[env(safe-area-inset-top)]',
  safeAreaBottom: 'pb-[env(safe-area-inset-bottom)]',
  safeAreaX: 'px-[env(safe-area-inset-left)] px-[env(safe-area-inset-right)]',
  
  // Touch targets
  touchTargetSm: 'min-h-[36px] min-w-[36px]',
  touchTargetMd: 'min-h-[44px] min-w-[44px]',
  touchTargetLg: 'min-h-[48px] min-w-[48px]',
  
  // Mobile typography
  textMobileXs: 'text-[10px]',
  textMobileSm: 'text-xs',
  textMobileBase: 'text-sm',
  textMobileLg: 'text-base',
  
  // Mobile spacing
  gapMobile: 'gap-2',
  pMobile: 'p-3',
  mMobile: 'm-3',
  
  // Bottom sheet styles
  bottomSheet: 'fixed inset-x-0 bottom-0 rounded-t-2xl max-h-[90vh]',
  
  // Mobile card
  cardMobile: 'rounded-xl shadow-mobile-md',
  
  // Mobile input
  inputMobile: 'h-12 text-base px-4 rounded-xl',
  
  // Mobile button
  buttonMobile: 'h-12 px-6 text-sm font-medium rounded-xl',
};