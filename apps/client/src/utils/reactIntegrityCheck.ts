/**
 * React Integrity Check — Development only
 *
 * Detects if multiple copies of React are present in the app at runtime.
 * Call this at startup in main.tsx. Warns in dev if duplicates detected.
 */
export function checkReactIntegrity(): void {
  if (import.meta.env.PROD) return;

  // React DevTools hook tracks all renderers. If >1 renderer exists with
  // different React instances, hooks will fail with "null dispatcher" errors.
  const devtools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (devtools?.renderers) {
    const rendererCount = devtools.renderers.size;
    if (rendererCount > 1) {
      console.error(
        `[ReactIntegrityCheck] ⚠️ ${rendererCount} React renderers detected!\n` +
        `This usually means multiple copies of React are loaded.\n` +
        `Fix: check vite.config.ts → resolve.alias and resolve.dedupe for 'react' and 'react-dom'.`
      );
    } else {
      console.log(`[ReactIntegrityCheck] ✅ Single React renderer detected. OK.`);
    }
  }
}

/**
 * Check that the app is using a fresh version (no stale SW caches serving old chunks).
 * Call this after mount in development to detect stale-cache symptoms.
 */
export function checkForStaleCaches(): void {
  if (import.meta.env.PROD) return;

  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    if (registrations.length > 0) {
      console.warn(
        `[SWCheck] ⚠️ ${registrations.length} service worker(s) detected in development mode.\n` +
        `Service workers in dev can cause "504 Outdated Optimize Dep" errors.\n` +
        `They should be automatically unregistered by main.tsx — if you still see this, do a hard refresh.`
      );
    } else {
      console.log(`[SWCheck] ✅ No service workers in dev mode. OK.`);
    }
  });
}
