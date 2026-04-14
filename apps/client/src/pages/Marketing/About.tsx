import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-[hsl(42.4,63%,94.7%)] font-sans text-[hsl(36,6%,34%)]">
            <nav className="border-b border-[hsl(32,13%,84%)] bg-white/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-[hsl(149.8,100%,30.4%)] font-bold">
                        <ArrowLeft className="h-5 w-5" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-[hsl(149.8,100%,30.4%)]" />
                        <span className="text-xl font-bold text-[hsl(149.8,100%,30.4%)]">ExamPrep</span>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <h1 className="text-4xl font-extrabold mb-8 text-[hsl(149.8,100%,30.4%)]">About Us</h1>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                    <p className="text-lg leading-relaxed text-[hsl(36,6%,50%)]">
                        At ExamPrep, we believe that education is the foundation of a brighter future.
                        Our mission is to empower students worldwide with the tools, community, and
                        strategies they need to succeed in their academic journeys. We strive to make
                        high-quality exam preparation accessible, personalized, and effective for everyone.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                    <p className="text-lg leading-relaxed text-[hsl(36,6%,50%)] mb-4">
                        Founded in 2024 by a group of educators and technologists, ExamPrep was born out of
                        frustration with outdated study methods and disjointed tools. We saw students
                        struggling to organize their schedules, find quality practice materials, and
                        stay motivated.
                    </p>
                    <p className="text-lg leading-relaxed text-[hsl(36,6%,50%)]">
                        We built ExamPrep to be the all-in-one solution we wished we had. Combining
                        cognitive science principles like spaced repetition with modern AI technology,
                        we've created a platform that adapts to you, not the other way around.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">Join the Movement</h2>
                    <div className="bg-white rounded-2xl p-8 border border-[hsl(32,13%,84%)] flex items-center gap-6 shadow-sm">
                        <div className="p-4 bg-[hsl(48,100%,50%)]/20 rounded-full text-[hsl(149.8,100%,30.4%)]">
                            <Users className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Become part of our community</h3>
                            <p className="text-[hsl(36,6%,50%)] mb-4">
                                Join thousands of students who are actively shaping their future with ExamPrep.
                            </p>
                            <Link to="/register" className="inline-block bg-[hsl(149.8,100%,30.4%)] text-white px-6 py-2 rounded-lg font-bold hover:bg-[hsl(149.8,100%,30.4%)]/90 transition-colors">
                                Get Started Today
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
