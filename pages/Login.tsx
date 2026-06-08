import React, { useState, useEffect } from 'react';
import { login, register } from '../services/mockBackend';
import { UserRole, User } from '../types';
import { Button } from '../components/Button';
import { Navbar } from '../components/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';

interface LoginPageProps {
  onLogin: (user: User) => void;
  currentUser?: User | null;
  onLogout?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, currentUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Check location state for mode (login or signup), default to Login (true) if undefined, or Register (false) if 'signup'
  const [isLogin, setIsLogin] = useState(location.state?.mode === 'signup' ? false : true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); 
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [ssoProcessing, setSsoProcessing] = useState(false);
  const [ssoStep, setSsoStep] = useState(0);
  const [ssoTargetSubdomain, setSsoTargetSubdomain] = useState('');

  // Sync state if navigation happens
  useEffect(() => {
    if (location.state?.mode) {
      setIsLogin(location.state.mode === 'login');
      setError('');
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      let authResponse;
      if (isLogin) {
        authResponse = await login(email, password);
      } else {
        authResponse = await register(name, email, password, UserRole.CLIENT);
      }
      
      if (authResponse && authResponse.user) {
        onLogin(authResponse.user);
        
        // Check for federated SSO redirects
        const searchParams = new URLSearchParams(location.search);
        const redirectParam = searchParams.get('redirect');
        
        if (redirectParam) {
          setSsoProcessing(true);
          // Normalize the subdomain name for clean UI display
          let dispSub = redirectParam.replace('https://', '').replace('http://', '');
          setSsoTargetSubdomain(dispSub);
          
          // Store token in localStorage
          localStorage.setItem('sh_auth_token', 'fake-jwt-token-' + Math.random().toString(36).substring(2, 15));
          
          let step = 0;
          setSsoStep(0);
          const interval = setInterval(() => {
            step += 1;
            setSsoStep(step);
            if (step >= 4) {
              clearInterval(interval);
              setTimeout(() => {
                setSsoProcessing(false);
                // Return back with success payload to tools view
                navigate('/tools', { 
                  state: { 
                    authorizedSubdomain: dispSub,
                    ssoToken: localStorage.getItem('sh_auth_token')
                  } 
                });
              }, 1200);
            }
          }, 700);
        } else {
          // Navigate to Home Page with success state for Toast
          navigate('/', { state: { loginSuccess: true } });
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setConfirmPassword('');
    if (isLogin) {
        setName('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1121] font-sans text-white flex flex-col relative overflow-hidden">
      
      {/* Absolute SSO Handshake Terminal Overlay */}
      {ssoProcessing && (
        <div className="absolute inset-0 bg-[#060814]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#090b16] border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold bg-cyan-950/45 px-2.5 py-0.5 rounded border border-cyan-500/20">
                RSTechLab Centralized SSO Gateway
              </span>
            </div>

            <div className="space-y-4 font-mono text-xs text-gray-400">
              <p className="text-cyan-500 font-bold">
                $ rstechlab-auth --init-federated-sso --target={ssoTargetSubdomain || "transfer.rstechlab.com"}
              </p>
              
              <div className="space-y-2 mt-4 min-h-[140px]">
                <p className={`transition-all duration-300 ${ssoStep >= 0 ? "text-white" : "opacity-20"}`}>
                  <span className="text-cyan-400">✔</span> [0.1s] CENTRALIZED AUTH AGENT: Checked active session pool ... APPROVED
                </p>
                {ssoStep >= 1 && (
                  <p className="text-white animate-fade-in">
                    <span className="text-cyan-400">✔</span> [0.7s] GATEWAY CONNECT: Handshake initiated to domain {ssoTargetSubdomain}
                  </p>
                )}
                {ssoStep >= 2 && (
                  <p className="text-white animate-fade-in">
                    <span className="text-cyan-400">✔</span> [1.4s] SECURITY HANDSHAKE: Generated unique JWT credentials ticket
                  </p>
                )}
                {ssoStep >= 3 && (
                  <p className="text-teal-400 font-bold animate-fade-in">
                    <span className="text-teal-400">✔</span> [2.1s] cryptographic signature verification: APPROVED (RS256)
                  </p>
                )}
                {ssoStep >= 4 && (
                  <p className="text-green-400 font-bold uppercase tracking-wider animate-pulse">
                    &gt;&gt; ACCESS GRANTED: REDIRECTING USER BACK TO SUBDOMAIN PORTAL...
                  </p>
                )}
              </div>

              {/* Progress Bar indicator */}
              <div className="h-1.5 w-full bg-[#11162d] rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-green-500 transition-all duration-500"
                  style={{ width: `${(ssoStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
              <span>Token: SHA-256 Dynamic Signature</span>
              <span className="animate-pulse">SECURE SESSION SYNCHRONIZED</span>
            </div>
          </div>
        </div>
      )}

      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-[#111827] rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-800">
          
          {/* Left Side - Gradient & Info */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-600 p-12 flex-col justify-center items-center text-center relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>
             <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 opacity-20 rounded-full blur-xl"></div>
             
             <div className="relative z-10">
                <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">
                  {isLogin ? "Welcome Back!" : "Join Us Today!"}
                </h2>
                <p className="text-blue-100 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                  {isLogin 
                    ? "Sign in to access your software dashboard, manage licenses, and download the latest updates."
                    : "Create your account and unlock all the features we have to offer, including exclusive software deals."}
                </p>
                
                {/* Illustration Placeholder */}
                <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-inner mx-auto">
                    <img 
                        src="https://cdni.iconscout.com/illustration/premium/thumb/sign-up-8694031-6983270.png" 
                        alt="Illustration" 
                        className="w-48 h-48 object-contain drop-shadow-2xl"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=Secure+Login';
                        }}
                    />
                </div>
             </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-[#111827]">
            <div className="max-w-md mx-auto w-full">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                  {isLogin ? "New to our platform? " : "Already have an account? "}
                  <button onClick={toggleMode} className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">
                    {isLogin ? 'Create an account' : 'Sign in'}
                  </button>
                </p>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Full Name *</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Email Address *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Password *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                        placeholder="••••••••"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                         {showPassword ? (
                            <svg className="h-5 w-5 text-gray-500 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                         ) : (
                            <svg className="h-5 w-5 text-gray-500 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                         )}
                      </div>
                    </div>
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Confirm Password *</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 bg-[#1F2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2">
                       <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                       {error}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-600/30 transition-all transform active:scale-95" isLoading={loading}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </Button>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Demo Accounts:<br/>
                        <span className="text-gray-400">admin@hub.com</span> / <span className="text-gray-400">password123</span><br/>
                        <span className="text-gray-400">client@hub.com</span> / <span className="text-gray-400">password123</span>
                    </p>
                  </div>
                </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;