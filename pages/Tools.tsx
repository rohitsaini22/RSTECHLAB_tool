import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Tool, User } from '../types';
import { getTools, incrementToolClicks } from '../services/mockBackend';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { Search, Compass, ExternalLink, Sparkles, Filter, CheckCircle2, Lock, Key, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PageProps {
  user?: User | null;
  onLogout?: () => void;
}

// Dynamic Icon Component mapping Lucide React exports
export const DynamicToolIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "w-6 h-6 text-cyan-400" }) => {
  if (name.startsWith('data:') || name.startsWith('http://') || name.startsWith('https://')) {
    return <img src={name} alt="" className={`${className} object-contain rounded`} referrerPolicy="no-referrer" />;
  }
  const IconComponent = (Lucide as any)[name] || Lucide.Terminal;
  return <IconComponent className={className} />;
};

const Tools: React.FC<PageProps> = ({ user: propUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [categories, setCategories] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const focusToolId = searchParams.get('id');
  const [user, setUser] = useState<User | null>(propUser || null);

  // Centralized SSO Notification Toast
  const [showSsoToast, setShowSsoToast] = useState(false);
  const [ssoToastMessage, setSsoToastMessage] = useState('');

  // Simulated Interactive subdomains state
  const [activeSandboxTool, setActiveSandboxTool] = useState<Tool | null>(null);
  const [transferStep, setTransferStep] = useState(0); // 0: Idle, 1: Progress, 2: Done
  const [transferPercent, setTransferPercent] = useState(0);
  const [transferFileName, setTransferFileName] = useState('');
  const [transferKeyGenerated, setTransferKeyGenerated] = useState('');
  
  const [bleDevices, setBleDevices] = useState<{name: string, rssi: number, mac: string}[]>([]);
  const [bleScanning, setBleScanning] = useState(false);
  
  const [apiTested, setApiTested] = useState(false);
  const [apiHeadersCheck, setApiHeadersCheck] = useState('');
  const [apiResponseStatus, setApiResponseStatus] = useState('');
  const [apiResponsePayload, setApiResponsePayload] = useState('');
  
  const [pingNodes, setPingNodes] = useState<{host: string, latency: number, status: string}[]>([]);
  const [pingActive, setPingActive] = useState(false);
  
  const [razorpayShow, setRazorpayShow] = useState(false);
  const [razorpaySuccess, setRazorpaySuccess] = useState(false);
  const [razorpayProcessing, setRazorpayProcessing] = useState(false);

  // Restriction dialog parameters
  const [restrictionModalOpen, setRestrictionModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState<'LOGIN' | 'PREMIUM' | 'PLAN'>('LOGIN');
  const [targetToolName, setTargetToolName] = useState('');
  const [requiredPlansList, setRequiredPlansList] = useState<string[]>([]);

  useEffect(() => {
    if (location.state && (location.state as any).authorizedSubdomain) {
      const stateObj = location.state as any;
      setSsoToastMessage(`Centralized SSO Handshake: Authenticated on "${stateObj.authorizedSubdomain}" successfully! Secure token verified.`);
      setShowSsoToast(true);
      
      // Auto open dynamic sandbox frame matching authorized subdomain
      getTools().then(data => {
        const matching = data.find(t => t.url.toLowerCase().includes(stateObj.authorizedSubdomain.toLowerCase()));
        if (matching) {
          setActiveSandboxTool(matching);
        }
      });

      // Clear state properties safely
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    // Keep user state synced with local storage changes (from simulators)
    const interval = setInterval(() => {
      const u = localStorage.getItem('sh_current_user');
      if (u) {
        setUser(JSON.parse(u));
      } else {
        setUser(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getTools().then(data => {
      const activeTools = data.filter(t => t.status === 'ACTIVE');
      setTools(activeTools);
      const uniqueCats = Array.from(new Set(activeTools.map(t => t.category)));
      setCategories(uniqueCats);
      setLoading(false);
    });
  }, []);

  const handleOpenTool = (tool: Tool) => {
    // 1. Admin privilege bypass
    if (user && user.role === 'ADMIN') {
      proceedToOpen(tool);
      return;
    }

    const isLoginReq = !!tool.loginRequired;
    const isPremiumReq = !!tool.premiumRequired;
    const allowed = tool.allowedPlans || [];

    // 2. Guest login check
    if (isLoginReq && !user) {
      setTargetToolName(tool.name);
      setModalReason('LOGIN');
      setRestrictionModalOpen(true);
      return;
    }

    // 3. Registered Client license bounds check
    if (user) {
      // First check dynamic allowed plans array
      if (allowed.length > 0) {
        const hasDirectPermission = allowed.some(pNameOrId => 
          pNameOrId === user.planId || 
          pNameOrId === user.planName
        );
        if (!hasDirectPermission) {
          setTargetToolName(tool.name);
          setModalReason('PLAN');
          setRequiredPlansList(allowed);
          setRestrictionModalOpen(true);
          return;
        }
      }

      // Next check broad premium gate
      if (isPremiumReq) {
        const isFree = !user.planName || user.planName.toLowerCase().includes('free') || user.planId === 'plan-free';
        if (isFree) {
          setTargetToolName(tool.name);
          setModalReason('PREMIUM');
          setRestrictionModalOpen(true);
          return;
        }
      }
    } else {
      // Anonymous client attempting to bypass premium gated sandboxes
      if (isPremiumReq || allowed.length > 0) {
        setTargetToolName(tool.name);
        setModalReason('LOGIN');
        setRestrictionModalOpen(true);
        return;
      }
    }

    proceedToOpen(tool);
  };

  const proceedToOpen = (tool: Tool) => {
    incrementToolClicks(tool.id);
    setTools(prev => prev.map(t => t.id === tool.id ? { ...t, clicks: (t.clicks || 0) + 1 } : t));
    
    // Mount custom interactive sandbox portal
    setActiveSandboxTool(tool);
    setTransferStep(0);
    setTransferPercent(0);
    setTransferFileName('');
    setTransferKeyGenerated('');
    setBleScanning(false);
    setBleDevices([]);
    setApiTested(false);
    setPingActive(false);
    setPingNodes([]);
  };

  const filteredTools = tools.filter(t => {
    if (focusToolId && t.id !== focusToolId) return false;

    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#0B1121] min-h-screen font-sans flex flex-col text-white relative">
      <Navbar user={user} onLogout={onLogout} />

      {/* Centralized SSO Handshake Success Notification Toast */}
      {showSsoToast && (
        <div className="bg-cyan-950/90 border-b border-cyan-500/30 text-white py-4 px-6 relative z-50 flex items-center justify-between shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono text-cyan-300 font-semibold uppercase tracking-wider bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-500/20">SSO CENTRALIZED GATEWAY APPROVED</span>
            <p className="text-sm font-light text-gray-200">
              {ssoToastMessage}
            </p>
          </div>
          <button 
            onClick={() => setShowSsoToast(false)}
            className="text-gray-400 hover:text-white font-mono text-xs font-bold px-2 py-1 bg-white/5 rounded cursor-pointer"
          >
            DISMISS ×
          </button>
        </div>
      )}

      {/* Background Radial Glow Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1 py-12">
        {/* Breadcrumb / Top Header Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" />
            RSTECHLAB TOOLKIT
          </span>
        </div>

        {/* Heading Statement */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 leading-tight whitespace-pre-line text-white">
            Dynamic Sandbox <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400">
              Utilities & Microservices
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed font-light">
            Instantly access our enterprise toolkit of microservices, P2P utilities, and intelligence wrappers. Easily controllable directly from our admin architecture.
          </p>
        </div>

        {/* Search and Filters Hub */}
        <div className="bg-[#050505]/60 border border-white/5 backdrop-blur-xl p-6 rounded-2xl mb-12 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Input Element */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                placeholder="Search tools, keys, subdomains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono"
              />
            </div>

            {/* Dynamic Categories */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button 
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide uppercase transition-all duration-200 border cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide uppercase transition-all duration-200 border cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                      : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* If Loading state */}
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Querying tool cluster database...</p>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="py-24 text-center bg-[#050505]/30 border border-dashed border-white/10 rounded-xl">
            <Filter className="w-10 h-10 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No micro-tools found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Please refine your search parameters or check administrative options.
            </p>
          </div>
        ) : (
          /* Tools Responsive Grid */
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredTools.map((tool) => {
                const needsLogin = tool.loginRequired && !user;
                const needsPremium = tool.premiumRequired && (!user || (!user.planName || user.planName.toLowerCase().includes('free') || user.planId === 'plan-free'));
                const isLocked = needsLogin || needsPremium;

                return (
                  <motion.div
                    key={tool.id}
                    layoutId={tool.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    id={`tool-card-${tool.id}`}
                    className="group relative bg-[#050505]/75 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl"
                  >
                    {/* Backdrop Glow effect on Hover */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all duration-500 pointer-events-none" />
                    
                    {/* Upper Compartment */}
                    <div>
                      {/* Icon and Tags row */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-500 shadow-md transition-all duration-300">
                          <DynamicToolIcon name={tool.icon} className="w-6 h-6 transition-all duration-300" />
                        </div>
                        
                        <div className="flex flex-col items-end gap-1.5 text-right">
                          {tool.featured && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-[10px] uppercase font-bold tracking-wider shadow-sm">
                              <Sparkles className="w-2.5 h-2.5" />
                              FEATURED
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-[10px] border border-white/5 text-gray-400 uppercase tracking-wider font-semibold font-mono">
                            {tool.category}
                          </span>
                          
                          {/* Constraint Badges */}
                          {tool.loginRequired && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/20 border border-indigo-500/20 text-indigo-400 text-[9px] font-mono font-bold uppercase mt-1">
                              <Key className="w-2.5 h-2.5" /> Login Required
                            </span>
                          )}
                          {tool.premiumRequired && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/20 border border-amber-500/20 text-amber-400 text-[9px] font-mono font-bold uppercase mt-1">
                              <Lock className="w-2.5 h-2.5" /> Exclusive Tiers
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Name and Description */}
                      <div className="space-y-2 mb-6">
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed font-light min-h-[4rem] group-hover:text-gray-300 transition-colors">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Compartment */}
                    <div className="border-t border-white/5 pt-4 flex items-center justify-between mt-auto">
                      {/* Clicks stats summary */}
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Activity</span>
                        <span className="text-xs text-gray-300 font-mono mt-0.5">
                          {tool.clicks || 0} visits
                        </span>
                      </div>

                      {/* Launch trigger button */}
                      <button
                        onClick={() => handleOpenTool(tool)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase font-extrabold tracking-wider shadow-md transition-all duration-300 cursor-pointer ${
                          isLocked 
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/20' 
                            : 'bg-white text-black hover:bg-cyan-400 hover:text-black hover:shadow-cyan-500/10'
                        }`}
                      >
                        {isLocked ? (
                          <>
                            Locked Tool
                            <Lock className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Run Tool
                            <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Dynamic Restriction Alert Modal */}
      {restrictionModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#050505] border border-white/10 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative overflow-hidden">
            
            {/* Modal Exit */}
            <button 
              onClick={() => setRestrictionModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white text-lg font-mono"
            >
              ×
            </button>

            {modalReason === 'LOGIN' ? (
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-xl bg-indigo-950 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Key className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Central SSO Authentication Required</h3>
                  <p className="text-xs text-indigo-400 uppercase font-mono tracking-widest">{targetToolName}</p>
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                    The requested microservice at rstechlab subdomain requires a valid SSO cryptographic signature. Log in to your RSTechLab parent session to synchronize credentials automatically.
                  </p>
                </div>
                <div className="flex gap-3 pt-3">
                  <button 
                    onClick={() => setRestrictionModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-xs font-bold uppercase hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      setRestrictionModalOpen(false);
                      // Dynamically pull subdomain name corresponding to the tool name
                      const matchingTool = tools.find(t => t.name === targetToolName);
                      const redirectUrl = matchingTool ? matchingTool.url : 'transfer.rstechlab.com';
                      navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
                    }}
                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold uppercase flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Authenticate with SSO <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : modalReason === 'PREMIUM' ? (
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-xl bg-amber-950 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Premium Subscription Required</h3>
                  <p className="text-xs text-amber-500 uppercase font-mono tracking-widest">{targetToolName}</p>
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                    This advanced console utility is restricted to paying license tiers. Upgrade your current tier to unblock unlimited executions.
                  </p>
                </div>
                <div className="flex gap-3 pt-3">
                  <button 
                    onClick={() => setRestrictionModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-xs font-bold uppercase hover:text-white"
                  >
                    No, Thanks
                  </button>
                  <button 
                    onClick={() => {
                      setRestrictionModalOpen(false);
                      navigate('/pricing');
                    }}
                    className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-extrabold uppercase flex items-center justify-center gap-1.5"
                  >
                    View Premium Tiers <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-xl bg-rose-950 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Tier Eligibility Lock</h3>
                  <p className="text-xs text-rose-500 uppercase font-mono tracking-widest">{targetToolName}</p>
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                    Your current account plan does not possess dynamic access configurations for this Sandbox. It is restricted exclusively to the following authorized models:
                  </p>
                  <div className="bg-white/5 p-3 rounded-lg mt-3 text-xs font-mono text-cyan-400 flex flex-wrap gap-1.5 justify-center">
                    {requiredPlansList.map((planItem, i) => (
                      <span key={i} className="bg-cyan-950/50 px-2.5 py-0.5 rounded border border-cyan-500/25 uppercase font-bold">
                        {planItem}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-3">
                  <button 
                    onClick={() => setRestrictionModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-xs font-bold uppercase hover:text-white"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      setRestrictionModalOpen(false);
                      navigate('/pricing');
                    }}
                    className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-xs font-extrabold uppercase flex items-center justify-center gap-1"
                  >
                    Acquire Dynamic License
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. INTERACTIVE SUBDOMAIN SANDBOX CONTAINER PLAYER */}
      {activeSandboxTool && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#050505] border border-cyan-500/30 rounded-2xl max-w-3xl w-full overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col min-h-[580px]">
            {/* Simulated Browser Header */}
            <div className="bg-[#0b0c14] px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors cursor-pointer" onClick={() => setActiveSandboxTool(null)}></span>
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/70"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-green-500/70"></span>
              </div>
              
              {/* Simulated Address Bar */}
              <div className="flex-1 max-w-xl mx-auto bg-black/60 border border-white/10 px-4 py-1.5 rounded-lg text-xs font-mono text-gray-400 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-emerald-500 font-bold">https://</span>
                  <span className="text-white font-medium">{activeSandboxTool.url.replace('https://', '')}</span>
                  <span className="text-gray-600">?sso_token={localStorage.getItem('sh_auth_token')?.substring(0, 16) || 'active-valid-token'}...</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">SECURED SSO</span>
              </div>
              
              <button 
                onClick={() => setActiveSandboxTool(null)}
                className="text-gray-400 hover:text-white font-mono text-sm px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Close ×
              </button>
            </div>

            {/* Live Interactive Sandbox Body */}
            <div className="p-8 flex-1 flex flex-col justify-between">
              
              {/* Tool identity */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-lg">
                  <DynamicToolIcon name={activeSandboxTool.icon} className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white">{activeSandboxTool.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-widest">{activeSandboxTool.category} SUBDOMAIN INSTANCE</p>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-2xl">{activeSandboxTool.description}</p>
                </div>
              </div>

              {/* Dynamic Interactive Render Modules depending on active tool */}
              <div className="flex-1 bg-black/60 border border-white/5 rounded-xl p-6 min-h-[260px] flex flex-col justify-center items-center font-mono text-xs text-left text-gray-300 relative overflow-hidden">
                
                {/* Visual Backdrop laser scan */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-cyan-500/3 to-transparent bg-[size:100%_4px] opacity-20" />
                
                <div className="relative z-10 w-full">
                  {/* MODULE A: FILE TRANSFER SUBDOMAIN */}
                  {activeSandboxTool.url.includes('transfer') && (
                    <div className="space-y-4 w-full">
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="text-gray-400">⚡ P2P Transfer Count Limit:</span>
                        <span className="text-cyan-400 font-bold">
                          {user?.transferCount || 0} / 10 Free Transfers
                        </span>
                      </div>

                      {transferStep === 0 ? (
                        <div className="space-y-4">
                          <div className="border border-dashed border-cyan-500/20 rounded-xl p-8 text-center bg-cyan-950/5 space-y-3">
                            <Compass className="w-10 h-10 text-cyan-400 animate-pulse mx-auto" />
                            <p className="text-sm">Select files or insert test packet parameters</p>
                            <input 
                              type="text" 
                              placeholder="rstech_payload_bundle.bin" 
                              value={transferFileName}
                              onChange={(e) => setTransferFileName(e.target.value)}
                              className="bg-black border border-white/10 rounded px-3 py-1.5 w-full text-center focus:border-cyan-500 focus:outline-none text-white font-mono"
                            />
                            <button 
                              onClick={() => {
                                if (!transferFileName) {
                                  setTransferFileName('rstechlab_debug_core.bin');
                                }
                                setTransferStep(1);
                                setTransferPercent(0);
                                const interval = setInterval(() => {
                                  setTransferPercent(prev => {
                                    if (prev >= 100) {
                                      clearInterval(interval);
                                      setTransferStep(2);
                                      // Increment dynamic transfer count database-wide
                                      const currentU = JSON.parse(localStorage.getItem('sh_current_user') || '{}');
                                      const newCount = (currentU.transferCount || 0) + 1;
                                      
                                      // Local database update
                                      currentU.transferCount = newCount;
                                      localStorage.setItem('sh_current_user', JSON.stringify(currentU));
                                      
                                      // Sync users list database-wide
                                      const usersList = JSON.parse(localStorage.getItem('sh_users') || '[]');
                                      const uIndex = usersList.findIndex((u: any) => u.id === currentU.id);
                                      if (uIndex !== -1) {
                                        usersList[uIndex].transferCount = newCount;
                                        localStorage.setItem('sh_users', JSON.stringify(usersList));
                                      }

                                      // Generate secure hash dynamic signature key
                                      setTransferKeyGenerated('RSHASH_' + Math.random().toString(36).substring(4).toUpperCase());
                                      return 100;
                                    }
                                    return prev + 25;
                                  });
                                }, 300);
                              }}
                              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded font-bold uppercase text-[11px] cursor-pointer mx-auto block mt-2"
                            >
                              Initiate Secure WebRTC Stream
                            </button>
                          </div>
                        </div>
                      ) : transferStep === 1 ? (
                        <div className="space-y-4 text-center py-6">
                          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                          <p className="text-sm text-cyan-400 font-bold">STREAMING COMPARTMENT BYTES: {transferPercent}%</p>
                          <div className="h-2 bg-white/10 rounded-full w-full overflow-hidden border border-white/5">
                            <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${transferPercent}%` }}></div>
                          </div>
                          <p className="text-[10px] text-gray-500">Establishing isolated RTC tunnel between local sandbox and browser terminal...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* If Free count exceeded 10, trigger payment overlay */}
                          {(!user?.planName || user.planName.toLowerCase().includes('free')) && (user?.transferCount || 0) >= 10 ? (
                            <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-6 text-center space-y-4">
                              <Lock className="w-10 h-10 text-red-500 mx-auto" />
                              <h4 className="text-base font-bold text-white uppercase tracking-wider">Free Allotment Limit Reached</h4>
                              <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                                You have successfully transferred 10 package files. To bypass the static threshold and unblock unlimited transactions, upgrade instantly to the Premium Tier.
                              </p>
                              
                              <div className="bg-black/40 p-4 rounded-lg text-white border border-white/5 inline-block">
                                <span className="text-xs font-mono uppercase tracking-widest text-[#B45309]">Premium Upgrade Price:</span>
                                <p className="text-3xl font-black text-white mt-1">₹9.00</p>
                                <span className="text-[10px] text-gray-400 block mt-1">Single-Time Authorization Grant</span>
                              </div>

                              <div className="pt-2">
                                <button 
                                  onClick={() => setRazorpayShow(true)}
                                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-950/30 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                                >
                                  💳 Pay ₹9 Securely via Razorpay
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-teal-950/25 border border-teal-500/20 rounded-xl p-6 text-center space-y-4">
                              <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto animate-bounce" />
                              <h4 className="text-base font-bold text-white uppercase">Peer Connection Transmitted successfully</h4>
                              <p className="text-xs text-gray-400">
                                Simulated file <span className="text-cyan-300 font-bold font-mono">"{transferFileName}"</span> is fully encrypted on local client. Key deployed:
                              </p>
                              <div className="bg-black px-4 py-2 rounded-lg border border-white/10 text-center font-bold text-sm text-yellow-400 font-mono tracking-widest max-w-xs mx-auto">
                                {transferKeyGenerated}
                              </div>
                              <button 
                                onClick={() => setTransferStep(0)}
                                className="px-4 py-1.5 bg-white/5 border border-white/10 rounded font-bold text-[10px] uppercase hover:bg-white/10 cursor-pointer"
                              >
                                Transmit Another File
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODULE B: API GATEWAY SUBDOMAIN */}
                  {activeSandboxTool.url.includes('api') && (
                    <div className="space-y-4 w-full">
                      <p className="text-gray-400">Simulate incoming HTTP request checking SSO tokens:</p>
                      
                      <div className="bg-[#0c0d15] p-4 rounded-lg border border-white/10 space-y-2">
                        <p className="text-yellow-400 font-bold">&gt; GET /v1/auth/session HTTP/1.1</p>
                        <p className="text-gray-500">Host: api.rstechlab.com</p>
                        <p className="text-cyan-400 truncate">Authorization: Bearer {localStorage.getItem('sh_auth_token') || 'fake-jwt-token-abcdef'}</p>
                      </div>

                      {apiTested ? (
                        <div className="bg-black/80 border border-teal-500/20 p-5 rounded-lg space-y-3">
                          <p className="text-green-400 font-bold">&gt;&gt; HTTP/1.1 200 OK</p>
                          <p className="text-gray-400">Server: RSTechLab-SSO-Checker</p>
                          <p className="text-gray-400">Content-Type: application/json; charset=UTF-8</p>
                          <pre className="text-white text-[11px] p-3 bg-white/5 rounded border border-white/5 font-mono overflow-x-auto">
{JSON.stringify({
  status: "AUTHORIZED",
  client: user?.name || "RSTech Guest Client",
  plan: user?.planName || "Free Plan",
  subdomain: "api.rstechlab.com",
  session_expires_utc: "2026-06-09T05:39:00Z",
  handshake_signature: "RS256-VALIDATED"
}, null, 2)}
                          </pre>
                          <button 
                            onClick={() => setApiTested(false)}
                            className="text-xs text-cyan-400 hover:underline cursor-pointer"
                          >
                            Re-send Test Payload
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <button 
                            onClick={() => {
                              setApiTested(true);
                            }}
                            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded uppercase tracking-wider text-[11px] cursor-pointer"
                          >
                            Query API Gateway Connection
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODULE C: LAB / EXECUTION SANDBOX SUBDOMAIN */}
                  {activeSandboxTool.url.includes('lab') && (
                    <div className="space-y-4 w-full">
                      <p className="text-gray-400">Compile Sandbox Javascript nodes isolated on target subdomain:</p>
                      <div className="bg-[#0d0e16] rounded-lg border border-white/10 overflow-hidden">
                        <div className="border-b border-white/5 bg-black/40 px-4 py-2 flex justify-between items-center text-gray-500">
                          <span>sandbox-sandbox.ts</span>
                          <span>Typescript</span>
                        </div>
                        <textarea
                          readOnly
                          rows={4}
                          value={`import { isolatedSandbox, cryptoVerify } from '@rstechlab/core';\n\nconst agent = isolatedSandbox.createNode();\nagent.validateSessionToken("${localStorage.getItem('sh_auth_token')?.substring(0, 16) || 'fake-jwt-token-abcdef'}");`}
                          className="w-full bg-transparent p-4 font-mono text-[11px] text-teal-400 focus:outline-none"
                        ></textarea>
                      </div>

                      {apiTested ? (
                        <div className="bg-black p-4 rounded-lg border border-white/5 space-y-2 text-[11px] text-left">
                          <p className="text-yellow-500">Running Sandbox node test compiler v1.1.0-alpha...</p>
                          <p className="text-white">✔ Loading dynamic packages ... ok</p>
                          <p className="text-white">✔ Authenticating local developer ... Verified ({user?.name || "Client"})</p>
                          <p className="text-white">✔ Allocating memory chunk ... 512MB verified</p>
                          <p className="text-green-400 font-bold">&gt;&gt; Execution completed successfully. Exit code: 0.</p>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <button 
                            onClick={() => setApiTested(true)}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded uppercase text-[11px] cursor-pointer"
                          >
                            Compile & Run Sandbox Container
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODULE D: BLE WEB hardware SCANNER */}
                  {activeSandboxTool.url.includes('ble') && (
                    <div className="space-y-4 w-full">
                      <p className="text-gray-400">Scan for connected microcontroller hardware and IoT signals over Chrome WebBLE:</p>
                      
                      {bleScanning ? (
                        <div className="space-y-4">
                          <div className="flex justify-center py-4">
                            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                          </div>
                          <p className="text-center text-cyan-400 font-bold animate-pulse">Scanning frequencies... listening for BLE advertise frames</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bleDevices.length > 0 && (
                            <div className="space-y-2 border border-white/5 bg-black/40 p-4 rounded-lg">
                              <p className="text-xs font-bold text-gray-500 font-mono uppercase">DISCOVERED BEACONS:</p>
                              {bleDevices.map((dev, i) => (
                                <div key={i} className="flex justify-between border-b border-white/5 py-1 text-xs">
                                  <span className="text-white font-mono">{dev.name}</span>
                                  <span className="text-gray-500 font-mono">{dev.mac}</span>
                                  <span className="text-cyan-400 font-mono font-bold">{dev.rssi} dBm</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="text-center">
                            <button 
                              onClick={() => {
                                setBleScanning(true);
                                setTimeout(() => {
                                  setBleScanning(false);
                                  setBleDevices([
                                    { name: "ESP32-Beetle-A1", mac: "3C:A6:49:EE:41:F2", rssi: -42 },
                                    { name: "Nordic-Semi-Beacon", mac: "10:0E:0F:7D:2E:85", rssi: -65 },
                                    { name: "Arduino-SmartHardware", mac: "F4:B2:A7:3C:99:C1", rssi: -84 }
                                  ]);
                                }, 1500);
                              }}
                              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded uppercase text-[11px] cursor-pointer"
                            >
                              Scan Microcontroller Nodes over Web-BLE
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODULE E: NETWORK PING ANALYZER */}
                  {activeSandboxTool.url.includes('network') && (
                    <div className="space-y-4 w-full">
                      <p className="text-gray-400">Live Traceroute and Latency analysis across internal server subdomains:</p>

                      {pingActive ? (
                        <div className="bg-[#0b0c15] p-4 rounded-lg border border-white/5 space-y-2 text-left">
                          {pingNodes.map((pn, i) => (
                            <p key={i} className="text-white">
                              🚀 tracking to <span className="text-cyan-300 font-bold font-mono">{pn.host}</span> latency: <span className="text-yellow-400 font-bold font-mono">{pn.latency}ms</span> status: <span className="text-green-400 font-bold">{pn.status}</span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <button 
                            onClick={() => {
                              setPingActive(true);
                              setPingNodes([
                                { host: "auth.rstechlab.com", latency: 4.1, status: "OK" },
                                { host: "api.rstechlab.com", latency: 8.8, status: "OK" },
                                { host: "transfer.rstechlab.com", latency: 12.3, status: "OK" },
                                { host: "lab.rstechlab.com", latency: 6.5, status: "OK" }
                              ]);
                            }}
                            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded uppercase text-[11px] cursor-pointer"
                          >
                            Trace Node Latency Matrix
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Console logs output segment */}
              <div className="bg-black/90 p-4 border border-white/5 rounded-xl font-mono text-[10px] text-gray-500 mt-6 min-h-[50px] flex flex-col justify-center text-left">
                <p>&gt; Connection authorization status: SECURE TOKEN SYNCHRONIZED</p>
                <p>&gt; Local Session Client Profile: {user ? `${user.name} • ${user.planName}` : 'Guest Node'}</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. LIVE INTERACTIVE RAZORPAY ₹9 PAYMENT SIMULATOR MODAL */}
      {razorpayShow && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0c0d16] border border-cyan-500/40 rounded-xl max-w-sm w-full shadow-[0_0_80px_rgba(6,182,212,0.3)] divide-y divide-white/10 relative overflow-hidden">
            
            {/* Razorpay branded header bar */}
            <div className="p-6 bg-[#090a10]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-cyan-400 font-sans">PAYMENT SECURED BY RAZORPAY</span>
                <button 
                  onClick={() => setRazorpayShow(false)}
                  className="text-gray-400 hover:text-white font-mono text-base font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-0.5">Order Ref: RS_ORD_{Math.random().toString(36).substring(3, 9).toUpperCase()}</p>
            </div>

            {/* Price Detail segment */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-white font-sans">RSTechLab Premium subscription</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">Dynamic unblocked sandboxes & tools package</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">₹9.00</p>
                  <span className="text-[9px] text-cyan-400 font-mono uppercase bg-cyan-950/25 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">INR</span>
                </div>
              </div>

              {/* Simulated billing credentials */}
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-2 text-[11px] font-mono text-left">
                <p><span className="text-gray-500">Customer:</span> <span className="text-white">{user?.name || "Client"}</span></p>
                <p><span className="text-gray-500">Email:</span> <span className="text-white">{user?.email || "demo@rstechlab.com"}</span></p>
                <p><span className="text-gray-500">Status:</span> <span className="text-cyan-400 animate-pulse">Waiting for Payment Authorization</span></p>
              </div>

              {/* CTA triggers */}
              <div className="pt-2">
                <button 
                  disabled={razorpayProcessing}
                  onClick={() => {
                    setRazorpayProcessing(true);
                    setTimeout(() => {
                      setRazorpayProcessing(false);
                      setRazorpayShow(false);
                      setRazorpaySuccess(true);
                      
                      // Perform Dynamic Upgrade Logic securely
                      const currentU = JSON.parse(localStorage.getItem('sh_current_user') || '{}');
                      currentU.planId = 'plan-premium';
                      currentU.planName = 'Premium Plan';
                      
                      // Save updated user
                      localStorage.setItem('sh_current_user', JSON.stringify(currentU));
                      setUser(currentU);

                      // Save updated users list database-wide
                      const usersList = JSON.parse(localStorage.getItem('sh_users') || '[]');
                      const uIndex = usersList.findIndex((u: any) => u.id === currentU.id);
                      if (uIndex !== -1) {
                        usersList[uIndex].planId = 'plan-premium';
                        usersList[uIndex].planName = 'Premium Plan';
                        localStorage.setItem('sh_users', JSON.stringify(usersList));
                      }

                      // Re-trigger alert toast for user's delight
                      setSsoToastMessage(`Payment Verified by Razorpay! Account dynamically upgraded to PREMIUM PLAN successfully.`);
                      setShowSsoToast(true);
                    }, 1800);
                  }}
                  className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {razorpayProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      Authorizing securely...
                    </>
                  ) : (
                    "PROCEED WITH UPI ₹9"
                  )}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 p-4 text-center font-mono">
              Secure AES-256 TLS certified network endpoint
            </p>
          </div>
        </div>
      )}

      {/* Aesthetic Spacer */}
      <div className="py-8" />
    </div>
  );
};

export default Tools;
