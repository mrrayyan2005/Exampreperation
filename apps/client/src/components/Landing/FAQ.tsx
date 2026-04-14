import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: 'Is there a free trial available?',
        answer: 'Yes! You can start with our free plan which includes core features like goal tracking, basic analytics, and study scheduling. No credit card required.'
    },
    {
        question: 'How does the AI-powered study planner work?',
        answer: 'Our AI analyzes your study patterns, performance data, and exam deadlines to create personalized study schedules. It adapts in real-time based on your progress and automatically adjusts when you fall behind.'
    },
    {
        question: 'Can I use this for multiple subjects and exams?',
        answer: 'Absolutely! You can manage unlimited subjects, exams, and certifications all in one dashboard. Our system helps you prioritize and balance study time across all your commitments.'
    },
    {
        question: 'Is my study data secure and private?',
        answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We never share your personal information or study data with third parties. You can export or delete your data anytime.'
    },
    {
        question: 'What if I miss my study schedule?',
        answer: "Don't worry! Our adaptive scheduling automatically adjusts your plan when life gets in the way. The AI redistributes study sessions to keep you on track without overwhelming you."
    },
    {
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes, you can cancel anytime with no questions asked. Your data remains accessible until the end of your billing period, and you can always return to the free plan.'
    },
    {
        question: 'Do you offer student discounts?',
        answer: 'Yes! Students get 20% off with a valid .edu email address. We also offer special pricing for educational institutions and bulk licenses.'
    },
    {
        question: 'How is this different from other study apps?',
        answer: 'Unlike basic to-do lists, we provide comprehensive exam preparation with AI-powered scheduling, spaced repetition, performance analytics, and adaptive learning. Everything you need in one integrated platform.'
    }
];

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 bg-gradient-to-b from-background to-muted/10 dark:from-background dark:to-muted/20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-10"></div>
            <div className="absolute top-20 left-0 w-[600px] h-[600px] bg-primary/10 dark:bg-accent/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-secondary/10 dark:bg-cyan-400/5 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent text-sm font-bold mb-6">
                        <HelpCircle className="h-4 w-4" />
                        <span>FAQ</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
                        Got Questions?
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to know about our platform and how it works.
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-card dark:bg-card/50 rounded-2xl shadow-sm border border-border/60 dark:border-border/40 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-bold text-lg text-foreground pr-8">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`h-5 w-5 text-primary flex-shrink-0 transition-transform duration-300 ${
                                        openIndex === index ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-8 pb-6 text-muted-foreground leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <p className="text-muted-foreground mb-4">
                        Still have questions? We're here to help.
                    </p>
                    <a
                        href="mailto:support@examprep.com"
                        className="text-primary font-bold hover:underline"
                    >
                        Contact Support →
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default FAQSection;
