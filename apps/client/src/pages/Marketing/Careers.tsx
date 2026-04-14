import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Rocket } from 'lucide-react';

const Careers = () => {
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

            <div className="container mx-auto px-6 py-20 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="p-6 bg-[hsl(48,100%,50%)]/20 rounded-full text-[hsl(149.8,100%,30.4%)]">
                        <Rocket className="h-12 w-12" />
                    </div>
                </div>
                <h1 className="text-4xl font-extrabold mb-4 text-[hsl(36,6%,34%)]">Join Our Mission</h1>
                <p className="text-xl text-[hsl(36,6%,50%)] max-w-2xl mx-auto mb-12">
                    We're looking for passionate individuals to help us revolutionize education.
                </p>

                <div className="bg-white rounded-2xl p-12 max-w-3xl mx-auto border border-[hsl(32,13%,84%)] border-dashed">
                    <h2 className="text-2xl font-bold mb-4">No Open Positions Currently</h2>
                    <p className="text-[hsl(36,6%,50%)]">
                        We don't have any specific openings right now, but we're always looking for talent.
                        Send your resume to <a href="mailto:careers@examprep.com" className="text-[hsl(149.8,100%,30.4%)] font-bold hover:underline">careers@examprep.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Careers;
