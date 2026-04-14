import { useState, useEffect } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import { motion, AnimatePresence } from 'framer-motion';
   import { useAppDispatch, useAppSelector } from '@/redux/hooks';
   import { login, verifyMfaLogin, googleLogin as googleLoginThunk, clearError } from '@/redux/slices/authSlice';
   import { useGoogleLogin } from '@react-oauth/google';
   import { Button } from '@/components/ui/button';
   import { Input } from '@/components/ui/input';
   import { Label } from '@/components/ui/label';
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
   import { useToast } from '@/hooks/use-toast';
   import { BookOpen, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
   import { cn } from '@/lib/utils';
   
   const Login = () => {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [mfaToken, setMfaToken] = useState('');
   
     const dispatch = useAppDispatch();
     const navigate = useNavigate();
     const { toast } = useToast();
     const { isLoading, error, token, mfaRequired, tempUserId } = useAppSelector((state) => state.auth);
   
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
             title: 'Authentication Failed',
             description: 'Failed to get user info from Google. Please try again.',
           });
         }
       },
       onError: () => {
         toast({
           variant: 'destructive',
           title: 'Authentication Failed',
           description: 'Google Login failed. Please try again.',
         });
       }
     });
   
     useEffect(() => {
       if (token) {
         navigate('/dashboard');
       }
     }, [token, navigate]);
   
     useEffect(() => {
       if (error) {
         toast({
           variant: 'destructive',
           title: 'Authentication Failed',
           description: error,
         });
         dispatch(clearError());
       }
     }, [error, toast, dispatch]);
   
     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       if (mfaRequired && tempUserId) {
         await dispatch(verifyMfaLogin({ userId: tempUserId, token: mfaToken }));
       } else {
         await dispatch(login({ email, password }));
       }
     };
   
     return (
       <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
         {/* Background Decorative Elements */}
         <div className="absolute inset-0 z-0">
           <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
           <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-purple-500/20 blur-[120px] animate-pulse delay-700" />
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
                 className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30 ring-4 ring-white/10"
               >
                 {mfaRequired ? (
                   <ShieldCheck className="h-10 w-10 text-white" />
                 ) : (
                   <BookOpen className="h-10 w-10 text-white" />
                 )}
               </motion.div>
               <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                 {mfaRequired ? 'Security Check' : 'Welcome Back'}
               </CardTitle>
               <CardDescription className="text-base text-muted-foreground/80">
                 {mfaRequired
                   ? 'Enter the 6-digit verification code'
                   : 'Your premium exam preparation starts here'}
               </CardDescription>
             </CardHeader>
             <CardContent>
               <form onSubmit={handleSubmit} className="space-y-5">
                 <AnimatePresence mode="wait">
                   {!mfaRequired ? (
                     <motion.div
                       key="login-form"
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 20 }}
                       className="space-y-4"
                     >
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
                           />
                         </div>
                       </div>
                       <div className="space-y-2">
                         <div className="flex items-center justify-between">
                           <Label htmlFor="password">Password</Label>
                           <Link to="/forgot-password" title="forgot-password" className="text-xs text-primary hover:underline">
                             Forgot password?
                           </Link>
                         </div>
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
                           />
                         </div>
                       </div>
                     </motion.div>
                   ) : (
                     <motion.div
                       key="mfa-form"
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="space-y-4"
                     >
                       <div className="space-y-2">
                         <Label htmlFor="mfaToken" className="text-center block">Authenticator Code</Label>
                         <Input
                           id="mfaToken"
                           type="text"
                           placeholder="000 000"
                           maxLength={6}
                           className="text-center text-3xl font-mono tracking-[0.5em] h-16 bg-white/5 border-white/10 focus:ring-primary/20 focus:border-primary/50 transition-all"
                           value={mfaToken}
                           onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                           autoFocus
                           required
                         />
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
   
                 <Button
                   type="submit"
                   className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] bg-primary hover:bg-primary/90"
                   disabled={isLoading}
                 >
                   {isLoading ? (
                     <span className="flex items-center gap-2">
                       <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                       Verifying...
                     </span>
                   ) : (
                     <span className="flex items-center gap-2">
                       {mfaRequired ? 'Complete Login' : 'Sign In'}
                       <ArrowRight className="h-4 w-4" />
                     </span>
                   )}
                 </Button>
               </form>
   
               <div className="mt-8">
                 <div className="relative">
                   <div className="absolute inset-0 flex items-center">
                     <div className="w-full border-t border-white/10"></div>
                   </div>
                   <div className="relative flex justify-center text-sm">
                     <span className="px-2 bg-[#121212] lg:bg-black/20 text-muted-foreground uppercase tracking-widest text-xs rounded-full backdrop-blur-xl">Or continue with</span>
                   </div>
                 </div>
   
                 <div className="mt-6 flex justify-center">
                   <Button
                     type="button"
                     variant="outline"
                     className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 transition-all font-semibold flex items-center justify-center gap-2"
                     onClick={() => loginWithGoogle()}
                   >
                     <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" focusable="false">
                       <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                       <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                       <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                       <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                     </svg>
                     Continue with Google
                   </Button>
                 </div>
               </div>
   
               {!mfaRequired && (
                 <div className="mt-6 flex flex-col items-center gap-4">
                   <div className="flex items-center gap-2 w-full">
                     <div className="h-px flex-1 bg-white/10" />
                     <span className="text-xs text-muted-foreground uppercase tracking-widest">New Here?</span>
                     <div className="h-px flex-1 bg-white/10" />
                   </div>
                   <Link to="/register" className="w-full">
                     <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                       Create your account
                     </Button>
                   </Link>
                 </div>
               )}
             </CardContent>
           </Card>
         </motion.div>
       </div>
     );
   };
   
   export default Login;