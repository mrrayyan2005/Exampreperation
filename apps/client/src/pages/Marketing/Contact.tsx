import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { toast } from 'sonner';

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Assuming API request
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            await axios.post(`${baseUrl}/contact`, formData);
            setSuccess(true);
            toast.success('Message sent successfully!');
            setFormData({ firstName: '', lastName: '', email: '', message: '' });
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[hsl(42.4,63%,94.7%)] font-sans text-[hsl(36,6%,34%)]">
            <nav className="border-b border-[hsl(32,13%,84%)] bg-white/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-[hsl(149.8,100%,30.4%)] font-bold">
                        <ArrowLeft className="h-5 w-5" />
                        Back to Home
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-16 max-w-5xl">
                <h1 className="text-4xl font-extrabold mb-12 text-center text-[hsl(149.8,100%,30.4%)]">Get in Touch</h1>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">We'd love to hear from you</h2>
                            <p className="text-[hsl(36,6%,50%)] text-lg">
                                Have a question about our features, pricing, or need support?
                                Our team is ready to answer all your questions.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[hsl(149.8,100%,30.4%)]/10 text-[hsl(149.8,100%,30.4%)] rounded-xl flex items-center justify-center">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-bold">Email</div>
                                    <div className="text-[hsl(36,6%,50%)]">support@examprep.com</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[hsl(149.8,100%,30.4%)]/10 text-[hsl(149.8,100%,30.4%)] rounded-xl flex items-center justify-center">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-bold">Phone</div>
                                    <div className="text-[hsl(36,6%,50%)]">+1 (555) 123-4567</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[hsl(149.8,100%,30.4%)]/10 text-[hsl(149.8,100%,30.4%)] rounded-xl flex items-center justify-center">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-bold">Office</div>
                                    <div className="text-[hsl(36,6%,50%)]">123 Education Lane, Tech City, CA</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-[hsl(32,13%,84%)]">
                        {success ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-[hsl(36,6%,34%)] mb-2">Message Sent!</h3>
                                <p className="text-[hsl(36,6%,50%)] mb-6">We'll get back to you as soon as possible.</p>
                                <Button onClick={() => setSuccess(false)} variant="outline">Send another message</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="firstName" className="text-sm font-medium">First name</label>
                                        <Input id="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="lastName" className="text-sm font-medium">Last name</label>
                                        <Input id="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                                    <Textarea id="message" value={formData.message} onChange={handleChange} placeholder="How can we help you?" className="min-h-[120px]" required />
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-[hsl(149.8,100%,30.4%)] hover:bg-[hsl(149.8,100%,30.4%)]/90 text-white font-bold h-12">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Message'}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
