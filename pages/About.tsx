import React from 'react';
import { Navbar } from '../components/Navbar';
import { User } from '../types';

interface PageProps {
  user?: User | null;
  onLogout?: () => void;
}

const About: React.FC<PageProps> = ({ user, onLogout }) => {
  return (
    <div className="bg-[#0B1121] min-h-screen font-sans text-white">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-101">
         {/* Background Radial Glow Layer */}
         <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px]" />
           <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
         </div>

         <div className="max-w-3xl mx-auto text-center mb-16 relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black mb-6">About <span className="text-cyan-400">RS TECH LAB</span></h1>
            <p className="text-xl text-gray-400 leading-relaxed font-light">
               We are a team of passionate engineers, systems designers, and creators dedicated to building premium high-fidelity developer microservices and isolated sandboxes.
            </p>
         </div>

         <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group bg-black">
               <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Team" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-750" />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
               <p className="text-gray-400 mb-6 leading-relaxed font-light">
                  RSTECHLAB is built to provide isolated execution portals, cryptographic testing gateways, and P2P developer channels under a single centralized client management console. System configurations, role controls, and pricing structures remain completely dynamic and database-driven.
               </p>
               <h2 className="text-2xl font-bold text-white mb-4">Why Choose Us?</h2>
               <ul className="space-y-4 text-gray-400">
                  <li className="flex items-center gap-3">
                     <span className="w-6 h-6 rounded-lg bg-cyan-955 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">✓</span>
                     Configuration-driven, zero compile-time dependencies
                  </li>
                  <li className="flex items-center gap-3">
                     <span className="w-6 h-6 rounded-lg bg-cyan-955 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">✓</span>
                     Granular cryptographic role and permissions checks
                  </li>
                  <li className="flex items-center gap-3">
                     <span className="w-6 h-6 rounded-lg bg-cyan-955 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">✓</span>
                     Ultra-low latency connection pipelines
                  </li>
               </ul>
            </div>
         </div>
      </div>
    </div>
  );
};

export default About;