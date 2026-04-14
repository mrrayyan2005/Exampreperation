import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { useAuth } from './AuthContext';

type CookieConsent = {
    analytics: boolean;
    marketing: boolean;
    necessary: boolean;
};

type CookieContextType = {
    consent: CookieConsent | null;
    hasInteracted: boolean;
    acceptAll: () => void;
    savePreferences: (consent: CookieConsent) => void;
    resetConsent: () => void;
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export const useCookie = () => {
    const context = useContext(CookieContext);
    if (!context) {
        throw new Error('useCookie must be used within a CookieProvider');
    }
    return context;
};

const STORAGE_KEY = 'cookie-consent';

export const CookieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [consent, setConsent] = useState<CookieConsent | null>(null);
    const [hasInteracted, setHasInteracted] = useState(false);
    const { user, isAuthenticated } = useAuth();

    // Load initial consent from localStorage or User profile
    useEffect(() => {
        // If authenticated, prefer user settings from backend
        if (isAuthenticated && user?.cookieConsent) {
            setConsent(user.cookieConsent);
            setHasInteracted(true);
            // Also update localStorage to keep them in sync
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user.cookieConsent));
            return;
        }

        // Fallback to localStorage
        const storedConsent = localStorage.getItem(STORAGE_KEY);
        if (storedConsent) {
            try {
                setConsent(JSON.parse(storedConsent));
                setHasInteracted(true);
            } catch (e) {
                console.error('Failed to parse cookie consent', e);
            }
        }
    }, [isAuthenticated, user]);

    const acceptAll = () => {
        const newConsent = {
            analytics: true,
            marketing: true,
            necessary: true,
        };
        savePreferences(newConsent);
    };

    const savePreferences = async (newConsent: CookieConsent) => {
        setConsent(newConsent);
        setHasInteracted(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConsent));

        if (isAuthenticated) {
            try {
                await axiosInstance.put('/auth/cookie-preferences', newConsent);
            } catch (error) {
                console.error('Failed to sync cookie preferences', error);
            }
        }
    };

    const resetConsent = () => {
        setConsent(null);
        setHasInteracted(false);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <CookieContext.Provider
            value={{
                consent,
                hasInteracted,
                acceptAll,
                savePreferences,
                resetConsent,
            }}
        >
            {children}
        </CookieContext.Provider>
    );
};
