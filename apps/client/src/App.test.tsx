import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
// We need to mock lazy loaded components or wrap in Suspense for testing if not handled automatically.
// However, since we wrapped Routes in Suspense in App.tsx, render(<App />) should work but might need to wait for lazy components.
// For a simple smoke test, we can check if it renders without crashing.

import App from './App';

describe('App', () => {
    it('renders without crashing', () => {
        // Basic smoke test
        // We might need to mock matchMedia if used by some UI components
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query: any) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: () => { }, // Deprecated
                removeListener: () => { }, // Deprecated
                addEventListener: () => { },
                removeEventListener: () => { },
                dispatchEvent: () => false,
            }),
        });

        // ResizeObserver mock
        global.ResizeObserver = class ResizeObserver {
            observe() { }
            unobserve() { }
            disconnect() { }
        };

        render(<App />);
        // Just verifying it doesn't throw.
        expect(true).toBe(true);
    });
});
