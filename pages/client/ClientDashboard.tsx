
import React, { useEffect, useState } from 'react';
import { PlanType, Software } from '../../types';
import { getSoftware, subscribe, getCurrentUser, validateCoupon, getUserSubscriptions, getSoftwareFile } from '../../services/mockBackend';
import { Button } from '../../components/Button';

const ClientDashboard: React.FC = () => {
  const [softwareList, setSoftwareList] = useState<Software[]>([]);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // Payment Modal State
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(PlanType.MONTHLY);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment & Gift Card State
  const [paymentMethod, setPaymentMethod] = useState<'PAYTM' | 'CARD'>('PAYTM');
  const [giftCode, setGiftCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [giftMessage, setGiftMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [paytmUpiId, setPaytmUpiId] = useState('');

  // Download Manager State
  const [downloadState, setDownloadState] = useState<{
    active: boolean;
    fileName: string;
    progress: number;
    speed: string;
  }>({ active: false, fileName: '', progress: 0, speed: '' });

  useEffect(() => {
    const fetchData = async () => {
        const user = getCurrentUser();
        const swPromise = getSoftware();
        // Fetch subscriptions to check what user already owns
        const subsPromise = user ? getUserSubscriptions(user.id) : Promise.resolve([]);

        const [swData, subsData] = await Promise.all([swPromise, subsPromise]);
        
        setSoftwareList(swData);
        // Create a set of active software IDs
        const activeIds = new Set(subsData.filter(s => s.status === 'ACTIVE').map(s => s.softwareId));
        setSubscribedIds(activeIds);
        setLoading(false);
    };
    fetchData();
  }, []);

  // Reset payment state when modal opens
  useEffect(() => {
    if (selectedSoftware) {
      setGiftCode('');
      setDiscountAmount(0);
      setGiftMessage(null);
      setPaytmUpiId('');
      setPaymentMethod('PAYTM');
    }
  }, [selectedSoftware]);

  const handleApplyGiftCard = async () => {
    if (!giftCode || !selectedSoftware) return;
    setGiftMessage(null); // Clear previous message
    
    try {
        const basePrice = selectedPlan === PlanType.MONTHLY ? selectedSoftware.priceMonthly : selectedSoftware.priceYearly;
        const result = await validateCoupon(giftCode, basePrice, selectedSoftware.id, 'SOFTWARE');
        
        setDiscountAmount(result.amount);
        setGiftMessage({ 
            text: `${result.type === 'PERCENTAGE' ? 'Discount' : 'Voucher'} Applied!`, 
            type: 'success' 
        });
    } catch (error: any) {
        setDiscountAmount(0);
        setGiftMessage({ text: error.message || 'Invalid coupon.', type: 'error' });
    }
  };

  const confirmPurchase = async () => {
    if (!selectedSoftware) return;
    
    // Validation
    if (paymentMethod === 'PAYTM' && discountAmount < (selectedPlan === PlanType.MONTHLY ? selectedSoftware.priceMonthly : selectedSoftware.priceYearly) && !paytmUpiId) {
       alert("Please enter your Paytm UPI ID to proceed.");
       return;
    }

    const user = getCurrentUser();
    if (!user) return;
    
    setIsProcessing(true);
    try {
      // Simulate Payment Gateway Delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Pass the coupon code to backend so it marks it as used
      await subscribe(user.id, selectedSoftware.id, selectedPlan, giftCode || undefined);
      
      alert(`Payment Successful via ${paymentMethod}! Subscribed to ${selectedSoftware.name}.`);
      
      // Update local state to reflect subscription immediately
      setSubscribedIds(prev => new Set(prev).add(selectedSoftware.id));
      
      setSelectedSoftware(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (sw: Software) => {
    if (downloadState.active) return; // Prevent multiple downloads

    // CHANGE: Use .zip extension to prevent Antivirus/Browser blocking of raw .exe blobs
    let fileName = sw.fileUrl && sw.fileUrl !== '#' 
        ? sw.fileUrl.split('/').pop() || 'package.zip'
        : `${sw.name.replace(/\s+/g, '_').toLowerCase()}_package.zip`;
    
    // Force zip extension for safety in mock environment
    if (fileName.endsWith('.exe') || fileName.endsWith('.msi')) {
        fileName = fileName.substring(0, fileName.lastIndexOf('.')) + '.zip';
    }
        
    setDownloadState({ active: true, fileName, progress: 0, speed: 'Initializing...' });

    // Simulate download progress based on file size logic
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10 + 5; // Random increment
        if (progress >= 100) {
            clearInterval(interval);
            // Simulate Security Scan
            setDownloadState(prev => ({ ...prev, progress: 100, speed: 'Scanning for viruses...' }));
            
            setTimeout(() => {
                setDownloadState(prev => ({ ...prev, speed: 'Scan Clean. Starting Download...' }));
                setTimeout(() => {
                    triggerBinaryDownload(sw.id, fileName);
                    setDownloadState({ active: false, fileName: '', progress: 0, speed: '' });
                }, 1000);
            }, 1500);
        } else {
            setDownloadState(prev => ({ 
                ...prev, 
                progress: Math.min(progress, 99),
                speed: `${(Math.random() * 5 + 2).toFixed(1)} MB/s`
            }));
        }
    }, 400);
  };

  const triggerBinaryDownload = async (softwareId: string, fileName: string) => {
     let blob: Blob | null = null;
     
     // Try to get real file from IndexedDB
     try {
         const storedFile = await getSoftwareFile(softwareId);
         if (storedFile) {
             blob = storedFile;
             console.log("Found real file in IndexedDB, downloading...");
         }
     } catch(e) {
         console.warn("Could not retrieve file from DB, using fallback");
     }

     if (!blob) {
         // Create a 5MB dummy binary buffer to simulate a "Proper" software file
         // This ensures the file is not 1KB and acts like a binary
         const size = 5 * 1024 * 1024; // 5MB
         const buffer = new Uint8Array(size);
         
         // Fill with some dummy data so it's not just empty
         for(let i = 0; i < size; i+=1024) {
             buffer[i] = i % 255;
         }
         // Use application/zip mime type for better browser acceptance
         blob = new Blob([buffer], { type: 'application/zip' });
     }

     const url = window.URL.createObjectURL(blob);
    
     const link = document.createElement('a');
     link.href = url;
     link.setAttribute('download', fileName);
     document.body.appendChild(link);
     link.click();
    
     // Cleanup
     setTimeout(() => {
         document.body.removeChild(link);
         window.URL.revokeObjectURL(url);
     }, 100);
  };

  const getPrice = () => {
      if (!selectedSoftware) return 0;
      return selectedPlan === PlanType.MONTHLY ? selectedSoftware.priceMonthly : selectedSoftware.priceYearly;
  };

  const finalPrice = Math.max(0, getPrice() - discountAmount);

  if (loading) return <div className="text-gray-500">Loading marketplace...</div>;

  return (
    <div className="relative">
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-white">Marketplace</h3>
        <p className="text-gray-400 mt-2">Premium tools to boost your productivity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {softwareList.map(sw => {
          const isSubscribed = subscribedIds.has(sw.id);
          
          return (
            <div key={sw.id} className={`bg-[#050505] rounded-2xl border ${isSubscribed ? 'border-green-500/30' : 'border-white/10'} overflow-hidden hover:border-cyan-500/50 transition-all flex flex-col group`}>
              <div className="h-48 bg-gray-900 relative">
                 <img src={sw.imageUrl} alt={sw.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute top-4 right-4 flex gap-2">
                   <span className="bg-black/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-gray-300 uppercase border border-white/10">
                     {sw.platform}
                   </span>
                   {isSubscribed ? (
                       <span className="bg-green-600/90 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white uppercase border border-green-500/50 shadow-lg shadow-green-900/50">
                         INSTALLED
                       </span>
                   ) : (
                       <span className="bg-black/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-cyan-400 uppercase border border-white/10">
                         {sw.category}
                       </span>
                   )}
                 </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                   <h4 className="text-xl font-bold text-white">{sw.name}</h4>
                   <span className="bg-white/5 text-gray-300 text-xs px-2 py-1 rounded border border-white/10">v{sw.version}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">{sw.description}</p>
                
                <div className="mb-4 pt-4 border-t border-white/5">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Requirements</p>
                  <p className="text-xs text-gray-400 truncate">{sw.requirements || 'Standard System'}</p>
                </div>

                <div className="mt-auto">
                   <div className="flex items-baseline mb-4">
                      <span className="text-2xl font-bold text-white">₹{sw.priceMonthly.toLocaleString('en-IN')}</span>
                      <span className="text-gray-500 text-sm ml-1">/mo</span>
                   </div>
                   
                   {isSubscribed ? (
                        <Button onClick={() => handleDownload(sw)} disabled={downloadState.active} className="w-full bg-green-600 hover:bg-green-500 border-0 font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download Package
                        </Button>
                   ) : (
                        <Button onClick={() => setSelectedSoftware(sw)} className="w-full bg-cyan-600 hover:bg-cyan-500 border-0 font-bold">
                            Subscribe Now
                        </Button>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Download Manager Toast */}
      {downloadState.active && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom fade-in duration-300">
            <div className="bg-[#111827] border border-cyan-500/30 rounded-lg shadow-2xl p-4 w-80">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-white font-bold text-sm truncate pr-2">{downloadState.fileName}</h4>
                    <span className="text-xs text-cyan-400 font-mono">{Math.round(downloadState.progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${downloadState.progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        {downloadState.progress === 100 && (
                            <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        )}
                        <span>{downloadState.speed}</span>
                    </div>
                    <span>{downloadState.progress >= 100 ? 'Secure' : 'Downloading...'}</span>
                </div>
            </div>
        </div>
      )}

      {selectedSoftware && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0a0a0a] rounded-xl border border-white/10 max-w-4xl w-full shadow-2xl flex flex-col md:flex-row overflow-hidden my-8">
            
            {/* Left Column: Order Details */}
            <div className="md:w-1/2 p-6 md:p-8 bg-[#111] border-r border-white/10">
                <h3 className="text-xl font-bold mb-1 text-white">Order Summary</h3>
                <p className="text-sm text-gray-400 mb-6">Review your subscription details</p>
                
                <div className="flex items-center gap-4 mb-6">
                    <img src={selectedSoftware.imageUrl} className="w-16 h-16 rounded-lg object-cover bg-gray-800" />
                    <div>
                        <h4 className="font-bold text-white">{selectedSoftware.name}</h4>
                        <p className="text-xs text-gray-500">v{selectedSoftware.version} • {selectedSoftware.platform}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Billing Cycle</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                        onClick={() => setSelectedPlan(PlanType.MONTHLY)}
                        className={`p-3 border rounded-lg text-center transition-all ${selectedPlan === PlanType.MONTHLY ? 'border-cyan-500 bg-cyan-900/20 text-white' : 'border-white/10 bg-[#050505] text-gray-400 hover:bg-white/5'}`}
                        >
                        <div className="font-bold">Monthly</div>
                        <div className="text-sm opacity-70">₹{selectedSoftware.priceMonthly}/mo</div>
                        </button>
                        <button 
                        onClick={() => setSelectedPlan(PlanType.YEARLY)}
                        className={`p-3 border rounded-lg text-center transition-all ${selectedPlan === PlanType.YEARLY ? 'border-cyan-500 bg-cyan-900/20 text-white' : 'border-white/10 bg-[#050505] text-gray-400 hover:bg-white/5'}`}
                        >
                        <div className="font-bold">Yearly</div>
                        <div className="text-sm opacity-70">₹{selectedSoftware.priceYearly}/yr</div>
                        </button>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 space-y-3">
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>Subtotal</span>
                        <span>₹{getPrice().toLocaleString('en-IN')}</span>
                    </div>
                    {discountAmount > 0 && (
                         <div className="flex justify-between text-green-400 text-sm font-medium">
                            <span>Gift Card / Discount</span>
                            <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                        <span>Total Pay</span>
                        <span>₹{finalPrice.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Payment */}
            <div className="md:w-1/2 p-6 md:p-8 bg-[#0a0a0a] flex flex-col">
                <h3 className="text-xl font-bold mb-1 text-white">Payment</h3>
                <p className="text-sm text-gray-400 mb-6">Secure checkout via Paytm</p>

                {/* Gift Card Input */}
                <div className="mb-6">
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Have a Gift Card?</label>
                     <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Enter Code (e.g. SUMMER25)"
                            value={giftCode}
                            onChange={(e) => setGiftCode(e.target.value)}
                            className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none uppercase"
                        />
                        <button onClick={handleApplyGiftCard} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors">Apply</button>
                     </div>
                     {giftMessage && (
                         <p className={`text-xs mt-2 font-medium ${giftMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                             {giftMessage.text}
                         </p>
                     )}
                </div>

                {finalPrice > 0 ? (
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pay with Paytm</label>
                        
                        <div className="bg-[#1a1a1a] border border-cyan-900/30 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="w-full" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Paytm Wallet / UPI</p>
                                    <p className="text-xs text-gray-500">Fast & Secure Payments</p>
                                </div>
                            </div>
                            
                            {/* QR Code Simulation */}
                            <div className="flex justify-center mb-4 bg-white/5 p-4 rounded-lg">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=rstechlab@paytm&pn=RSTECHLAB&am=${finalPrice}&cu=INR`} alt="QR Code" className="w-32 h-32 rounded border border-white" />
                            </div>
                            <p className="text-center text-[10px] text-gray-500 mb-4">Scan QR with Paytm App</p>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                   <span className="text-gray-500 text-sm">@</span>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Enter your UPI ID / Mobile"
                                    value={paytmUpiId}
                                    onChange={(e) => setPaytmUpiId(e.target.value)}
                                    className="w-full bg-black border border-white/20 rounded-lg pl-8 pr-4 py-3 text-white text-sm focus:border-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-green-900/10 rounded-xl border border-green-900/30 mb-4">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-2">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h4 className="text-green-400 font-bold">100% Covered!</h4>
                        <p className="text-xs text-green-200/70 mt-1">No additional payment required.</p>
                    </div>
                )}

                <div className="flex gap-3 mt-auto">
                    <Button onClick={confirmPurchase} isLoading={isProcessing} className="flex-1 bg-cyan-600 hover:bg-cyan-500 border-0 py-3 shadow-lg shadow-cyan-900/30">
                        {isProcessing ? 'Processing...' : `Pay ₹${finalPrice.toLocaleString('en-IN')}`}
                    </Button>
                    <button onClick={() => setSelectedSoftware(null)} className="px-4 py-2 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 font-bold text-sm">
                        Cancel
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClientDashboard;
