import React from 'react';
import { Users, Calendar, Trophy, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
    { label: "Active Students", value: "10k+", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Study Plans Created", value: "50k+", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Success Rate", value: "95%", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Questions Solved", value: "1M+", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
];

const StatsSection = () => {
    return (
        <section className="py-12 bg-background border-y border-border/40 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-50%] left-[20%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -5 }}
                            className="bg-card/70 backdrop-blur-md border border-border/60 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-default group"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className="text-3xl font-black text-foreground">{stat.value}</div>
                            </div>
                            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
