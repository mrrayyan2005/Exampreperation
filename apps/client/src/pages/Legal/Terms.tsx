import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
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

            <div className="container mx-auto px-6 py-16 max-w-3xl">
                <h1 className="text-3xl font-extrabold mb-8 text-[hsl(149.8,100%,30.4%)]">Terms of Service</h1>
                <div className="prose prose-stone max-w-none text-[hsl(36,6%,50%)]">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>Please read these terms and conditions carefully before using Our Service.</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing or using ExamPrep, you agree to be bound by these Terms of Service.</p>

                    <h3>2. User Accounts</h3>
                    <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>

                    <h3>3. Content</h3>
                    <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the Content that you post to the Service.</p>

                    <h3>4. Termination</h3>
                    <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                    <h3>5. Limitation of Liability</h3>
                    <p>In no event shall ExamPrep, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.</p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
