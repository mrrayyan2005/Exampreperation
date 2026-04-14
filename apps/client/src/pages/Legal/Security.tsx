import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Server } from 'lucide-react';

const Security = () => {
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

            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold mb-4 text-[hsl(149.8,100%,30.4%)]">Security at ExamPrep</h1>
                    <p className="text-lg text-[hsl(36,6%,50%)]">Your data security is our top priority.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-2xl border border-[hsl(32,13%,84%)]">
                        <ShieldCheck className="h-10 w-10 text-[hsl(149.8,100%,30.4%)] mb-4" />
                        <h3 className="text-xl font-bold mb-2">SOC 2 Compliant</h3>
                        <p className="text-[hsl(36,6%,50%)]">We maintain strict security controls and are regularly audited.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-[hsl(32,13%,84%)]">
                        <Lock className="h-10 w-10 text-[hsl(149.8,100%,30.4%)] mb-4" />
                        <h3 className="text-xl font-bold mb-2">End-to-End Encryption</h3>
                        <p className="text-[hsl(36,6%,50%)]">All sensitive data is encrypted in transit and at rest using industry-standard AES-256.</p>
                    </div>
                </div>

                <div className="prose prose-stone max-w-none text-[hsl(36,6%,50%)]">
                    <h3>Infrastructure</h3>
                    <p>Our infrastructure is hosted on secure cloud providers with 24/7 monitoring and automated threat detection.</p>

                    <h3>Access Control</h3>
                    <p>We employ strict role-based access control (RBAC) and Multi-Factor Authentication (MFA) for all internal systems.</p>
                </div>
            </div>
        </div>
    );
};

export default Security;
