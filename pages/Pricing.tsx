import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { User, BusinessPlan } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { getPlans, updateUserPlan } from '../services/mockBackend';
import { CreditCard, Shield, Sparkles, Check, CheckCircle2, Lock, ArrowRight, RefreshCw } from 'lucide-react';

interface PageProps {
  user?: User | null;
  onLogout?: () => void;
}

const Pricing: React.FC<PageProps> = ({ user: propUser, onLogout }) => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'LIFETIME'>('MONTHLY');
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(propUser || null);

  useEffect(() => {
    // Standard react-state synchronization with local storage
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
    getPlans().then(data => {
      // Filter out disabled plans on public site
      setPlans(data.filter(p => p.status === 'ACTIVE'));
      setLoading(false);
    });
  }, []);

  const handleSelectPlan = (plan: BusinessPlan) => {
    if (!user) {
      navigate('/login', { state: { mode: 'login' } });
      return;
    }
    setSelectedPlan(plan);
    setCheckoutModalOpen(true);
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !user) return;

    setIsProcessing(true);
    setTimeout(async () => {
      try {
        await updateUserPlan(user.id, selectedPlan.id, selectedPlan.name);
        setIsProcessing(false);
        setCheckoutSuccess(true);
      } catch (err) {
        alert('Payment failure. Try again.');
        setIsProcessing(false);
      }
    }, 1500);
  };

  const handleSuccessClose = () => {
    setCheckoutModalOpen(false);
    setCheckoutSuccess(false);
    setSelectedPlan(null);
    navigate(user?.role === 'ADMIN' ? '/admin' : '/client');
  };

  return (
    <div className="bg-[#0B1121] min-h-screen font-sans text-white relative">
      <Navbar user={user} onLogout={onLogout} />

      {/* Decorative Blur Layers */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="py-24 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider rounded-full uppercase mb-4">
              <Shield className="w-3 h-3" />
              Flexible Licensing
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Configuration-Driven <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Pricing Models</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
              No code modifications. Changing plan thresholds, features, and rates is handled live by system administrators. Select a plan to experience simulation checkout below.
            </p>

            {/* Toggle Billing State */}
            <div className="inline-flex items-center p-1 bg-black/40 border border-white/10 rounded-full relative">
              <button 
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer ${billingCycle === 'MONTHLY' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/10' : 'text-gray-400 hover:text-white'}`}
              >
                Monthly Price
              </button>
              <button 
                onClick={() => setBillingCycle('LIFETIME')}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 pointer-events-auto cursor-pointer ${billingCycle === 'LIFETIME' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/10' : 'text-gray-400 hover:text-white'}`}
              >
                Lifetime Price
              </button>
            </div>
          </div>
        </div>

        {/* Loaded state */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          {loading ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Hydrating current pricing grids...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="py-24 text-center bg-[#050505]/40 border border-dashed border-white/10 rounded-2xl max-w-2xl mx-auto">
              <Lock className="w-10 h-10 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold">No Plans Defined</h3>
              <p className="text-gray-400 text-sm mt-1">Configure active plans in Settings to restore standard billing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center">
              {plans.map((plan) => {
                const isActiveUserPlan = user?.planId === plan.id;
                const isPopular = plan.id === 'plan-premium' || plan.name.toLowerCase().includes('premium');
                const priceValue = billingCycle === 'MONTHLY' ? plan.priceMonthly : plan.priceLifetime;

                return (
                  <div 
                    key={plan.id} 
                    className={`relative bg-[#050505]/65 border rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                      isActiveUserPlan 
                        ? 'ring-2 ring-cyan-500 border-cyan-500/40 shadow-xl' 
                        : isPopular 
                          ? 'border-indigo-500/40 shadow-lg shadow-indigo-950/10' 
                          : 'border-white/10'
                    }`}
                  >
                    {/* Active highlight label */}
                    {isActiveUserPlan && (
                      <div className="absolute top-4 right-4 bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full shadow-md z-10">
                        Active Subscription
                      </div>
                    )}

                    {isPopular && !isActiveUserPlan && (
                      <div className="absolute top-4 right-4 bg-indigo-950/80 border border-indigo-500/50 text-indigo-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full shadow-md z-10">
                        Featured
                      </div>
                    )}

                    {/* Main upper features content */}
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white mb-2">{plan.name}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-6">
                        Configuration Bound
                      </p>

                      <div className="flex items-baseline mb-6 border-b border-white/5 pb-6">
                        <span className="text-4xl font-extrabold text-white">₹{priceValue.toLocaleString('en-IN')}</span>
                        <span className="text-gray-500 ml-2 text-xs font-mono uppercase tracking-wider">
                          / {billingCycle === 'MONTHLY' ? 'mo' : 'one-time'}
                        </span>
                      </div>

                      {/* Limits summary display panel */}
                      <div className="bg-[#050505]/95 border border-white/5 p-4 rounded-xl mb-6 flex justify-around text-center">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Storage</p>
                          <p className="text-sm font-bold text-gray-300 mt-1">{plan.storageLimit}</p>
                        </div>
                        <div className="border-r border-white/5" />
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Transfers Limit</p>
                          <p className="text-sm font-bold text-gray-300 mt-1">{plan.transferLimit} <span className="text-[10px] text-gray-500 font-normal">/mo</span></p>
                        </div>
                      </div>

                      {/* Benefits & Permissions checklist */}
                      <ul className="space-y-3.5 mb-8">
                        {plan.premiumFeatures.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer / select button */}
                    <div className="pt-4  border-t border-white/5 mt-auto">
                      <Button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isActiveUserPlan}
                        className={`w-full py-3.5 text-xs uppercase font-extrabold tracking-widest ${
                          isActiveUserPlan 
                            ? 'bg-cyan-950/40 text-cyan-400/50 border border-cyan-500/20 hover:bg-cyan-950/40 cursor-not-allowed' 
                            : isPopular 
                              ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/15' 
                              : 'bg-white text-black hover:bg-gray-200'
                        }`}
                      >
                        {isActiveUserPlan ? 'Your Active Plan' : 'Select License Tier'}
                      </Button>
                      {plan.trialDays > 0 && !isActiveUserPlan && (
                        <p className="text-[10px] text-center text-cyan-400/80 mt-2 font-mono">
                          {plan.trialDays} DAYS TRADING TRIAL INCLUDED
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-[#050505]/45 py-24 border-t border-white/5 relative">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12 text-white">Dynamic Pricing Core FAQ</h2>
            <div className="grid gap-6">
              {[
                { q: "Is pricing hardcoded anywhere in the system?", a: "No. The entire platform utilizes a completely configuration-driven structure. Admin changes to Plan Name, Price, limits, and statuses instantly configure this screen without recompiling." },
                { q: "How are tool limits and features audited?", a: "Storage and transfer limits are loaded directly from local storage parameters associated with the user's selected license tier. The front and backend check constraints against actual use in real time." },
                { q: "Can we support lifetime billing?", a: "Yes. System settings support toggle sliders between standard Monthly rates and Lifetime licensing. Upgrades propagate instant limits permissions." }
              ].map((item, i) => (
                <div key={i} className="bg-[#080d1a] px-6 py-5 rounded-xl border border-white/5 hover:border-white/15 transition-colors">
                  <h4 className="font-bold text-white text-base mb-2">{item.q}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Checkout Modal */}
      {checkoutModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#050505] border border-white/15 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative">
            
            {/* Modal Exit Header */}
            <button 
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white text-lg font-mono"
            >
              ×
            </button>

            {/* Modal Body */}
            {!checkoutSuccess ? (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 rounded-lg">
                    <CreditCard className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Simulation Checkout</h3>
                    <p className="text-xs text-cyan-500 font-mono tracking-wider">{selectedPlan.name.toUpperCase()}</p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-6 text-sm">
                  <div className="flex justify-between font-mono text-gray-400">
                    <span>Charge Type</span>
                    <span className="text-white uppercase font-bold">{billingCycle}</span>
                  </div>
                  <div className="flex justify-between font-mono text-gray-400 mt-2">
                    <span>Billed Price</span>
                    <span className="text-white font-extrabold">₹{(billingCycle === 'MONTHLY' ? selectedPlan.priceMonthly : selectedPlan.priceLifetime).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-mono text-gray-400 mt-2">
                    <span>File Limits</span>
                    <span className="text-white font-bold">{selectedPlan.transferLimit} limit</span>
                  </div>
                </div>

                <form onSubmit={handleProcessCheckout} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">MOCK CARD NUMBER (ANY)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">EXP DATE</label>
                      <input 
                        type="text" 
                        required
                        placeholder="MM / YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">CVV</label>
                      <input 
                        type="password" 
                        required
                        placeholder="***"
                        maxLength={3}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-300 leading-normal flex gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0 text-indigo-400 mt-0.5" />
                    <span>No actual monetary exchange. This is a secure transaction simulation utilizing config sandbox presets.</span>
                  </div>

                  <Button 
                    type="submit" 
                    isLoading={isProcessing}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold uppercase py-3.5 tracking-wider mt-4"
                  >
                    Simulate Payment & Settle
                  </Button>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-500 flex items-center justify-center text-cyan-400 mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">License Upgrade Settled!</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                  Your platform user profile has been successfully modified with <span className="font-bold text-cyan-400">{selectedPlan.name}</span> thresholds.
                </p>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-left text-gray-400 font-mono space-y-1 mb-8">
                  <p>• Authorized: COMPLETED</p>
                  <p>• Active Tier: {selectedPlan.name}</p>
                  <p>• Data Threshold: {selectedPlan.storageLimit} capacity</p>
                </div>
                <Button 
                  onClick={handleSuccessClose}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase py-3 tracking-widest"
                >
                  Enter Dynamic Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="bg-[#050911] text-gray-600 py-8 text-center text-sm border-t border-gray-900">
        <p>© 2026 RSTECHLAB. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Pricing;
