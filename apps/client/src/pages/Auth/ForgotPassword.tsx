import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axiosInstance.post('/auth/forgotpassword', { email });
            setIsSent(true);
            toast({
                title: 'Check your inbox',
                description: `We've sent a password reset link to ${email}`,
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Request Failed',
                description: error.response?.data?.message || 'Failed to send reset email',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -right-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse" />
                <div className="absolute -left-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-cyan-500/20 blur-[120px] animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-md"
            >
                <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl dark:bg-black/20">
                    <CardHeader className="space-y-1 text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30 ring-4 ring-white/10"
                        >
                            <Mail className="h-10 w-10 text-white" />
                        </motion.div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                            {isSent ? 'Check Your Email' : 'Forgot Password?'}
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground/80">
                            {isSent
                                ? `We've sent a password reset link to ${email}`
                                : "Enter your email address and we'll send you a link to reset your password"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSent ? (
                            <div className="space-y-6">
                                <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20">
                                    <p className="text-sm text-green-400 text-center">
                                        Check your spam folder if you don't see the email within a few minutes.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Link to="/login" className="w-full">
                                        <Button className="w-full h-11 text-base font-semibold transition-all bg-primary hover:bg-primary/90">
                                            Return to Login
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        className="w-full hover:bg-white/5"
                                        onClick={() => setIsSent(false)}
                                    >
                                        Try a different email
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            className="pl-10 bg-white/5 border-white/10 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] bg-primary hover:bg-primary/90"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                Sending Link...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Send Reset Link
                                                <ArrowRight className="h-4 w-4" />
                                            </span>
                                        )}
                                    </Button>

                                    <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
