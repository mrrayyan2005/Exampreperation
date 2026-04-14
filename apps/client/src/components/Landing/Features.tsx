import React from 'react';
import { Target, Calendar, TrendingUp, Layers, ClipboardCheck, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        icon: Target,
        title: 'Smart Goal Setting',
        desc: 'Set realistic daily and weekly study goals. Our algorithm helps you break down big syllabuses into manageable chunks.'
    },
    {
        icon: Calendar,
        title: 'Dynamic Scheduling',
        desc: 'Create a personalized study schedule that adapts to your pace. Missed a day? We automatically adjust specifically for you.'
    },
    {
        icon: TrendingUp,
        title: 'Progress Analytics',
        desc: 'Visualize your improvements with detailed charts. Track hours studied, topics covered, and identify weak areas.'
    },
    {
        icon: Layers,
        title: "Spaced Repetition",
        desc: "Optimize your memory retention with our scientifically proven algorithm that schedules reviews at the perfect time."
    },
    {
        icon: ClipboardCheck,
        title: "Mock Tests",
        desc: "Simulate exam pressure with timed tests and get instant performance feedback to identify gap areas."
    },
    {
        icon: BrainCircuit,
        title: "AI Question Generator",
        desc: "Never run out of practice material. Generate custom questions for any topic instantly with AI."
    },
];

const FeaturesSection = () => {
    return (
        <section id="features" className="py-24 relative overflow-hidden bg-background">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 dark:opacity-10"></div>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-secondary/20 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-widest uppercase mb-4"
                    >
                        Core Features
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-foreground mb-6"
                    >
                        Everything You Need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Succeed</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-muted-foreground"
                    >
                        Building consistent study habits requires the right tools. We've combined the best study techniques into one powerful platform.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group h-full bg-card rounded-3xl p-8 border border-border/60 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500 ease-out"></div>

                            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-md">
                                <feature.icon className="h-7 w-7" />
                            </div>

                            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
