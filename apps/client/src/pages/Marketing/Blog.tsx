import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Book } from 'lucide-react';

const Blog = () => {
    return (
        <div className="min-h-screen bg-[hsl(42.4,63%,94.7%)] font-sans text-[hsl(36,6%,34%)]">
            <nav className="border-b border-[hsl(32,13%,84%)] bg-white/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <Link to="/" className="flex items-center gap-2 text-[hsl(149.8,100%,30.4%)] font-bold">
                        <ArrowLeft className="h-5 w-5" />
                        Back to Home
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold mb-4 text-[hsl(149.8,100%,30.4%)]">ExamPrep Blog</h1>
                    <p className="text-lg text-[hsl(36,6%,50%)]">Study tips, exam strategies, and product updates.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[hsl(32,13%,84%)] hover:shadow-lg transition-shadow">
                            <div className="h-48 bg-[hsl(36,6%,34%)]/10 flex items-center justify-center">
                                <Book className="h-12 w-12 text-[hsl(36,6%,34%)]/20" />
                            </div>
                            <div className="p-6">
                                <div className="text-sm font-bold text-[hsl(149.8,100%,30.4%)] mb-2">Study Tips</div>
                                <h3 className="text-xl font-bold mb-3 text-[hsl(36,6%,34%)]">How to master difficult subjects in 3 simple steps</h3>
                                <p className="text-[hsl(36,6%,50%)] mb-4">
                                    Learn the proven strategies that top students use to retain complex information...
                                </p>
                                <span className="text-sm font-medium text-[hsl(36,6%,34%)] hover:text-[hsl(149.8,100%,30.4%)] cursor-pointer">Read more →</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
