
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { ElectronicsItem, User, CartItem } from '../types';
import { getElectronics, getCart, addToCart, updateCartQuantity, removeFromCart, clearCart, createOrder, getCurrentUser } from '../services/mockBackend';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Copy, Share2, Check } from 'lucide-react';

interface PageProps {
  user?: User | null;
  onLogout?: () => void;
}

const Electronics: React.FC<PageProps> = ({ user: propUser, onLogout }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productIdFromUrl = searchParams.get('id');
  const [user, setUser] = useState<User | null>(propUser || null);

  const [products, setProducts] = useState<ElectronicsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PAYTM' | 'CARD'>('PAYTM');
  const [paytmUpiId, setPaytmUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });

  useEffect(() => {
    // Ensure we have current user for order
    const u = getCurrentUser();
    setUser(u);

    const fetchData = async () => {
        const [elData, cartData] = await Promise.all([
            getElectronics(),
            getCart()
        ]);
        setProducts(elData);
        setCartItems(cartData);
        setLoading(false);
    };
    fetchData();

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'sh_electronics') {
            fetchData();
        }
    };

    const handleCustomUpdate = () => {
        fetchData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('electronics-updated', handleCustomUpdate);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('electronics-updated', handleCustomUpdate);
    };
  }, []);

  const handleAddToCart = async (item: ElectronicsItem) => {
      if (!user) {
          alert("Please login to add items to the cart.");
          navigate('/login');
          return;
      }
      const updatedCart = await addToCart(item);
      setCartItems(updatedCart);
      setIsCartOpen(true); // Open drawer on add
  };

  const handleUpdateQty = async (itemId: string, newQty: number) => {
      const updatedCart = await updateCartQuantity(itemId, newQty);
      setCartItems(updatedCart);
  };

  const handleRemove = async (itemId: string) => {
      const updatedCart = await removeFromCart(itemId);
      setCartItems(updatedCart);
  };

  const openCheckout = () => {
      if (!user) {
          alert("Please login to complete your purchase.");
          navigate('/login');
          return;
      }
      setIsCartOpen(false);
      setIsCheckoutModalOpen(true);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleConfirmOrder = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      if (!shippingAddress) {
          alert("Please enter a shipping address.");
          return;
      }
      if (paymentMethod === 'PAYTM' && !paytmUpiId) {
          alert("Please enter your UPI ID.");
          return;
      }
      if (paymentMethod === 'CARD' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc)) {
          alert("Please complete card details.");
          return;
      }

      setIsProcessing(true);
      try {
          // Simulate Payment processing
          await createOrder(user.id, user.email, cartItems, cartTotal, paymentMethod, shippingAddress);
          setCartItems([]);
          setIsCheckoutModalOpen(false);
          alert("Order placed successfully! You can track it in your dashboard.");
      } catch (error) {
          alert("Failed to place order.");
      } finally {
          setIsProcessing(false);
      }
  };

  const filteredProducts = products.filter(product => {
    if (productIdFromUrl) {
      return product.id === productIdFromUrl;
    }
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/electronics?id=${id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShare = async (product: ElectronicsItem) => {
    const link = `${window.location.origin}/electronics?id=${product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on RSTechLab Electronics Hub!`,
          url: link,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink(product.id);
    }
  };

  return (
    <div className="bg-[#0B1121] min-h-screen font-sans text-white relative overflow-hidden">
      <Navbar user={user} onLogout={onLogout} />
      
      {/* Floating Cart Button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-full shadow-lg shadow-cyan-900/50 transition-transform hover:scale-110 flex items-center justify-center group"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#0B1121]">
                {cartCount}
            </span>
        )}
      </button>

      {/* Cart Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Cart Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#111827] border-l border-white/10 shadow-2xl transform transition-transform duration-300 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f1623]">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                 Shopping Cart <span className="text-sm font-normal text-gray-400">({cartCount})</span>
             </h2>
             <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white p-2">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
             {cartItems.length === 0 ? (
                 <div className="text-center py-10 flex flex-col items-center">
                     <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                     </div>
                     <p className="text-gray-400 font-medium">Your cart is empty.</p>
                     <p className="text-sm text-gray-600 mt-1">Start adding some cool tech!</p>
                     <button onClick={() => setIsCartOpen(false)} className="mt-6 text-cyan-400 text-sm font-bold hover:underline">Continue Shopping</button>
                 </div>
             ) : (
                 cartItems.map(item => (
                     <div key={item.id} className="flex gap-4">
                         <div className="w-20 h-20 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden border border-white/10">
                             <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 flex flex-col justify-between">
                             <div>
                                 <h4 className="font-bold text-white text-sm line-clamp-2">{item.name}</h4>
                                 <p className="text-xs text-gray-500 mt-1">₹{item.price.toFixed(2)} each</p>
                             </div>
                             <div className="flex justify-between items-end">
                                 <div className="flex items-center gap-3 bg-white/5 rounded-lg px-2 py-1 border border-white/10">
                                     <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} className="text-gray-400 hover:text-white px-1">-</button>
                                     <span className="text-sm font-mono text-white w-4 text-center">{item.quantity}</span>
                                     <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)} className="text-gray-400 hover:text-white px-1">+</button>
                                 </div>
                                 <div className="text-right">
                                     <p className="font-bold text-cyan-400">₹{(item.price * item.quantity).toFixed(2)}</p>
                                     <button onClick={() => handleRemove(item.id)} className="text-[10px] text-red-400 hover:text-red-300 hover:underline mt-1">Remove</button>
                                 </div>
                             </div>
                         </div>
                     </div>
                 ))
             )}
         </div>

         {cartItems.length > 0 && (
             <div className="p-6 border-t border-white/10 bg-[#0f1623]">
                 <div className="space-y-2 mb-4">
                     <div className="flex justify-between text-gray-400 text-sm">
                         <span>Subtotal</span>
                         <span>₹{cartTotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                         <span>Total</span>
                         <span>₹{cartTotal.toFixed(2)}</span>
                     </div>
                 </div>
                 <Button 
                    onClick={openCheckout} 
                    className="w-full bg-cyan-600 hover:bg-cyan-500 border-0 py-3 shadow-lg shadow-cyan-900/20"
                 >
                     Proceed to Checkout
                 </Button>
             </div>
         )}
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
           <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-black/90 transition-opacity backdrop-blur-sm" onClick={() => setIsCheckoutModalOpen(false)}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
              
              <div className="inline-block align-bottom bg-[#0a0a0a] border border-white/10 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                 <div className="px-6 py-6 border-b border-white/10 bg-[#111827] flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Secure Checkout</h3>
                    <button onClick={() => setIsCheckoutModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                 </div>

                 <form onSubmit={handleConfirmOrder} className="px-6 py-6 space-y-6">
                    {/* Shipping Address */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Shipping Address</label>
                        <textarea 
                            required 
                            rows={3} 
                            value={shippingAddress} 
                            onChange={e => setShippingAddress(e.target.value)}
                            placeholder="Street, City, Zip Code"
                            className="w-full bg-[#1F2937] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none resize-none"
                        ></textarea>
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Payment Method</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => setPaymentMethod('PAYTM')} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'PAYTM' ? 'bg-cyan-900/20 border-cyan-500 text-white' : 'bg-[#1F2937] border-white/5 text-gray-400'}`}>
                                <div className="font-bold">Paytm / UPI</div>
                            </button>
                            <button type="button" onClick={() => setPaymentMethod('CARD')} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'CARD' ? 'bg-cyan-900/20 border-cyan-500 text-white' : 'bg-[#1F2937] border-white/5 text-gray-400'}`}>
                                <div className="font-bold">Credit Card</div>
                            </button>
                        </div>
                    </div>

                    {/* Conditional Payment Fields */}
                    <div className="bg-[#111] p-4 rounded-xl border border-white/10">
                        {paymentMethod === 'PAYTM' ? (
                            <div className="space-y-4">
                                <div className="flex justify-center bg-white p-2 rounded w-fit mx-auto">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=rstechlab@paytm&am=${cartTotal}&cu=INR`} alt="QR Code" className="w-24 h-24" />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">@</span>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Enter UPI ID"
                                        value={paytmUpiId}
                                        onChange={e => setPaytmUpiId(e.target.value)}
                                        className="w-full bg-black border border-white/20 rounded-lg pl-8 pr-4 py-3 text-white text-sm focus:border-cyan-500 outline-none"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Card Number"
                                    value={cardDetails.number}
                                    onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                                    className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY"
                                        value={cardDetails.expiry}
                                        onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                                        className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="CVC"
                                        value={cardDetails.cvc}
                                        onChange={e => setCardDetails({...cardDetails, cvc: e.target.value})}
                                        className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:border-cyan-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                        <div>
                            <p className="text-gray-400 text-sm">Total to Pay</p>
                            <p className="text-2xl font-bold text-white">₹{cartTotal.toFixed(2)}</p>
                        </div>
                        <Button type="submit" isLoading={isProcessing} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 border-0 shadow-lg shadow-cyan-900/20">
                            Confirm Order
                        </Button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Product List Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
           <div>
              <h1 className="text-4xl font-bold text-white mb-2">Electronics Hub <span className="text-cyan-500">.</span></h1>
              <p className="text-gray-400">High-quality components for hardware enthusiasts.</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                  <input 
                    type="text" 
                    placeholder="Search components..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#111827] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#111827] text-white border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
              >
                 <option>All Categories</option>
                 <option>Development</option>
                 <option>Sensors</option>
                 <option>Robotics</option>
                 <option>Boards</option>
                 <option>Components</option>
                 <option>Microcontrollers</option>
              </select>
           </div>
        </div>

        {loading ? (
            <div className="text-center py-20 bg-[#050505] rounded-xl border border-white/10">
                 <p className="text-gray-500">Loading components...</p>
            </div>
        ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#050505] rounded-xl border border-white/10">
                 <p className="text-gray-500">
                   {productIdFromUrl ? "Product not found." : "No products found matching your search."}
                 </p>
                 <button 
                   onClick={() => { setSearchTerm(''); setSelectedCategory('All Categories'); if(productIdFromUrl) navigate('/electronics'); }} 
                   className="mt-4 text-cyan-400 text-sm font-bold hover:underline"
                 >
                   Clear Filters
                 </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
                <div key={product.id} className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all group flex flex-col">
                    <div className="h-64 bg-gray-900 relative overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent"></div>
                        
                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                           <button 
                              onClick={(e) => { e.preventDefault(); handleCopyLink(product.id); }}
                              className="p-2 bg-black/60 backdrop-blur-md rounded-full text-gray-400 hover:text-white hover:bg-cyan-600 transition-colors border border-white/10"
                              title="Copy Link"
                           >
                              {copiedId === product.id ? <Check size={14} /> : <Copy size={14} />}
                           </button>
                           <button 
                              onClick={(e) => { e.preventDefault(); handleShare(product); }}
                              className="p-2 bg-black/60 backdrop-blur-md rounded-full text-gray-400 hover:text-white hover:bg-cyan-600 transition-colors border border-white/10"
                              title="Share"
                           >
                              <Share2 size={14} />
                           </button>
                        </div>

                        <span className="absolute top-3 left-3 bg-cyan-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider border border-white/10">
                        {product.category}
                        </span>
                        {product.stock <= 5 && product.stock > 0 && (
                            <span className="absolute bottom-3 right-3 bg-orange-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider border border-white/10">
                                Low Stock
                            </span>
                        )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-1">{product.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                            <span className="text-xl font-bold text-cyan-400">₹{product.price.toFixed(2)}</span>
                            {product.stock > 0 ? (
                                <button 
                                    onClick={() => handleAddToCart(product)}
                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-cyan-600 hover:text-white hover:border-cyan-500 transition-colors text-gray-300 text-sm font-medium flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    Add to Cart
                                </button>
                            ) : (
                                <span className="text-red-400 text-sm font-bold bg-red-900/20 px-3 py-1.5 rounded border border-red-900/30">Out of Stock</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Electronics;
