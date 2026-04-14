import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Send, Sparkles, MessageCircle, BookOpen, BrainCircuit, Calendar, Clock } from 'lucide-react';

const AIFeatureSection = () => {
    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="relative rounded-[3rem] bg-gradient-to-br from-primary via-purple-400 to-secondary dark:from-muted dark:via-muted dark:to-muted p-8 md:p-16 lg:p-24 overflow-hidden shadow-2xl dark:shadow-black/50">

                    {/* Background Decorative Blobs */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 dark:bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/10 dark:bg-cyan-400/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                        {/* Text Content */}
                        <div className="text-left space-y-8">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-4xl md:text-5xl lg:text-7xl font-black text-white dark:text-foreground leading-[1.1] tracking-tight"
                            >
                                Stop juggling <span className="text-secondary dark:text-accent drop-shadow-md">deadlines</span>. Start crushing them.
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-lg md:text-xl text-white/90 dark:text-foreground/90 font-medium max-w-lg"
                            >
                                Get automated reminders, smart progress updates, and a personalized schedule that adapts to your life. Focus on learning, not planning.
                            </motion.p>

                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="group relative overflow-hidden bg-white text-primary px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                            >
                                <span className="relative z-10">Create My Plan</span>
                                <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </motion.button>
                        </div>

                        {/* Phone Mockup */}
                        <div className="relative flex justify-center lg:justify-end">
                            {/* Floating Decorative Elements */}
                            <motion.div
                                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-12 -left-4 md:left-12 bg-white p-4 rounded-3xl shadow-xl z-20 flex items-center justify-center transform -rotate-12"
                            >
                                <Calendar className="h-10 w-10 text-orange-400" />
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-12 -right-4 md:right-8 bg-white p-4 rounded-full shadow-xl z-20 flex items-center justify-center transform rotate-6"
                            >
                                <Clock className="h-10 w-10 text-purple-500" />
                            </motion.div>


                            <motion.div
                                initial={{ opacity: 0, y: 40, rotateX: 10 }}
                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="relative w-[320px] h-[640px] bg-card rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-[8px] border-border/60 overflow-hidden ring-1 ring-black/5"
                            >
                                {/* Phone Header */}
                                <div className="h-24 bg-gradient-to-b from-muted/60 to-card border-b border-border/60 flex flex-col justify-end pb-3 px-6 relative z-10">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl"></div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white shadow-sm">
                                            <BrainCircuit className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground">ExamPrep Assistant</div>
                                            <div className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Interface */}
                                <div className="p-4 space-y-4 h-[calc(100%-6rem)] overflow-hidden bg-muted/40 flex flex-col">
                                    <div className="flex-1 space-y-4">

                                        {/* Bot Message */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="bg-card p-3 rounded-2xl rounded-tl-none shadow-sm border border-border/60 max-w-[85%]"
                                        >
                                            <p className="text-xs text-muted-foreground font-medium">Good morning ! ☀️ You have 3 goals for today.</p>
                                        </motion.div>

                                        {/* User Message */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 }}
                                            className="bg-primary p-3 rounded-2xl rounded-tr-none shadow-sm text-white max-w-[85%] ml-auto"
                                        >
                                            <p className="text-xs">What's the priority? I have limited time.</p>
                                        </motion.div>

                                        {/* Bot Message with Action */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.2 }}
                                            className="bg-card p-3 rounded-2xl rounded-tl-none shadow-sm border border-border/60 max-w-[90%]"
                                        >
                                            <p className="text-xs text-muted-foreground font-medium mb-2">
                                                Based on your exam date (June 15), the priority is <strong>Physics: Optics</strong>.
                                            </p>
                                            <div className="bg-red-50 dark:bg-red-500/10 p-2 rounded-lg border border-red-100 dark:border-red-500/20 mb-2 flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-red-500" />
                                                <div className="text-[10px] font-bold text-red-600 dark:text-red-300">Mock Test Tomorrow!</div>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium mb-1">Shall I schedule 2 hours for revision?</p>

                                            <div className="flex gap-2 mt-2">
                                                <button className="px-3 py-1.5 bg-primary/10 text-primary text-[10px] rounded-full font-bold">Yes, please!</button>
                                                <button className="px-3 py-1.5 bg-muted text-muted-foreground text-[10px] rounded-full font-bold">Remind me later</button>
                                            </div>
                                        </motion.div>

                                        {/* Typing Indicator */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            transition={{ delay: 2.5 }}
                                            className="bg-card px-3 py-2 rounded-2xl rounded-tl-none shadow-sm border border-border/60 w-16"
                                        >
                                            <div className="flex gap-1">
                                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full"></motion.div>
                                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full"></motion.div>
                                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full"></motion.div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Input Area */}
                                    <div className="relative mt-auto">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            className="w-full bg-card border-none rounded-full py-3 px-4 pl-4 pr-12 text-xs shadow-md focus:ring-0 text-foreground"
                                            readOnly
                                        />
                                        <div className="absolute right-1 top-1 p-2 bg-primary rounded-full text-white">
                                            <Send className="h-3 w-3" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIFeatureSection;
