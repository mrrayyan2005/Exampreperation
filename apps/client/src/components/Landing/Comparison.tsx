import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';

const comparisons = [
    {
        feature: 'AI-Powered Study Planning',
        us: true,
        traditional: false,
        others: 'limited'
    },
    {
        feature: 'Adaptive Scheduling',
        us: true,
        traditional: false,
        others: false
    },
    {
        feature: 'Progress Analytics & Insights',
        us: true,
        traditional: 'manual',
        others: 'basic'
    },
    {
        feature: 'Spaced Repetition System',
        us: true,
        traditional: false,
        others: true
    },
    {
        feature: 'Mock Test Generation',
        us: true,
        traditional: 'limited',
        others: 'limited'
    },
    {
        feature: 'Multi-Subject Management',
        us: true,
        traditional: true,
        others: true
    },
    {
        feature: 'Real-time Collaboration',
        us: true,
        traditional: false,
        others: false
    },
    {
        feature: 'Performance Predictions',
        us: true,
        traditional: false,
        others: false
    }
];

const ComparisonSection = () => {
    const renderValue = (value: boolean | string) => {
        if (value === true) {
            return <Check className="h-6 w-6 text-green-500 mx-auto" />;
        }
        if (value === false) {
            return <X className="h-6 w-6 text-gray-300 mx-auto" />;
        }
        return <span className="text-sm text-muted-foreground capitalize">{value}</span>;
    };

    return (
        <section className="py-24 bg-background relative overflow-hidden dark:bg-muted/20">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-bold mb-6">
                        <Zap className="h-4 w-4" />
                        <span>Comparison</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
                        Why Choose Us?
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        See how we stack up against traditional methods and other platforms.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto"
                >
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-card dark:bg-card/50 rounded-3xl shadow-xl border border-border/60 dark:border-border/40 overflow-hidden">
                        <div className="grid grid-cols-4 bg-gradient-to-r from-primary to-secondary text-white">
                            <div className="p-6 font-bold text-lg">Feature</div>
                            <div className="p-6 text-center font-bold text-lg border-l border-white/20">
                                Our Platform
                                <div className="text-xs font-normal mt-1 opacity-90">Everything you need</div>
                            </div>
                            <div className="p-6 text-center font-bold text-lg border-l border-white/20">
                                Traditional Methods
                                <div className="text-xs font-normal mt-1 opacity-90">Books & Notes</div>
                            </div>
                            <div className="p-6 text-center font-bold text-lg border-l border-white/20">
                                Other Apps
                                <div className="text-xs font-normal mt-1 opacity-90">Basic Tools</div>
                            </div>
                        </div>

                        {comparisons.map((item, index) => (
                            <div
                                key={index}
                                className={`grid grid-cols-4 ${index % 2 === 0 ? 'bg-muted/40 dark:bg-muted/20' : 'bg-card dark:bg-card/50'
                                    } hover:bg-muted/60 dark:hover:bg-muted/30 transition-colors`}
                            >
                                <div className="p-6 font-medium text-foreground">{item.feature}</div>
                                <div className="p-6 flex justify-center items-center border-l border-border/60 dark:border-border/40 bg-green-50/50 dark:bg-green-500/10">
                                    {renderValue(item.us)}
                                </div>
                                <div className="p-6 flex justify-center items-center border-l border-border/60 dark:border-border/40">
                                    {renderValue(item.traditional)}
                                </div>
                                <div className="p-6 flex justify-center items-center border-l border-border/60 dark:border-border/40">
                                    {renderValue(item.others)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {comparisons.map((item, index) => (
                            <div key={index} className="bg-card dark:bg-card/50 rounded-2xl shadow-lg border border-border/60 dark:border-border/40 p-6">
                                <h3 className="font-bold text-lg mb-4 text-foreground">{item.feature}</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Our Platform</span>
                                        {renderValue(item.us)}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Traditional</span>
                                        {renderValue(item.traditional)}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Other Apps</span>
                                        {renderValue(item.others)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ComparisonSection;
