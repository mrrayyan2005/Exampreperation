import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CookiePreferencesModal } from './CookiePreferencesModal';
import { useCookie } from '@/contexts/CookieContext';

export const CookieConsent: React.FC = () => {
    const { hasInteracted, acceptAll } = useCookie();
    const [showBanner, setShowBanner] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);

    useEffect(() => {
        // Check if user has already interacted with cookie consent
        if (!hasInteracted) {
            setShowBanner(true);
        } else {
            setShowBanner(false);
        }
    }, [hasInteracted]);

    if (!showBanner) return null;

    return (
        <>
            <AnimatePresence>
                {showBanner && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-background border-t border-border shadow-lg"
                    >
                        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2">🍪 We value your privacy!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our website uses tracking cookies to understand how you interact with it. The tracking will be enabled only if you accept.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPreferences(true)}
                                    className="w-full md:w-auto"
                                >
                                    Manage preferences
                                </Button>
                                <Button
                                    onClick={acceptAll}
                                    className="w-full md:w-auto"
                                >
                                    Accept
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CookiePreferencesModal
                open={showPreferences}
                onOpenChange={setShowPreferences}
            />
        </>
    );
};
