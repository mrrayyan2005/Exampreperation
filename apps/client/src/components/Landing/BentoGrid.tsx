import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  TrendingUp,
  Bell,
  BookOpen,
  Sparkles,
  Layers,
  BarChart3,
  Timer,
  Target,
  Smartphone,
} from "lucide-react";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const BentoGridSection = memo(() => {
  return (
    <section className="relative py-32 bg-background overflow-hidden">

      {/* Ambient background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[700px] h-[700px] bg-blue-500/10 blur-[120px] rounded-full top-0 left-1/2 -translate-x-1/2"></div>
        <div className="absolute w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full bottom-0 right-0"></div>
      </div>

      <div className="container mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-20">

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black tracking-tight text-foreground mb-6"
          >
            Built for <span className="text-primary">High Achievers</span>
          </motion.h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to organize your academic life in one powerful dashboard.
          </p>

        </div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
        >

          {/* Card 1 */}
          <motion.div
            variants={item}
            whileHover={{ y: -10, scale: 1.02 }}
            className="md:col-span-2 row-span-2 group relative rounded-3xl p-10
            bg-gradient-to-br from-white to-gray-50
            dark:from-gray-900 dark:to-gray-800
            border border-white/40 dark:border-white/10
            shadow-xl hover:shadow-2xl
            transition-all duration-500 overflow-hidden"
          >

            <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            <div className="relative z-10">

              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 mb-6">
                <Calendar size={28}/>
              </div>

              <h3 className="text-3xl font-bold mb-3">
                Smart Study Schedule
              </h3>

              <p className="text-muted-foreground max-w-sm">
                AI powered scheduling that adapts to your exam timeline and study pace.
              </p>

            </div>

            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/20 blur-[120px] rounded-full"></div>

          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={item}
            whileHover={{ y: -10, scale: 1.02 }}
            className="row-span-2 group relative rounded-3xl p-10
            bg-gradient-to-br from-purple-600 to-indigo-600
            text-white shadow-xl overflow-hidden"
          >

            <Users className="mb-6" size={32}/>

            <h3 className="text-2xl font-bold mb-3">
              Study Groups
            </h3>

            <p className="text-white/80">
              Collaborate with friends and stay accountable.
            </p>

            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 blur-[100px] rounded-full"></div>

          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={item}
            whileHover={{ y: -10 }}
            className="rounded-3xl p-8 bg-white dark:bg-gray-900 border border-border shadow-lg"
          >

            <TrendingUp className="text-green-500 mb-4"/>

            <h3 className="font-bold text-lg mb-1">
              Subject Mastery
            </h3>

            <p className="text-muted-foreground text-sm">
              Track improvement across topics.
            </p>

          </motion.div>

          {/* Card 4 */}
          <motion.div
            variants={item}
            whileHover={{ y: -10 }}
            className="rounded-3xl p-8 bg-white dark:bg-gray-900 border border-border shadow-lg"
          >

            <Bell className="text-yellow-500 mb-4"/>

            <h3 className="font-bold text-lg mb-1">
              Smart Alerts
            </h3>

            <p className="text-muted-foreground text-sm">
              Get reminders before every exam.
            </p>

          </motion.div>

          {/* Card 5 */}
          <motion.div
            variants={item}
            whileHover={{ y: -10 }}
            className="md:col-span-2 rounded-3xl p-10 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 border border-border shadow-lg"
          >

            <BookOpen className="mb-6 text-indigo-500"/>

            <h3 className="text-2xl font-bold mb-2">
              Resource Library
            </h3>

            <p className="text-muted-foreground">
              Organize notes, PDFs, and lectures in one searchable hub.
            </p>

          </motion.div>

          {/* Card 6 */}
          <motion.div
            variants={item}
            whileHover={{ y: -10 }}
            className="rounded-3xl p-8 bg-gradient-to-br from-pink-100 to-white dark:from-gray-900 dark:to-gray-800 border border-border shadow-lg"
          >

            <Sparkles className="text-purple-500 mb-4"/>

            <h3 className="font-bold text-lg">
              AI Quiz Generator
            </h3>

          </motion.div>

          {/* Card 7 */}
          <motion.div
            variants={item}
            whileHover={{ y: -10 }}
            className="rounded-3xl p-8 bg-gradient-to-br from-orange-100 to-white dark:from-gray-900 dark:to-gray-800 border border-border shadow-lg"
          >

            <Layers className="text-orange-500 mb-4"/>

            <h3 className="font-bold text-lg">
              Flashcard System
            </h3>

          </motion.div>

          {/* Card 8 */}
          <motion.div
            variants={item}
            whileHover={{ y: -10 }}
            className="md:col-span-2 rounded-3xl p-10 bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-xl"
          >

            <BarChart3 className="mb-6"/>

            <h3 className="text-2xl font-bold mb-2">
              Progress Dashboard
            </h3>

            <p className="text-white/70">
              Understand your performance instantly.
            </p>

          </motion.div>

          {/* Card 9 */}
          <motion.div
            variants={item}
            whileHover={{ y: -10 }}
            className="rounded-3xl p-8 bg-white dark:bg-gray-900 border border-border shadow-lg"
          >

            <Timer className="text-red-500 mb-4"/>

            <h3 className="font-bold text-lg">
              Pomodoro Timer
            </h3>

          </motion.div>

          {/* Card 10 */}
          <motion.div
            variants={item}
            whileHover={{ y: -10 }}
            className="rounded-3xl p-8 bg-white dark:bg-gray-900 border border-border shadow-lg"
          >

            <Target className="text-orange-500 mb-4"/>

            <h3 className="font-bold text-lg">
              Goal Tracking
            </h3>

          </motion.div>

          {/* Card 11 */}
          <motion.div
            variants={item}
            whileHover={{ y: -10 }}
            className="rounded-3xl p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl"
          >

            <Smartphone className="mb-4"/>

            <h3 className="font-bold text-lg">
              Mobile App
            </h3>

          </motion.div>

        </motion.div>
      </div>
    </section>
  );
});

export default BentoGridSection;