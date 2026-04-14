import React, { Suspense } from 'react';
   import { lazyLoad } from '../utils/lazyLoad';
   import { Link } from 'react-router-dom';
   import HeroSection from '../components/Landing/HeroSection';
   import Navbar from '../components/Landing/Navbar';
   import Footer from '../components/Landing/Footer';
   import SEOHelmet from '../components/Landing/SEOHelmet';
   
   // Lazy load only essential components
   const FeaturesSection = lazyLoad(() => import('../components/Landing/Features'));
   const FAQSection = lazyLoad(() => import('../components/Landing/FAQ'));
   
   const SectionLoader = () => (
       <div className="py-24 flex items-center justify-center min-h-[300px]">
           <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
       </div>
   );
   
   const LandingPage = () => {
       return (
           <div className="min-h-screen bg-background font-sans text-foreground scroll-smooth">
               {/* SEO Optimization */}
               <SEOHelmet />
   
               <Navbar />
   
               <HeroSection />
               
               <Suspense fallback={<SectionLoader />}>
                   <FeaturesSection />
                   <FAQSection />
               </Suspense>
   
               {/* Simple CTA Section */}
               <section className="py-20 bg-primary/5 relative overflow-hidden">
                   <div className="container mx-auto px-6 text-center relative z-10">
                       <div className="max-w-3xl mx-auto">
                           <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                               Ready to Start Studying Smarter?
                           </h2>
                           <p className="text-xl text-muted-foreground mb-8">
                               Join students who are achieving their academic goals with better planning and focus.
                           </p>
                           <div className="flex flex-col sm:flex-row gap-4 justify-center">
                               <Link
                                   to="/register"
                                   className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                               >
                                   Get Started Free
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                   </svg>
                               </Link>
                               <Link
                                   to="/login"
                                   className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-border px-8 py-4 text-lg font-semibold hover:bg-muted transition-colors"
                               >
                                   Sign In
                               </Link>
                           </div>
                       </div>
                   </div>
               </section>
   
               <Footer />
           </div>
       );
   };
   
   export default LandingPage;