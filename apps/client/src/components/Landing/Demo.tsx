import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, Maximize2, CheckCircle2 } from 'lucide-react';

const features = [
    'Create personalized study plans',
    'Track progress with analytics',
    'Generate AI-powered questions',
    'Collaborate with study groups'
];

const DemoSection = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <section className="py-24 bg-gradient-to-b from-background to-background dark:from-background dark:to-muted/20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl opacity-50"></div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                        <Play className="h-4 w-4" />
                        <span>See It In Action</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
                        2-Minute Platform Tour
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Watch how students are transforming their study habits and achieving better results.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                    {/* Video Player */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative group"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-gray-900 to-gray-800 aspect-video">
                            {/* Placeholder Dashboard Screenshot */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop"
                                        alt="Dashboard Preview"
                                        className="w-full h-full object-cover opacity-40"
                                    />
                                </div>
                            </div>

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group-hover:bg-primary group-hover:text-white"
                                >
                                    {isPlaying ? (
                                        <Pause className="h-10 w-10 ml-1" />
                                    ) : (
                                        <Play className="h-10 w-10 ml-1" />
                                    )}
                                </button>
                            </div>

                            {/* Video Controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-4">
                                    <button className="text-white hover:text-primary transition-colors">
                                        <Volume2 className="h-5 w-5" />
                                    </button>
                                    <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                        <div className="h-full w-1/3 bg-primary rounded-full"></div>
                                    </div>
                                    <button className="text-white hover:text-primary transition-colors">
                                        <Maximize2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Duration Badge */}
                            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-bold">
                                2:15
                            </div>
                        </div>

                        {/* Floating Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
                        >
                            <div className="text-3xl font-black text-primary mb-1">10K+</div>
                            <div className="text-sm text-muted-foreground font-medium">Video Views</div>
                        </motion.div>
                    </motion.div>

                    {/* Features List */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h3 className="text-3xl font-bold text-foreground mb-8">
                            Everything you need to succeed:
                        </h3>

                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-4 group"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500 transition-colors">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {feature}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        <div className="pt-8">
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all"
                            >
                                Watch Full Tutorial
                                <Play className="h-5 w-5" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default DemoSection;
