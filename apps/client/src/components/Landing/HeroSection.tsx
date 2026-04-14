import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Clock, Shield, Zap, BookOpen, LayoutDashboard, Target, PieChart, Users, Menu, Bell } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useAppSelector } from '@/redux/hooks';

const HeroSection = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const ref = useRef(null);
    const { scrollY } = useScroll();

    // Mouse interaction for 3D tilt
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
        const y = (clientY / innerHeight - 0.5) * 2; // -1 to 1
        mouseX.set(x);
        mouseY.set(y);
    };

    const rotateX = useSpring(useTransform(mouseY, [-1, 1], [5, -5]), { stiffness: 100, damping: 30 });
    const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-5, 5]), { stiffness: 100, damping: 30 });

    return (
        <section
            ref={ref}
            onMouseMove={handleMouseMove}
            className="relative overflow-hidden min-h-[95vh] flex items-center bg-background perspective-1000 pt-20"
        >
            {/* Optimized Background Mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-secondary/15 dark:bg-accent/5 rounded-full blur-[100px] mix-blend-multiply transition-opacity duration-1000"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 dark:bg-primary/5 rounded-full blur-[80px] mix-blend-multiply transition-opacity duration-1000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-10 brightness-100 contrast-125 mix-blend-overlay"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">

                {/* Left Content */}
                <div className="text-left space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/70 backdrop-blur-sm border border-border/60 shadow-sm text-primary text-sm font-bold tracking-wide"
                    >
                        <Zap className="h-4 w-4 fill-current" />
                        <span>The Future of Learning is Here</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        className="text-6xl sm:text-7xl lg:text-8xl font-black text-foreground leading-[0.9] tracking-tight"
                    >
                        FORGE YOUR <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">
                            DESTINY
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-xl text-muted-foreground max-w-xl font-medium leading-relaxed"
                    >
                        Stop studying harder. Start studying smarter. Visualize your progress, track your goals, and crush your exams with our AI-powered dashboard.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-wrap gap-4"
                    >
                        <Link
                            to={isAuthenticated ? "/dashboard" : "/register"}
                            className="relative overflow-hidden group px-8 py-4 rounded-2xl bg-foreground text-background font-bold text-lg shadow-2xl shadow-black/20 hover:scale-[1.02] transition-transform"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                                <ArrowRight className="h-5 w-5" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>

                        <div className="flex items-center gap-4 px-6 py-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white/60 bg-muted flex items-center justify-center text-xs font-bold ring-2 ring-black/5 z-${10 - i}`}>
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm font-semibold text-foreground">
                                <span className="text-primary font-bold">10k+</span> Students
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right 3D Visuals - Custom Dashboard Preview */}
                <div className="relative h-[650px] w-full flex items-center justify-center perspective-1000">
                    <motion.div
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                        className="relative w-full max-w-[600px] aspect-[16/10]" // Aspect ratio matching a dashboard
                    >
                        {/* Main Dashboard Container */}
                        <motion.div
                            className="absolute inset-0 bg-card rounded-xl border border-border/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] overflow-hidden z-20 flex"
                            style={{ transform: "translateZ(50px)" }}
                        >
                            {/* Sidebar */}
                            <div className="w-16 sm:w-64 bg-sidebar text-sidebar-foreground p-4 hidden sm:flex flex-col gap-6">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="bg-white p-1.5 rounded-lg text-sidebar">
                                        <BookOpen className="h-5 w-5 fill-current" />
                                    </div>
                                    <span className="font-bold text-lg tracking-tight">ExamPrep</span>
                                </div>
                                <div className="space-y-1">
                                    {[
                                        { icon: LayoutDashboard, label: "Dashboard", active: true },
                                        { icon: BookOpen, label: "Subjects" },
                                        { icon: Target, label: "Daily Goals" },
                                        { icon: Clock, label: "Study Sessions" },
                                        { icon: PieChart, label: "Analytics" },
                                        { icon: Users, label: "Study Groups" },
                                    ].map((item, i) => (
                                        <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 flex flex-col h-full bg-muted/40">
                                {/* Top Header */}
                                <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
                                    <h2 className="font-bold text-foreground">Dashboard</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="px-3 py-1 bg-secondary rounded-full text-xs font-bold text-secondary-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> 439 days left
                                        </div>
                                        <div className="h-8 w-8 bg-muted rounded-full overflow-hidden border border-border">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=" alt="Profile" />
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard Content */}
                                <div className="p-6 space-y-6 overflow-hidden">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">Welcome back, !</h3>
                                            <p className="text-sm text-muted-foreground">Your personal study dashboard</p>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: "Total Subjects", value: "2", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
                                            { label: "Daily Goals", value: "0/3", icon: Target, color: "text-primary", bg: "bg-primary/10" },
                                            { label: "Syllabus", value: "8%", icon: PieChart, color: "text-secondary", bg: "bg-secondary/20" },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-card p-4 rounded-xl border border-border/60 shadow-sm flex flex-col justify-between h-28">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                                                    <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                                                        <stat.icon className="h-4 w-4" />
                                                    </div>
                                                </div>
                                                <div className="text-2xl font-black text-foreground">{stat.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Charts Row Placeholder */}
                                    <div className="bg-card p-4 rounded-xl border border-border/60 shadow-sm h-32 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-end justify-around px-4 pb-0 opacity-20">
                                            {[40, 70, 50, 90, 60, 80, 45].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                                    className="w-8 bg-primary rounded-t-md"
                                                ></motion.div>
                                            ))}
                                        </div>
                                        <div className="relative z-10 text-center">
                                            <div className="text-sm font-bold text-foreground">Study Activity</div>
                                            <div className="text-xs text-muted-foreground">Last 7 days</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Element: Streak */}
                        <motion.div
                            style={{ x: useTransform(mouseX, [-1, 1], [30, -30]), y: useTransform(mouseY, [-1, 1], [30, -30]), transform: "translateZ(100px)" }}
                            className="absolute -bottom-16 -right-16 bg-card p-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[100] border border-border/60 pointer-events-none"
                        >
                            <div className="p-3 bg-secondary rounded-xl text-secondary-foreground">
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-muted-foreground uppercase">Streak</div>
                                <div className="text-xl font-black text-foreground">12 Days 🔥</div>
                            </div>
                        </motion.div>

                        {/* Floating Element: Notification */}
                        <motion.div
                            style={{ x: useTransform(mouseX, [-1, 1], [-20, 20]), y: useTransform(mouseY, [-1, 1], [-20, 20]), transform: "translateZ(40px)" }}
                            className="absolute -top-12 -right-12 bg-card p-3 rounded-2xl shadow-xl border border-border/60 z-50 flex items-center gap-3 animate-bounce-subtle pointer-events-none"
                        >
                            <div className="bg-red-100 dark:bg-red-500/20 p-2 rounded-full text-red-500 dark:text-red-300">
                                <Bell className="h-4 w-4" />
                            </div>
                            <div className="pr-2">
                                <div className="text-xs font-bold text-foreground">Exam Tomorrow!</div>
                                <div className="text-[10px] text-muted-foreground">Physics 101</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <style>{`
                .animate-pulse-slow {
                    animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s infinite ease-in-out;
                }
            `}</style>
        </section>
    );
};

export default HeroSection;
