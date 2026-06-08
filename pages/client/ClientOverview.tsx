
import React, { useEffect, useState } from 'react';
import { getCurrentUser, getClientStats } from '../../services/mockBackend';
import { User } from '../../types';
import { Button } from '../../components/Button';
import { Link } from 'react-router-dom';

const ClientOverview: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userPlan, setUserPlan] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const u = getCurrentUser();
      if (u) {
        setUser(u);
        const s = await getClientStats(u.id);
        setStats(s);
        
        // Find matched dynamic plan limits
        const plans = JSON.parse(localStorage.getItem('sh_plans') || '[]');
        const matched = plans.find((p: any) => p.id === u.planId || p.name === u.planName) || plans[0] || null;
        setUserPlan(matched);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-gray-500">Loading dashboard...</div>;

  const cardClass = "bg-[#050505]/80 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg hover:border-white/20 transition-all";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Welcome back, {user?.name.split(' ')[0]}</h2>
          <p className="text-gray-500 mt-2">
            Pricing Tier: <span className="text-cyan-400 font-bold">{userPlan ? userPlan.name : 'Free Plan'}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/pricing">
            <Button className="bg-transparent text-gray-300 hover:text-white border border-white/10 hover:border-white/20 font-bold transition-all">Change Plan</Button>
          </Link>
          <Link to="/tools">
            <Button className="bg-cyan-500 text-black hover:bg-cyan-400 border-0 font-bold shadow-[0_0_20px_rgba(6,182,212,0.15)]">Browse Tools</Button>
          </Link>
        </div>
      </div>

      {/* Resource Quota Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-cyan-950/10 border border-cyan-500/20 p-5 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Monthly Transfers Quota</p>
            <p className="text-lg font-bold text-white mt-0.5">
              {userPlan ? userPlan.transferLimit : 10} <span className="text-xs text-cyan-500 font-mono font-normal">Transfers Allowed</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Cloud Capacity Allocation</p>
            <p className="text-lg font-bold text-white mt-0.5">
              {userPlan ? userPlan.storageLimit : '2 GB'} <span className="text-xs text-cyan-500 font-mono font-normal">Encrypted Space</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={cardClass}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-900/20 rounded-lg text-blue-400 border border-blue-500/30">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Licenses</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.activeLicenses}</p>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-900/20 rounded-lg text-green-400 border border-green-500/30">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Monthly Cost</p>
                <p className="text-2xl font-bold text-white mt-1">₹{stats.monthlySpend.toLocaleString('en-IN')}<span className="text-xs text-gray-500 font-normal ml-1">/mo</span></p>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-900/20 rounded-lg text-purple-400 border border-purple-500/30">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Spent</p>
                <p className="text-2xl font-bold text-white mt-1">₹{stats.totalSpent.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tools Teaser */}
      <div className={`${cardClass}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-white text-lg">Quick Tools Access</h3>
          <Link to="/tools" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider">Launch Panel</Link>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          You have full cryptographic authorization to access our secure suite of internal micro-utilities and isolated testing sandboxes. Explore your dashboard resources instantly.
        </p>
        <Link to="/tools">
          <Button className="w-full bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black font-mono text-xs uppercase tracking-widest py-3">
            Open Sandbox Panel
          </Button>
        </Link>
      </div>

      {/* Promo / Banner */}
      <div className="relative rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl border border-white/10 overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/40 opacity-50 group-hover:opacity-70 transition-opacity"></div>
         <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
         
         <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Upgrade your toolkit today</h3>
            <p className="text-gray-300 max-w-lg">Get access to premium development and security tools. Save up to 20% on yearly plans.</p>
         </div>
         <Link to="/tools" className="mt-6 md:mt-0 relative z-10">
            <button className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors shadow-lg cursor-pointer">
               Explore Sandbox Tools
            </button>
         </Link>
      </div>
    </div>
  );
};

export default ClientOverview;
