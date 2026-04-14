import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Award, Target } from 'lucide-react';

interface CounterProps {
    end: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
}

const AnimatedCounter: React.FC<CounterProps> = ({ 
    end, 
    duration = 2000, 
    suffix = '', 
    prefix = '' 
}) => {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (!hasStarted) return;

        let startTime: number | null = null;
        const startValue = 0;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutQuart * (end - startValue) + startValue);

            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration, hasStarted]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onViewportEnter={() => setHasStarted(true)}
            className="text-center"
        >
            <div className="text-5xl md:text-6xl font-black text-primary mb-2">
                {prefix}{count.toLocaleString()}{suffix}
            </div>
        </motion.div>
    );
};

const EnhancedStatsSection = () => {
    const stats = [
        {
            icon: Users,
            value: 50000,
            suffix: '+',
            label: 'Active Students',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: TrendingUp,
            value: 92,
            suffix: '%',
            label: 'Students See Improvement',
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: Award,
            value: 4.8,
            prefix: '',
            suffix: '/5',
            label: 'Average Rating',
            color: 'from-yellow-500 to-orange-500'
        },
        {
            icon: Target,
            value: 2500000,
            suffix: '+',
            label: 'Study Sessions Completed',
            color: 'from-purple-500 to-pink-500',
            format: (val: number) => {
                if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
                return val.toString();
            }
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-[#0e1116] dark:to-[#12161c] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 dark:opacity-15"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 dark:bg-secondary/10 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                        Trusted by Students Worldwide
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Join thousands who are already succeeding
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        const displayValue = stat.format ? stat.format(stat.value) : stat.value;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative group"
                            >
                                <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/60 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon className="h-8 w-8 text-white" />
                                    </div>

                                    {/* Counter */}
                                    {stat.format ? (
                                        <div className="text-5xl md:text-6xl font-black text-primary mb-2">
                                            {displayValue}
                                        </div>
                                    ) : (
                                        <AnimatedCounter
                                            end={stat.value}
                                            suffix={stat.suffix}
                                            prefix={stat.prefix}
                                        />
                                    )}

                                    {/* Label */}
                                    <p className="text-muted-foreground font-medium">
                                        {stat.label}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default EnhancedStatsSection;
