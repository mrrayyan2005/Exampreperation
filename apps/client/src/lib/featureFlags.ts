/**
    * Feature Flags System
    * 
    * Simple feature flag management for gradual rollouts and A/B testing
    */
   
   import { useState, useEffect } from 'react';
   
   type FeatureFlagValue = boolean | string | number;
   
   interface FeatureFlags {
     [key: string]: FeatureFlagValue;
   }
   
   // Default feature flags
   const defaultFlags: FeatureFlags = {
     // Core features
     'new-dashboard': false,
     'dark-mode': true,
     'beta-features': false,
     
     // Performance features
     'lazy-load-images': true,
     'virtual-scroll': true,
     'service-worker': true,
     
     // Experimental features
     'ai-assistant': false,
     'collaborative-editing': false,
     'real-time-sync': true,
   };
   
   // Load flags from localStorage or environment
   function loadFlags(): FeatureFlags {
     try {
       const stored = localStorage.getItem('feature-flags');
       if (stored) {
         return { ...defaultFlags, ...JSON.parse(stored) };
       }
     } catch {
       // Ignore parse errors
     }
     
     // Check for environment overrides
     const envFlags: FeatureFlags = {};
     if (import.meta.env.VITE_FEATURE_FLAGS) {
       try {
         const parsed = JSON.parse(import.meta.env.VITE_FEATURE_FLAGS);
         Object.assign(envFlags, parsed);
       } catch {
         // Ignore parse errors
       }
     }
     
     return { ...defaultFlags, ...envFlags };
   }
   
   // Feature flag store
   let currentFlags = loadFlags();
   const listeners = new Set<() => void>();
   
   export function getFlag(key: string): FeatureFlagValue {
     return currentFlags[key] ?? false;
   }
   
   export function isEnabled(key: string): boolean {
     return Boolean(getFlag(key));
   }
   
   export function setFlag(key: string, value: FeatureFlagValue): void {
     currentFlags = { ...currentFlags, [key]: value };
     
     try {
       localStorage.setItem('feature-flags', JSON.stringify(currentFlags));
     } catch {
       // Ignore storage errors
     }
     
     // Notify listeners
     listeners.forEach(listener => listener());
   }
   
   export function enableFeature(key: string): void {
     setFlag(key, true);
   }
   
   export function disableFeature(key: string): void {
     setFlag(key, false);
   }
   
   export function resetFlags(): void {
     currentFlags = { ...defaultFlags };
     
     try {
       localStorage.removeItem('feature-flags');
     } catch {
       // Ignore storage errors
     }
     
     listeners.forEach(listener => listener());
   }
   
   export function getAllFlags(): FeatureFlags {
     return { ...currentFlags };
   }
   
   // React hook for feature flags
   export function useFeatureFlag(key: string): boolean {
     const [enabled, setEnabled] = useState(() => isEnabled(key));
     
     useEffect(() => {
       const checkFlag = () => {
         setEnabled(isEnabled(key));
       };
       
       listeners.add(checkFlag);
       return () => {
         listeners.delete(checkFlag);
       };
     }, [key]);
     
     return enabled;
   }
   
   export function useFeatureFlags(): FeatureFlags {
     const [flags, setFlags] = useState(() => getAllFlags());
     
     useEffect(() => {
       const updateFlags = () => {
         setFlags(getAllFlags());
       };
       
       listeners.add(updateFlags);
       return () => {
         listeners.delete(updateFlags);
       };
     }, []);
     
     return flags;
   }
   
// Development tools
if (import.meta.env.DEV) {
  // Expose to window for debugging
  (window as any).featureFlags = {
    get: getFlag,
    set: setFlag,
    enable: enableFeature,
    disable: disableFeature,
    reset: resetFlags,
    all: getAllFlags,
  };
  
  console.warn('Feature Flags available at window.featureFlags');
  console.warn('Current flags:', getAllFlags());
}
