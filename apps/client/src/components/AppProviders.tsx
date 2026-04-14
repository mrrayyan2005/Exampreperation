import * as React from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieProvider } from "@/contexts/CookieContext";
import { CookieConsent } from "@/components/CookieConsent";
import { ThemeProvider } from "next-themes";
import { ThemeProvider as NotesThemeProvider } from "@/components/Notes/themes/ThemeContext";
import { DashboardThemeProvider } from "@/themes/DashboardThemeProvider";

import { GoogleOAuthProvider } from '@react-oauth/google';
import ErrorBoundary from './ErrorBoundary';
import { OnboardingTour } from './Shared/OnboardingTour';
import { NetworkStatusProvider } from '@/providers/NetworkStatusProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 2 minutes before refetching
      staleTime: 2 * 60 * 1000,
      // Cache data for 10 minutes even when not in use
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 2 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx client errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      // Refetch when window regains focus (user comes back to tab)
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect — let explicit invalidations handle it
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});

interface AppProvidersProps {
    children: React.ReactNode;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
if (import.meta.env.DEV) {
  console.log("Loaded Google Client ID:", GOOGLE_CLIENT_ID ? "Found" : "Missing");
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
                        <DashboardThemeProvider>
                            <NotesThemeProvider>
                                <AuthProvider>
                                    <CookieProvider>
                                        <TooltipProvider>
                                            <NetworkStatusProvider>
                                                <ErrorBoundary>
                                                    <Toaster />
                                                    <Sonner />
                                                    {children}
                                                    <CookieConsent />
                                                    <OnboardingTour />
                                                </ErrorBoundary>
                                            </NetworkStatusProvider>
                                        </TooltipProvider>
                                    </CookieProvider>
                                </AuthProvider>
                            </NotesThemeProvider>
                        </DashboardThemeProvider>
                    </ThemeProvider>
                </GoogleOAuthProvider>
            </QueryClientProvider>
        </Provider>
    );
}
