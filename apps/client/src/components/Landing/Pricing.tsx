import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const PricingSection = () => {
    return (
        <section id="pricing" className="py-24 bg-background relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-foreground sm:text-5xl">Invest in Your Future</h2>
                    <p className="mt-4 text-muted-foreground text-lg">Transparent pricing. No hidden fees. Cancel anytime.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-card rounded-3xl p-8 border border-border/60 shadow-lg hover:shadow-xl transition-all"
                    >
                        <div className="mb-4 text-muted-foreground font-bold uppercase tracking-wider text-sm">Starter</div>
                        <div className="text-4xl font-black text-foreground mb-2">Free</div>
                        <div className="text-muted-foreground mb-8 text-sm">Forever</div>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Basic Study Planner",
                                "Access to Public Groups",
                                "5 Flashcard Decks",
                                "Limited Mock Tests",
                                "Community Support"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-5 w-5 text-foreground" /> {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/register" className="w-full block text-center py-3 rounded-xl border-2 border-foreground text-foreground font-bold hover:bg-foreground hover:text-white transition-all">
                            Get Started
                        </Link>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="relative z-10 bg-foreground dark:bg-muted rounded-[2rem] p-8 shadow-2xl transform scale-105 border border-foreground/60 dark:border-border/60"
                    >
                        <div className="absolute top-0 right-0 bg-secondary dark:bg-accent text-foreground dark:text-background text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-[1.8rem]">POPULAR</div>
                        <div className="mb-4 text-secondary dark:text-accent font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                            <Zap className="h-4 w-4" /> Pro Student
                        </div>
                        <div className="flex items-baseline mb-2">
                            <span className="text-5xl font-black text-primary-foreground dark:text-foreground">$9</span>
                            <span className="text-muted-foreground dark:text-muted-foreground ml-1">/mo</span>
                        </div>
                        <div className="text-muted-foreground dark:text-muted-foreground mb-8 text-sm">Billed annually</div>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Everything in Starter",
                                "Unlimited AI Tests & Questions",
                                "Private Study Rooms",
                                "Unlimited Flashcards",
                                "Advanced Analytics",
                                "Priority Support"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium text-primary-foreground dark:text-foreground">
                                    <div className="bg-primary dark:bg-accent rounded-full p-0.5">
                                        <CheckCircle2 className="h-4 w-4 text-white dark:text-background" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/register" className="w-full block text-center py-4 rounded-xl bg-primary dark:bg-accent text-white dark:text-background font-bold shadow-lg shadow-primary/25 dark:shadow-accent/25 hover:shadow-xl hover:scale-[1.02] transition-all">
                            Start 14-Day Free Trial
                        </Link>
                    </motion.div>

                    {/* Institution Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-card rounded-3xl p-8 border border-border/60 shadow-lg hover:shadow-xl transition-all"
                    >
                        <div className="mb-4 text-muted-foreground font-bold uppercase tracking-wider text-sm">Institution</div>
                        <div className="text-4xl font-black text-foreground mb-2">Custom</div>
                        <div className="text-muted-foreground mb-8 text-sm">For schools & colleges</div>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Admin Dashboard",
                                "Bulk Student Management",
                                "Custom Resources Library",
                                "White-label Options",
                                "API Access"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-5 w-5 text-foreground" /> {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/contact" className="w-full block text-center py-3 rounded-xl border-2 border-foreground text-foreground font-bold hover:bg-foreground hover:text-white transition-all">
                            Contact Sales
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
