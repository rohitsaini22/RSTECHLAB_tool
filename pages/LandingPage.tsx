import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import ThreeDBackground from '../components/ThreeDBackground';
import { NewsUpdate, User } from '../types';
import { getUpdates } from '../services/mockBackend';

interface PageProps {
  user?: User | null;
  onLogout?: () => void;
}

const LandingPage: React.FC<PageProps> = ({ user, onLogout }) => {
  const [currentUpdate, setCurrentUpdate] = useState(0);
  const [updates, setUpdates] = useState<NewsUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying || updates.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentUpdate((prev) => (prev + 1) % updates.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, updates.length]);

  useEffect(() => {
    // Fetch Updates
    getUpdates().then(data => {
        setUpdates(data);
        setLoadingUpdates(false);
    });

    if (location.state?.loginSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
    if (location.state?.logoutSuccess) {
      setShowLogoutSuccess(true);
      const timer = setTimeout(() => setShowLogoutSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  const nextUpdate = () => {
    if (updates.length === 0) return;
    setCurrentUpdate((prev) => (prev + 1) % updates.length);
    setIsAutoPlaying(false);
  };

  const prevUpdate = () => {
    if (updates.length === 0) return;
    setCurrentUpdate((prev) => (prev - 1 + updates.length) % updates.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="bg-[#0B1121] min-h-screen font-sans text-white relative overflow-x-hidden">
      <Navbar user={user} onLogout={onLogout} />

      {/* Global Interactive 3D Space Background */}
      <ThreeDBackground fullPage={true} />

      {/* Login Success Toast */}
      {showSuccess && (
        <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right fade-in duration-500">
            <div className="bg-green-600/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-green-500/50 ring-1 ring-black/5">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div>
                <h4 className="font-bold text-lg leading-tight">Login Successful</h4>
                <p className="text-sm text-green-100">Welcome back, {user?.name.split(' ')[0]}!</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="text-white/70 hover:text-white ml-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            </div>
        </div>
      )}

      {/* Logout Success Toast */}
      {showLogoutSuccess && (
        <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right fade-in duration-500">
            <div className="bg-blue-600/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-blue-500/50 ring-1 ring-black/5">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </div>
            <div>
                <h4 className="font-bold text-lg leading-tight">Signed Out</h4>
                <p className="text-sm text-blue-100">You have been successfully signed out.</p>
            </div>
            <button onClick={() => setShowLogoutSuccess(false)} className="text-white/70 hover:text-white ml-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative pt-32 pb-36 overflow-hidden">
        {/* Background Particles/Stars Simulation */}
        <div className="absolute inset-0 z-0 overflow-hidden">
           {/* Top Center Glow */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge: New Release */}
          <div className="flex justify-center mb-10">
            <span className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wide uppercase hover:bg-blue-500/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <span className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-full text-[10px] shadow-sm">
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </span>
              NEW RELEASE
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-8 leading-[1.05] text-white">
            Build Amazing <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 drop-shadow-lg">
              Digital Experiences
            </span>
            <span className="inline-flex items-center justify-center ml-2 sm:ml-4 px-3 py-1 align-middle rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm sm:text-lg font-bold tracking-normal backdrop-blur-md">
               <span className="mr-1.5">🤖</span> WITH AI
            </span>
          </h1>

          {/* Description Box */}
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
             Transform your business with our <span className="text-cyan-400 font-medium underline decoration-cyan-500/30 decoration-2 underline-offset-4">AI-powered solutions</span> that drive innovation, efficiency, and growth in the digital landscape.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/tools">
              <button className="group relative px-8 py-4 rounded-full bg-cyan-500 text-black font-extrabold text-lg hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center gap-3 overflow-hidden cursor-pointer">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                Launch Sandbox Tools 
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards / Image Preview Area */}
      <div className="py-24 bg-transparent relative z-10">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
                  <div>
                      <h2 className="text-4xl font-bold text-white mb-4">Explore Sandbox Clusters</h2>
                      <p className="text-gray-400 max-w-xl text-lg">Instantly launch high-fidelity developer utilities, cryptographic sandboxes, and cloud-gated microservices.</p>
                  </div>
                  <Link to="/about" className="text-cyan-400 font-bold hover:text-cyan-300 flex items-center gap-2">
                      About the Platform <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
                  {/* Large Card: Sandboxes */}
                  <div className="md:col-span-2 row-span-1 rounded-3xl overflow-hidden relative group border border-white/10 bg-[#0f172a]">
                      <img src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-all duration-700 scale-100 group-hover:scale-105" alt="Cryptographic Sandbox" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] via-transparent to-transparent"></div>
                      <div className="absolute inset-0 p-10 flex flex-col justify-end">
                          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3 block">Sandbox Core</span>
                          <h3 className="text-4xl font-bold text-white mb-3">Isolated Dev Sandboxes</h3>
                          <p className="text-gray-200 mb-8 max-w-md text-lg leading-relaxed">Direct runtime configurations and cryptographic authorization keygates allow seamless development.</p>
                          <Link to="/tools" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/10 backdrop-blur-md border border-cyan-500/30 rounded-full text-cyan-400 font-bold hover:bg-cyan-500 hover:text-black transition-all w-fit cursor-pointer">
                              Launch Sandbox Portals
                          </Link>
                      </div>
                  </div>

                  {/* Tall Card: Licensing Gates */}
                  <div className="md:col-span-1 row-span-1 rounded-3xl overflow-hidden relative group border border-white/10 bg-[#0f172a]">
                      <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-20 transition-all duration-700" alt="Networks" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B1121]/50 to-[#0B1121] p-8 flex flex-col justify-end">
                          <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2 block">Cryptographic Lock</span>
                          <h3 className="text-3xl font-bold text-white mb-3">Dynamic Tiers</h3>
                          <p className="text-gray-400 text-sm mb-6 leading-relaxed">Securely authorize custom subscription plan levels directly from the administration interface.</p>
                          <Link to="/pricing" className="block text-center w-full py-3 rounded-xl border border-white/20 hover:bg-white hover:text-black text-white text-sm font-bold transition-all cursor-pointer">
                              View Utility Plans
                          </Link>
                      </div>
                  </div>

                   {/* Card 3: Performance Metrics */}
                   <div className="md:col-span-1 rounded-3xl p-8 border border-white/10 bg-[#111827] flex flex-col justify-center items-center text-center group hover:border-cyan-500/30 transition-colors">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-600 to-teal-600 text-black flex items-center justify-center mb-6 text-3xl shadow-lg shadow-cyan-900/20 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Zero Latency</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">Highly optimized, lightweight system routes ensure sub-millisecond local script execution speeds.</p>
                  </div>

                   {/* Card 4: AI Integration */}
                   <div className="md:col-span-2 rounded-3xl p-10 border border-white/10 bg-[#111827] relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                      <div className="relative z-10 flex flex-col h-full justify-center items-start">
                          <div className="flex items-center gap-3 mb-4">
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                              </span>
                              <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Server-Side Grounding</span>
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-4">Integrated AI Intelligence</h3>
                          <p className="text-gray-400 max-w-lg mb-8 text-lg">Power up individual testing nodes with active pipelines, smart categorizers, and natural intelligence agents.</p>
                          <Link to="/about" className="text-sm font-bold text-white border-b border-cyan-500 pb-1 hover:text-cyan-400 transition-colors cursor-pointer">Discover Sandbox Architectures →</Link>
                      </div>
                  </div>
               </div>
           </div>
      </div>



      {/* Latest Updates Section */}
      <div className="py-24 bg-transparent relative border-t border-white/5 overflow-hidden">
         {/* Background Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
               <span className="inline-block px-4 py-1 rounded-full bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 border border-white/10">What's New</span>
               <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Latest Updates</h2>
               <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                 Stay updated with our latest launches, events, and gallery updates.
               </p>
            </div>

            {loadingUpdates ? (
               <div className="flex justify-center items-center h-[500px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
               </div>
            ) : updates.length > 0 ? (
                <div 
                    className="relative rounded-3xl overflow-hidden bg-[#111827] border border-white/10 h-[600px] shadow-2xl group"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentUpdate}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0"
                        >
                            {/* Background Image with Parallax-like effect */}
                            <motion.img 
                                src={updates[currentUpdate].image} 
                                alt="Update" 
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 6, ease: "linear" }}
                                className="w-full h-full object-cover opacity-60" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] via-[#0B1121]/40 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1121]/90 via-[#0B1121]/40 to-transparent"></div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex items-center z-20 pointer-events-none">
                        <div className="max-w-3xl px-8 md:px-16 w-full pointer-events-auto">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentUpdate}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                >
                                    <span className="inline-block px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full mb-6 backdrop-blur-md">
                                        {updates[currentUpdate].tag}
                                    </span>
                                    <h3 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-lg">
                                        {updates[currentUpdate].title}
                                    </h3>
                                    <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl drop-shadow-md font-light">
                                        {updates[currentUpdate].description}
                                    </p>
                                    <div className="flex gap-4">
                                        <Button variant="primary" className="bg-white text-black hover:bg-gray-200 border-none shadow-xl shadow-white/10">
                                            Read Full Story
                                        </Button>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Navigation Controls */}
                    {updates.length > 1 && (
                        <>
                            <div className="absolute bottom-10 right-10 flex items-center gap-4 z-30">
                                <button 
                                    onClick={prevUpdate}
                                    className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 transition-all backdrop-blur-md group/btn"
                                >
                                    <svg className="w-6 h-6 group-hover/btn:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                </button>
                                <button 
                                    onClick={nextUpdate}
                                    className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 transition-all backdrop-blur-md group/btn"
                                >
                                    <svg className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </div>

                            {/* Progress Indicators */}
                            <div className="absolute bottom-10 left-10 md:left-16 flex gap-3 z-30">
                                {updates.map((_, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => { setCurrentUpdate(idx); setIsAutoPlaying(false); }}
                                        className="relative h-1.5 rounded-full overflow-hidden bg-white/20 transition-all duration-300 hover:bg-white/40"
                                        style={{ width: currentUpdate === idx ? '3rem' : '1.5rem' }}
                                    >
                                        {currentUpdate === idx && isAutoPlaying && (
                                            <motion.div 
                                                className="absolute inset-0 bg-blue-500"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 5, ease: "linear" }}
                                            />
                                        )}
                                        {currentUpdate === idx && !isAutoPlaying && (
                                            <div className="absolute inset-0 bg-blue-500 w-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-32 border border-white/10 rounded-3xl bg-[#111827]/50 backdrop-blur-sm">
                    <div className="mb-4 text-6xl">📭</div>
                    <h3 className="text-xl font-bold text-white mb-2">No Updates Yet</h3>
                    <p>Check back soon for the latest news and announcements.</p>
                </div>
            )}
         </div>
      </div>

      
      {/* Footer */}
      <footer className="bg-[#020617]/90 backdrop-blur-md border-t border-white/10 pt-20 pb-10 relative z-10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
               <div className="col-span-1 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-6">
                     <span className="text-cyan-500 font-bold text-lg">{'< >'}</span>
                     <span className="text-xl font-bold text-white tracking-wide uppercase">RSTECHLAB</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                     Empowering the next generation of builders with premium microservice utility sandboxes.
                  </p>
               </div>

               <div>
                  <h4 className="text-white font-bold mb-6">Platform</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                     <li><Link to="/tools" className="hover:text-white transition-colors">Developer Tools</Link></li>
                     <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold mb-6">Company</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                     <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                     <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                     <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold mb-6">Stay Updated</h4>
                  <div className="flex">
                     <input 
                        type="email" 
                        placeholder="Email address" 
                        className="bg-[#111] text-white text-sm px-4 py-3 rounded-l-lg border border-white/10 focus:outline-none focus:border-cyan-500 w-full"
                     />
                     <button className="bg-cyan-600 px-4 rounded-r-lg hover:bg-cyan-500 transition-colors text-white">
                        →
                     </button>
                  </div>
               </div>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-gray-600 text-sm">© 2025 RSTECHLAB. All rights reserved.</p>
               <div className="flex gap-6 text-sm text-gray-600">
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

// Simple Button Helper for local use
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' }> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-full font-semibold transition-all shadow-lg flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25",
    outline: "border border-gray-600 text-gray-300 hover:text-white hover:border-white bg-transparent"
  };
  return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

export default LandingPage;