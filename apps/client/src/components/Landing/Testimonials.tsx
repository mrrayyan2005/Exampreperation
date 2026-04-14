import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
    {
        text: "ExamPrep completely changed how I study. The AI generated tests are spot on!",
        author: "Sarah J.",
        role: "Medical Student",
        bg: "bg-secondary/10"
    },
    {
        text: "I used to procrastinate a lot, but the daily goals feature keeps me accountable using this.",
        author: "Michael T.",
        role: "Engineering Student",
        bg: "bg-primary/5"
    },
    {
        text: "The study rooms are a game changer. Studying with others motivates me to push harder.",
        author: "Emily R.",
        role: "Law Student",
        bg: "bg-secondary/20"
    },
    {
        text: "Finally a tool that understands spaced repetition without making it complicated.",
        author: "David K.",
        role: "Psychology Major",
        bg: "bg-blue-50"
    },
];

const TestimonialsSection = () => {
    return (
        <section id="testimonials" className="py-24 bg-muted/30 dark:bg-muted/50 relative overflow-hidden">
            {/* Background Patterns */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-black text-foreground sm:text-5xl"
                    >
                        Loved by Students
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-muted-foreground text-lg"
                    >
                        Join thousands of students achieving their academic dreams.
                    </motion.p>
                </div>

                {/* Marquee Effect */}
                <div className="relative w-full overflow-hidden mask-linear-gradient">
                    <div className="flex gap-8 animate-marquee whitespace-nowrap py-4">
                        {[...testimonials, ...testimonials].map((testimonial, index) => (
                            <div
                                key={index}
                                className={`inline-block w-[350px] md:w-[400px] p-8 rounded-2xl bg-card/50 dark:bg-card/30 backdrop-blur-md border border-border/50 dark:border-border/40 hover:border-border dark:hover:border-border/60 transition-colors whitespace-normal flex-shrink-0`}
                            >
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <svg key={s} className="w-4 h-4 text-secondary dark:text-accent fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-foreground/90 dark:text-foreground/80 mb-6 font-medium leading-relaxed italic">"{testimonial.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary dark:from-accent dark:to-cyan-400 flex items-center justify-center text-primary-foreground dark:text-muted font-bold text-sm">
                                        {testimonial.author[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground dark:text-foreground">{testimonial.author}</div>
                                        <div className="text-sm text-muted-foreground dark:text-muted-foreground">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
};

export default TestimonialsSection;
