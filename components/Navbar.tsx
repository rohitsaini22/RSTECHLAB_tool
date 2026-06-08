import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { getCurrentUser, logout } from '../services/mockBackend';

interface NavbarProps {
  user?: User | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user: propUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = propUser || getCurrentUser();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout(); 
    navigate('/', { state: { logoutSuccess: true } });
  };

  return (
    <nav className="bg-black/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-cyan-500 font-bold text-lg">{'< >'}</span>
            <span className="text-xl font-bold text-white tracking-wide uppercase group-hover:text-cyan-400 transition-colors">RSTECHLAB</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Link 
              to="/" 
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/') ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
            >
              Home
            </Link>
            <Link 
              to="/tools" 
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/tools') ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
            >
              Tools
            </Link>
            <Link 
              to="/contact" 
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/contact') ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 hover:bg-white/5 p-1.5 rounded-lg transition-colors border border-transparent hover:border-white/10"
              >
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{user.role}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#111] flex items-center justify-center text-white font-bold shadow-md border border-white/20">
                    {user.name.charAt(0)}
                </div>
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#050505] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/10 sm:hidden">
                    <p className="text-sm font-bold text-white">{user.name}</p>
                  </div>
                  
                  <Link 
                    to={user.role === UserRole.ADMIN ? '/admin' : '/client'} 
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>

                  <div className="border-t border-white/10 mt-2 pt-2">
                    <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/10 hover:text-red-300"
                    >
                        Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" state={{ mode: 'login' }} className="text-gray-300 hover:text-white font-medium text-sm">Log In</Link>
              <Link to="/login" state={{ mode: 'signup' }} className="bg-white text-black font-bold text-sm px-5 py-2 rounded hover:bg-gray-200">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};