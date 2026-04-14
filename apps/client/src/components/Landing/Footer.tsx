import React from 'react';
   import { Link } from 'react-router-dom';
   import { BookOpen, Globe, Shield, Twitter, Facebook, Instagram, Linkedin, Heart } from 'lucide-react';
   
   const Footer = () => {
       return (
           <footer className="bg-sidebar text-sidebar-foreground pt-20 pb-10">
               <div className="container mx-auto px-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                       <div className="space-y-6">
                           <div className="flex items-center gap-2">
                               <div className="p-2 rounded-lg bg-primary text-white">
                                   <BookOpen className="h-6 w-6" />
                               </div>
                               <span className="text-2xl font-bold tracking-tight">ExamPrep</span>
                           </div>
                           <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                               Empowering students worldwide with intelligent tools to master their subjects and achieve their academic potential.
                           </p>
                           <div className="flex gap-4">
                               {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                                   <a key={i} href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-secondary transition-colors">
                                       <Icon className="h-5 w-5" />
                                   </a>
                               ))}
                           </div>
                       </div>
   
                       <div>
                           <h4 className="font-bold mb-6 text-lg">Product</h4>
                           <ul className="space-y-4 text-sm text-white/60">
                               <li><a href="#features" className="hover:text-secondary transition-colors">Features</a></li>
                               <li><Link to="/dashboard" className="hover:text-secondary transition-colors">Dashboard</Link></li>
                           </ul>
                       </div>
   
                       <div>
                           <h4 className="font-bold mb-6 text-lg">Company</h4>
                           <ul className="space-y-4 text-sm text-white/60">
                               <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
                               <li><Link to="/blog" className="hover:text-secondary transition-colors">Blog</Link></li>
                               <li><Link to="/careers" className="hover:text-secondary transition-colors">Careers</Link></li>
                               <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact</Link></li>
                           </ul>
                       </div>
   
                       <div>
                           <h4 className="font-bold mb-6 text-lg">Legal</h4>
                           <ul className="space-y-4 text-sm text-white/60">
                               <li><Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
                               <li><Link to="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
                               <li><Link to="/security" className="hover:text-secondary transition-colors">Security</Link></li>
                               <li><Link to="/cookie" className="hover:text-secondary transition-colors">Cookie Policy</Link></li>
                           </ul>
                       </div>
                   </div>
   
                   <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
                       <div className="flex items-center gap-2">
                           <span>© {new Date().getFullYear()} ExamPrep Inc.</span>
                           <span className="hidden md:inline">•</span>
                           <span className="flex items-center gap-1">Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> for students.</span>
                       </div>
                       <div className="flex gap-6">
                           <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                               <Globe className="h-4 w-4" />
                               <span>English (US)</span>
                           </div>
                       </div>
                   </div>
               </div>
           </footer>
       );
   };
   
   export default Footer;