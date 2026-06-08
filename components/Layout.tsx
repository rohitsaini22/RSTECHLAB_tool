import React from 'react';
import { User, UserRole } from '../types';
import { logout } from '../services/mockBackend';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    logout();
    onLogout();
    navigate('/', { state: { logoutSuccess: true } }); 
  };

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) => 
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive(path) 
        ? 'bg-cyan-900/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
        : 'text-gray-500 hover:bg-white/5 hover:text-gray-200 border border-transparent'
    }`;

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-gray-300">
      {/* Backgrounds */}
      <div className="bg-tech-grid opacity-70"></div>
      <div className="vignette"></div>
      
      {/* Top Website Navbar */}
      <div className="z-50 relative">
        <Navbar user={user} onLogout={onLogout} />
      </div>

      <div className="flex flex-1 overflow-hidden pt-0"> 
        {/* Sidebar */}
        <div className="w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 flex flex-col z-40 relative">
          <div className="px-6 py-8">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">Dashboard</span>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {user.role === UserRole.ADMIN ? (
              <>
                <Link to="/admin" className={linkClass('/admin')}>Overview</Link>
                <Link to="/admin/tools" className={linkClass('/admin/tools')}>Tools</Link>
                <Link to="/admin/users" className={linkClass('/admin/users')}>Users</Link>
                <Link to="/admin/messages" className={linkClass('/admin/messages')}>Messages</Link>
                <Link to="/admin/careers" className={linkClass('/admin/careers')}>Careers</Link>
                <Link to="/admin/updates" className={linkClass('/admin/updates')}>Updates</Link>
                <Link to="/admin/settings" className={linkClass('/admin/settings')}>Settings</Link>
              </>
            ) : (
              <>
                <Link to="/client" className={linkClass('/client')}>Overview</Link>
                <Link to="/client/history" className={linkClass('/client/history')}>Order History</Link>
                <Link to="/client/settings" className={linkClass('/client/settings')}>Settings</Link>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-white/10 bg-black/50">
            <button 
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-white/10 bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 rounded-lg text-xs font-medium transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-0">
          <main className="flex-1 overflow-auto p-8 custom-scrollbar relative z-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
