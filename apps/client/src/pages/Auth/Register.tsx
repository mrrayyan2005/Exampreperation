import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { register, clearError, googleLogin as googleLoginThunk } from '@/redux/slices/authSlice';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading, error, token } = useAppSelector((state) => state.auth);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info from Google using the access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`
          }
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info from Google');
        }
        
        const userInfo = await userInfoResponse.json();
        
        // Send the user data to our backend
        dispatch(googleLoginThunk({
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          profilePicture: userInfo.picture
        }));
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: 'Failed to get user info from Google. Please try again.',
        });
      }
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'Google Login failed. Please try again.',
      });
    }
  });

  useEffect(() => {
    if (token) {
      navigate('/profile');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error,
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Default values for fields moved to onboarding
    const defaultExamTypes = ['General'];
    const defaultExamDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

    await dispatch(register({
      name,
      email,
      password,
      examTypes: defaultExamTypes,
      examDate: defaultExamDate
    }));
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 py-12">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-secondary/10 blur-[120px] animate-pulse" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[50vw] w-[50vw] rounded-full bg-primary/10 blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center"
      >
        {/* Left Side: Testimonial/Value Prop */}
        <div className="hidden md:block space-y-8 pr-8">
          <div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6"
            >
              <BookOpen className="h-3 w-3" />
              <span>Join 10,000+ Students</span>
            </motion.div>
            <h1 className="text-4xl lg:text-5xl font-black text-foreground leading-tight mb-4">
              Master Your <br />
              <span className="text-primary">Exams Today.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Get personalized study plans, AI-generated tests, and daily goals to keep you on track.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Smart Study Schedules",
              "AI Doubt Solving",
              "Performance Analytics"
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-3"
              >
                <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur border border-border shadow-sm mt-8">
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-secondary text-lg">★</span>)}
            </div>
            <p className="text-sm font-medium text-foreground italic mb-4">
              "This app literally saved my grades. The daily goals feature is a game changer for procrastination."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">RJ</div>
              <div>
                <div className="text-xs font-bold text-foreground">Rahul J.</div>
                <div className="text-[10px] text-muted-foreground">Med Student</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <Card className="border-border bg-card/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Create FREE Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              No credit card required. Start in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10 bg-background border-border focus:ring-primary/20 focus:border-primary"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 bg-background border-border focus:ring-primary/20 focus:border-primary"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-background border-border focus:ring-primary/20 focus:border-primary"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground uppercase tracking-widest text-xs rounded-full">Or sign up with</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 bg-background border-border hover:bg-muted transition-all font-semibold flex items-center justify-center gap-2 text-foreground"
                  onClick={() => loginWithGoogle()}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" focusable="false">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign up with Google
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 w-full">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Already a student?</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full border-border hover:bg-muted text-foreground">
                  Sign in to your dashboard
                </Button>
              </Link>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              By clicking "Get Started", you agree to our <Link to="/terms" className="underline hover:text-primary">Terms</Link> and <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
