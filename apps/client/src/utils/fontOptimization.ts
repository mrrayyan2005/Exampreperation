import { useState, useEffect } from 'react';

/**
 * Font Optimization Utilities
 * 
 * Provides font preloading, subsetting hints, and display swap strategies
 */

interface FontConfig {
     family: string;
     weights?: number[];
     subsets?: string[];
     display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
   }
   
   /**
    * Preload critical fonts to prevent FOUT/FOIT
    * 
    * Usage:
    * preloadFont({
    *   family: 'Inter',
    *   weights: [400, 600, 700],
    *   display: 'swap'
    * });
    */
   export function preloadFont(config: FontConfig): void {
     if (typeof document === 'undefined') return;
   
     const { family, weights = [400], display = 'swap' } = config;
   
     weights.forEach((weight) => {
       const link = document.createElement('link');
       link.rel = 'preload';
       link.as = 'font';
       link.type = 'font/woff2';
       link.href = `/fonts/${family.toLowerCase()}-${weight}.woff2`;
       link.crossOrigin = 'anonymous';
   
       // Add to head
       document.head.appendChild(link);
     });
   
     // Add font-display: swap to prevent invisible text during load
     const style = document.createElement('style');
     style.textContent = `
       @font-face {
         font-family: '${family}';
         font-display: ${display};
       }
     `;
     document.head.appendChild(style);
   }
   
   /**
    * Generate Google Fonts URL with optimized parameters
    * 
    * Usage:
    * const fontUrl = getGoogleFontsUrl({
    *   family: 'Inter',
    *   weights: [400, 600, 700],
    *   subsets: ['latin', 'latin-ext'],
    *   display: 'swap'
    * });
    */
   export function getGoogleFontsUrl(config: FontConfig): string {
     const { family, weights = [400], subsets = ['latin'], display = 'swap' } = config;
   
     const weightsStr = weights.join(',');
     const subsetsStr = subsets.join(',');
   
     return `https://fonts.googleapis.com/css2?family=${family}:wght@${weightsStr}&display=${display}&subset=${subsetsStr}`;
   }
   
   /**
    * Inject font preconnect hints for Google Fonts
    * Improves font loading performance
    */
   export function injectFontPreconnect(): void {
     if (typeof document === 'undefined') return;
   
     const preconnectUrls = [
       'https://fonts.googleapis.com',
       'https://fonts.gstatic.com',
     ];
   
     preconnectUrls.forEach((url) => {
       // Check if already exists
       if (document.querySelector(`link[href="${url}"]`)) return;
   
       const link = document.createElement('link');
       link.rel = 'preconnect';
       link.href = url;
   
       if (url.includes('gstatic')) {
         link.crossOrigin = 'anonymous';
       }
   
       document.head.appendChild(link);
     });
   }
   
   /**
    * Font loading strategy configuration
    * 
    * Usage in your main.tsx or App.tsx:
    * 
    * useEffect(() => {
    *   injectFontPreconnect();
    *   preloadFont({
    *     family: 'Inter',
    *     weights: [400, 600, 700],
    *     display: 'swap'
    *   });
    * }, []);
    */
   
   /**
    * Hook to detect font loading status
    */
   export function useFontLoading(fontFamily: string): boolean {
     const [isLoaded, setIsLoaded] = useState(false);
   
     useEffect(() => {
       if (typeof document === 'undefined') return;
   
       // Check if font is already loaded
       if (document.fonts) {
         document.fonts.ready.then(() => {
           setIsLoaded(true);
         });
   
         // Also check specific font
         document.fonts.load(`1em ${fontFamily}`).then(() => {
           setIsLoaded(true);
         });
       } else {
         // Fallback: assume loaded after timeout
         const timer = setTimeout(() => setIsLoaded(true), 3000);
         return () => clearTimeout(timer);
       }
     }, [fontFamily]);
   
     return isLoaded;
   }
   
/**
 * CSS for font optimization
    * Add to your global CSS:
    * 
    * @import './font-optimization.css';
    */
   export const fontOptimizationCSS = `
     /* Prevent layout shift from font loading */
     html {
       font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
     }
   
     /* Apply custom font once loaded */
     .fonts-loaded {
       font-family: var(--font-family-base), system-ui, sans-serif;
     }
   
     /* Optimize font rendering */
     body {
       -webkit-font-smoothing: antialiased;
       -moz-osx-font-smoothing: grayscale;
       text-rendering: optimizeLegibility;
     }
   
     /* Prevent FOIT (Flash of Invisible Text) */
     @font-face {
       font-display: swap;
     }
   `;