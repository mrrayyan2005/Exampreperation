import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppProviders } from "./components/AppProviders";
import { BrowserRouter } from "react-router-dom";
import { webVitalsMonitor } from "./utils/webVitals";
import { initSentry } from "./lib/sentry";

// ─── Preload framer-motion synchronously to prevent context race conditions ───
// Framer-motion uses React context internally. When lazy-loaded components
// import framer-motion dynamically, the context may not be initialized yet,
// causing "Cannot read properties of null (reading 'useContext')" errors.
// Importing it here ensures the context is ready before any component uses it.
import "framer-motion";

// ─── Initialize Sentry Error Tracking ───
// Captures errors and performance data in production
initSentry();

// ─── Initialize Web Vitals Monitoring ───
// Tracks Core Web Vitals (LCP, FID, CLS, TTFB, FCP, INP) and sends to analytics
webVitalsMonitor.initialize();

// ─── Global Robustness: catch chunk-load failures outside React's tree ─────────
// This fires when a dynamically imported chunk fails to load (network error, stale chunk, etc.)
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (
    reason instanceof Error &&
    (reason.message.includes('Failed to fetch dynamically imported module') ||
     reason.message.includes('Importing a module script failed'))
  ) {
    console.warn('[App] Chunk load failure detected, scheduling reload...');
    const retried = sessionStorage.getItem('global-chunk-retry');
    if (!retried) {
      sessionStorage.setItem('global-chunk-retry', 'true');
      // Clear caches to get fresh chunks
      const reload = () => window.location.reload();
      if ('caches' in window) {
        caches.keys().then(k => Promise.all(k.map(c => caches.delete(c)))).finally(reload);
      } else {
        reload();
      }
    }
  }
});

// Clear the global retry flag on a clean page load (not a reload)
if (!sessionStorage.getItem('global-chunk-retry')) {
  // Fresh load — reset all retry counters
  sessionStorage.removeItem('chunk-load-retry-count');
  sessionStorage.removeItem('error-boundary-reloaded');
}
sessionStorage.removeItem('global-chunk-retry');

createRoot(document.getElementById("root")!).render(
  <BrowserRouter
    {...{
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }
    }}
  >
    <AppProviders>
      <App />
    </AppProviders>
  </BrowserRouter>
);

// Service Worker: ONLY register in production.
// In development, the SW intercepts Vite's optimized dep requests and returns
// stale cached chunks, causing "504 Outdated Optimize Dep" and hook errors.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  } else {
    // In dev: unregister any existing service workers and clear their caches
    // to prevent stale resource interception.
    window.addEventListener('load', async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.warn('[Dev] Unregistered service worker:', registration.scope);
      }
      // Also clear all caches to ensure fresh resource fetching
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.warn('[Dev] Cleared cache:', cacheName);
      }
    });
  }
}
