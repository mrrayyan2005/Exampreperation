import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { useAppDispatch } from '@/redux/hooks';
import { login } from '@/redux/slices/authSlice';

const ResetPassword = () => {
    const { token } = useParams<{ token: string }>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Passwords do not match',
            });
            return;
        }

        if (password.length < 6) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Password must be at least 6 characters',
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await axiosInstance.put(`/auth/resetpassword/${token}`, { password });
            setIsSuccess(true);
            toast({
                title: 'Password Reset Successful',
                description: 'You can now log in with your new password.',
            });

            // If response includes token, auto-login user
            if (response.data.data?.token) {
                // We can manually dispatch fulfilled action or just navigate
                // For security, usually best to redirect to login
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Reset Failed',
                description: error.response?.data?.message || 'Invalid or expired token',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" />
                <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-teal-500/20 blur-[120px] animate-pulse delay-700" />
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
                            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/30 ring-4 ring-white/10"
                        >
                            {isSuccess ? (
                                <CheckCircle className="h-10 w-10 text-white" />
                            ) : (
                                <Lock className="h-10 w-10 text-white" />
                            )}
                        </motion.div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                            {isSuccess ? 'Password Reset!' : 'Reset Password'}
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground/80">
                            {isSuccess
                                ? 'Your password has been successfully updated.'
                                : 'Enter your new password below.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSuccess ? (
                            <div className="space-y-6">
                                <Button
                                    className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90"
                                    onClick={() => navigate('/login')}
                                >
                                    Go to Login
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-10 bg-white/5 border-white/10 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                autoFocus
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative group">
                                            <CheckCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-10 bg-white/5 border-white/10 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                minLength={6}
                                            />
                                        </div>
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
                                                Updating...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Update Password
                                                <ArrowRight className="h-4 w-4" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
