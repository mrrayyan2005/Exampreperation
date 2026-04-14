import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Award, Target, CheckCircle2 } from 'lucide-react';

interface Activity {
    id: number;
    user: string;
    action: string;
    time: string;
    icon: 'study' | 'achievement' | 'goal' | 'complete';
    avatar: number;
}

const activityTemplates = [
    { action: 'completed a 2-hour study session', icon: 'complete' as const },
    { action: 'achieved a 95% score on Mock Test', icon: 'achievement' as const },
    { action: 'set a new weekly goal', icon: 'goal' as const },
    { action: 'mastered Organic Chemistry', icon: 'achievement' as const },
    { action: 'started studying Calculus', icon: 'study' as const },
    { action: 'completed 50 practice questions', icon: 'complete' as const },
    { action: 'reached a 7-day streak', icon: 'achievement' as const },
    { action: 'scheduled 15 study sessions', icon: 'goal' as const }
];

const names = ['Sarah', 'Michael', 'Emma', 'James', 'Olivia', 'William', 'Sophia', 'David', 'Ava', 'Daniel'];

const getIcon = (type: string) => {
    switch (type) {
        case 'achievement':
            return <Award className="h-4 w-4" />;
        case 'goal':
            return <Target className="h-4 w-4" />;
        case 'complete':
            return <CheckCircle2 className="h-4 w-4" />;
        default:
            return <TrendingUp className="h-4 w-4" />;
    }
};

const LiveActivityFeed = () => {
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        // Generate initial activities
        const initial = Array.from({ length: 3 }, (_, i) => {
            const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
            return {
                id: i,
                user: names[Math.floor(Math.random() * names.length)],
                action: template.action,
                time: 'Just now',
                icon: template.icon,
                avatar: Math.floor(Math.random() * 50)
            };
        });
        setActivities(initial);

        // Add new activity every 8 seconds (reduced frequency for performance)
        const interval = setInterval(() => {
            const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
            const newActivity: Activity = {
                id: Date.now(),
                user: names[Math.floor(Math.random() * names.length)],
                action: template.action,
                time: 'Just now',
                icon: template.icon,
                avatar: Math.floor(Math.random() * 50)
            };

            setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-16 bg-background dark:bg-muted/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-10"></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-sm font-bold mb-4">
                        <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                        <span>Live Activity</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
                        Students Studying Right Now
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Join the community of active learners achieving their goals
                    </p>
                </motion.div>

                <div className="max-w-3xl mx-auto bg-card dark:bg-card/50 rounded-3xl shadow-xl border border-border/60 dark:border-border/40 p-8">
                    <AnimatePresence mode="popLayout">
                        {activities.map((activity) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-4 p-4 bg-muted/40 dark:bg-muted/20 rounded-2xl shadow-sm border border-border/60 dark:border-border/40 mb-3 hover:shadow-md transition-shadow"
                            >
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.avatar}`}
                                        alt={activity.user}
                                        className="w-full h-full"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-foreground font-medium">
                                        <span className="font-bold">{activity.user}</span>
                                        {' '}
                                        <span className="text-muted-foreground">{activity.action}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                                </div>

                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    activity.icon === 'achievement' ? 'bg-yellow-100 text-yellow-600' :
                                    activity.icon === 'goal' ? 'bg-blue-100 text-blue-600' :
                                    activity.icon === 'complete' ? 'bg-green-100 text-green-600' :
                                    'bg-purple-100 text-purple-600'
                                }`}>
                                    {getIcon(activity.icon)}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Stats Bar */}
                    <div className="mt-8 pt-8 border-t border-border/60 dark:border-border/40">
                        <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-3xl font-black text-primary dark:text-accent mb-1">50K+</div>
                                <div className="text-sm text-muted-foreground font-medium">Active Students</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-secondary dark:text-cyan-400 mb-1">2.5M+</div>
                                <div className="text-sm text-muted-foreground font-medium">Study Sessions</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-green-600 mb-1">95%</div>
                                <div className="text-sm text-muted-foreground font-medium">Success Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LiveActivityFeed;
