
import React, { useEffect, useState } from 'react';
import { getAllStats } from '../../services/mockBackend';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getAllStats().then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-gray-500">Loading stats...</div>;

  const cardClass = "bg-[#050505] p-6 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300";

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Platform Overview</h3>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={cardClass}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Revenue</p>
          <p className="text-3xl font-bold text-white mt-2">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-green-500 mt-2 font-mono">
             ▲ 12% GROWTH
          </p>
        </div>

        <div className={cardClass}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Subs</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.activeSubscriptions}</p>
          <p className="text-xs text-cyan-500 mt-2 font-mono">
             CURRENTLY ACTIVE
          </p>
        </div>

        <div className={cardClass}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Users</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
          <p className="text-xs text-gray-500 mt-2 font-mono">
             REGISTERED
          </p>
        </div>

         <div className={cardClass}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tools Hub</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.totalTools || 0}</p>
          <p className="text-xs text-purple-500 mt-2 font-mono">
             {stats.activeTools || 0} ACTIVE
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className={`lg:col-span-2 ${cardClass}`}>
            <h4 className="text-lg font-bold mb-6 text-white border-b border-white/5 pb-4">Recent Transactions</h4>
            <div className="space-y-1">
                <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/5 px-3 -mx-3 rounded transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded bg-green-900/20 text-green-500 flex items-center justify-center text-xs font-bold border border-green-900/50">₹</div>
                        <div>
                            <p className="text-sm font-bold text-white">Plan Upgrade</p>
                            <p className="text-xs text-gray-500">John Doe • Enterprise Pro Plan</p>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-green-400 font-mono">+₹1,299.00</span>
                </div>
                 <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/5 px-3 -mx-3 rounded transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded bg-green-900/20 text-green-500 flex items-center justify-center text-xs font-bold border border-green-900/50">₹</div>
                        <div>
                            <p className="text-sm font-bold text-white">Dedicated Node Deployment</p>
                            <p className="text-xs text-gray-500">Jane Smith • Custom Cluster Resource</p>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-green-400 font-mono">+₹3,999.00</span>
                </div>
            </div>
        </div>
        
        {/* System Health */}
        <div className={cardClass}>
            <h4 className="text-lg font-bold mb-6 text-white border-b border-white/5 pb-4">System Status</h4>
            <div className="space-y-6">
                 {['SERVER LOAD', 'DATABASE', 'MEMORY'].map((label, idx) => (
                   <div key={label}>
                      <div className="flex justify-between text-xs mb-2">
                          <span className="text-gray-500 font-bold">{label}</span>
                          <span className="text-cyan-400 font-mono">OK</span>
                      </div>
                      <div className="w-full bg-white/5 h-1">
                          <div className={`h-1 ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : 'bg-green-500'}`} style={{width: `${30 + idx * 15}%`}}></div>
                      </div>
                   </div>
                 ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
