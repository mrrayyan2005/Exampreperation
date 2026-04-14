/**
    * Mobile Viewport Hooks
    * 
    * Detect mobile devices and optimize viewport behavior
    */
   
   import { useState, useEffect, useCallback } from 'react';
   
   interface ViewportState {
     width: number;
     height: number;
     isMobile: boolean;
     isTablet: boolean;
     isDesktop: boolean;
     isLandscape: boolean;
     isPortrait: boolean;
     safeAreaInsets: {
       top: number;
       right: number;
       bottom: number;
       left: number;
     };
   }
   
   export function useViewport(): ViewportState {
     const [viewport, setViewport] = useState<ViewportState>(() => ({
       width: window.innerWidth,
       height: window.innerHeight,
       isMobile: window.innerWidth < 640,
       isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
       isDesktop: window.innerWidth >= 1024,
       isLandscape: window.innerWidth > window.innerHeight,
       isPortrait: window.innerWidth <= window.innerHeight,
       safeAreaInsets: {
         top: 0,
         right: 0,
         bottom: 0,
         left: 0,
       },
     }));
   
     useEffect(() => {
       const updateViewport = () => {
         const width = window.innerWidth;
         const height = window.innerHeight;
   
         const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0', 10);
         const safeAreaRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0', 10);
         const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0', 10);
         const safeAreaLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0', 10);
   
         setViewport({
           width,
           height,
           isMobile: width < 640,
           isTablet: width >= 640 && width < 1024,
           isDesktop: width >= 1024,
           isLandscape: width > height,
           isPortrait: width <= height,
           safeAreaInsets: {
             top: safeAreaTop,
             right: safeAreaRight,
             bottom: safeAreaBottom,
             left: safeAreaLeft,
           },
         });
       };
   
       window.addEventListener('resize', updateViewport);
       window.addEventListener('orientationchange', updateViewport);
   
       return () => {
         window.removeEventListener('resize', updateViewport);
         window.removeEventListener('orientationchange', updateViewport);
       };
     }, []);
   
     return viewport;
   }
   
   export function useNetwork() {
     const [network, setNetwork] = useState({
       online: navigator.onLine,
       effectiveType: null as string | null,
       saveData: false,
     });
   
     useEffect(() => {
       const connection = (navigator as any).connection;
   
       const updateNetwork = () => {
         setNetwork({
           online: navigator.onLine,
           effectiveType: connection?.effectiveType || null,
           saveData: connection?.saveData || false,
         });
       };
   
       window.addEventListener('online', updateNetwork);
       window.addEventListener('offline', updateNetwork);
   
       if (connection) {
         connection.addEventListener('change', updateNetwork);
       }
   
       return () => {
         window.removeEventListener('online', updateNetwork);
         window.removeEventListener('offline', updateNetwork);
         if (connection) {
           connection.removeEventListener('change', updateNetwork);
         }
       };
     }, []);
   
     return network;
   }