import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Gift, Zap, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExitIntentPopup = () => {
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Track session start time
        const sessionStartKey = 'sessionStartTime';
        let sessionStartTime = sessionStorage.getItem(sessionStartKey);

        if (!sessionStartTime) {
            sessionStartTime = Date.now().toString();
            sessionStorage.setItem(sessionStartKey, sessionStartTime);
        }

        // Configuration: Minimum time on site before exit intent triggers (10 minutes)
        const MIN_TIME_ON_SITE = 10 * 60 * 1000; // 600,000 ms

        // Check if popup was shown before and when
        const lastShownTime = sessionStorage.getItem('exitPopupLastShown');
        const popupDismissed = sessionStorage.getItem('exitPopupDismissed');

        const handleMouseLeave = (e: MouseEvent) => {
            // Only trigger if mouse is leaving from the top
            if (e.clientY <= 0) {
                const now = Date.now();
                const sessionDuration = now - parseInt(sessionStartTime || '0');

                // Check if user has been on site long enough
                if (sessionDuration < MIN_TIME_ON_SITE) {
                    console.log(`Exit intent ignored: User on site for only ${Math.round(sessionDuration / 1000)}s (min ${MIN_TIME_ON_SITE / 1000}s)`);
                    return;
                }

                // Check if popup was dismissed in this session
                if (popupDismissed === 'true') {
                    return; // Don't show again in this session
                }

                // Check if 20 minutes (1200000ms) have passed since last shown
                if (lastShownTime) {
                    const timeSinceLastShown = now - parseInt(lastShownTime);
                    if (timeSinceLastShown < 1200000) { // 20 minutes = 1200000ms
                        return; // Don't show yet
                    }
                }

                // Show the popup and record the time
                setShowPopup(true);
                sessionStorage.setItem('exitPopupLastShown', now.toString());
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, []);

    const handleClose = () => {
        setShowPopup(false);
        // Mark as dismissed for this session
        sessionStorage.setItem('exitPopupDismissed', 'true');
    };

    return (
        <AnimatePresence>
            {showPopup && (
                <>
                    {/* Enhanced Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
                    />

                    {/* Premium Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 40 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="fixed z-[101] w-[90%] max-w-lg"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        {/* Outer Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-[2rem] blur-2xl opacity-40"></div>

                        {/* Main Card */}
                        <div className="relative bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-900 rounded-[1.75rem] shadow-2xl overflow-hidden border border-white/10">
                            {/* Animated Background Pattern */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30"></div>

                            {/* Gradient Orbs */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl"></div>

                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all z-20 border border-white/10 hover:scale-110"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>

                            {/* Content */}
                            <div className="relative p-5 md:p-8 max-h-[90vh] overflow-y-auto">
                                <div className="relative z-10">
                                    {/* Special Offer Badge */}
                                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full px-3 py-1.5 mb-4 shadow-lg">
                                        <Gift className="h-3 w-3 text-white" />
                                        <span className="text-xs font-bold text-white">EXCLUSIVE OFFER</span>
                                    </div>

                                    {/* Headline */}
                                    <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
                                        Wait! Before You Go...
                                    </h2>

                                    {/* Subheadline with Highlight */}
                                    <div className="mb-4">
                                        <p className="text-base md:text-lg text-purple-100 mb-1">
                                            Get <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text font-black text-xl md:text-2xl">20% OFF</span> your first month
                                        </p>
                                        <p className="text-sm text-purple-200/80">
                                            + Exclusive study templates worth <span className="font-bold text-white">$49</span>
                                        </p>
                                    </div>

                                    {/* Benefits Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                        {[
                                            { icon: Sparkles, text: 'AI-powered personalized study plans', color: 'from-purple-400 to-pink-400' },
                                            { icon: Zap, text: 'Unlimited practice tests & questions', color: 'from-blue-400 to-cyan-400' },
                                            { icon: TrendingUp, text: 'Progress analytics & insights', color: 'from-green-400 to-emerald-400' },
                                            { icon: Users, text: 'Join 50,000+ successful students', color: 'from-orange-400 to-yellow-400' }
                                        ].map((benefit, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-start gap-2 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors"
                                            >
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                                    <benefit.icon className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="text-white/90 text-xs leading-relaxed pt-0.5">{benefit.text}</span>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* CTA Buttons */}
                                    <div className="space-y-3">
                                        <Link
                                            to="/register"
                                            onClick={handleClose}
                                            className="group relative w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold text-base shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-[1.02] overflow-hidden"
                                        >
                                            <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"></span>
                                            <span className="relative">Claim My 20% Discount</span>
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>

                                        {/* Login Link for Existing Users */}
                                        <div className="text-center">
                                            <p className="text-white/60 text-sm">
                                                Already have an account?{' '}
                                                <Link
                                                    to="/login"
                                                    onClick={handleClose}
                                                    className="text-white font-semibold hover:text-purple-300 transition-colors underline underline-offset-2"
                                                >
                                                    Sign in here
                                                </Link>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Timer & Urgency */}
                                    <div className="mt-3 flex items-center justify-center gap-1.5 text-yellow-400">
                                        <span className="text-base">⏰</span>
                                        <p className="text-[10px] font-semibold">
                                            Limited time - Expires in 24 hours!
                                        </p>
                                    </div>

                                    {/* Trust Badge */}
                                    <div className="mt-3 pt-3 border-t border-white/10 text-center">
                                        <p className="text-white/60 text-[10px]">
                                            ✓ No credit card • ✓ Cancel anytime • ✓ Money-back guarantee
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ExitIntentPopup;
