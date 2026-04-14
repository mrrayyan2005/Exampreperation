import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';

const StickyCTA = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            
            setScrollProgress(progress);
            
            // Show after scrolling 20% of the page
            setIsVisible(scrollTop > window.innerHeight * 0.2);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="fixed bottom-0 left-0 right-0 z-50"
                >
                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-200">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                            style={{ width: `${scrollProgress}%` }}
                        />
                    </div>

                    {/* CTA Bar */}
                    <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl">
                        <div className="container mx-auto px-6 py-4">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary hidden sm:flex items-center justify-center text-white font-bold text-xl">
                                        EP
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground text-lg">
                                            Ready to Transform Your Study Routine?
                                        </p>
                                        <p className="text-sm text-muted-foreground hidden md:block">
                                            Join 50,000+ students mastering their exams
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                    >
                                        Start Free Trial
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    
                                    <button
                                        onClick={() => setIsVisible(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default StickyCTA;
