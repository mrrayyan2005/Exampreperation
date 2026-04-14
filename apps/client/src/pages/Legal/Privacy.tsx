import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
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
                <h1 className="text-3xl font-extrabold mb-8 text-[hsl(149.8,100%,30.4%)]">Privacy Policy</h1>
                <div className="prose prose-stone max-w-none text-[hsl(36,6%,50%)]">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service.</p>

                    <h3>1. Collecting and Using Your Personal Data</h3>
                    <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You.</p>

                    <h3>2. Usage Data</h3>
                    <p>Usage Data is collected automatically when using the Service. It may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, and other diagnostic data.</p>

                    <h3>3. Cookies</h3>
                    <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information.</p>

                    <h3>4. Security of Your Personal Data</h3>
                    <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.</p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
