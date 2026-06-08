
import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Software, User, UserRole } from '../types';
import { getSoftware } from '../services/mockBackend';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Copy, Share2, Check } from 'lucide-react';

interface PageProps {
  user?: User | null;
  onLogout?: () => void;
}

const Products: React.FC<PageProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productIdFromUrl = searchParams.get('id');
  const [softwareList, setSoftwareList] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    getSoftware().then(data => {
      setSoftwareList(data);
      setLoading(false);
    });
  }, []);

  const filteredSoftware = softwareList.filter(sw => {
    if (productIdFromUrl) {
      return sw.id === productIdFromUrl;
    }
    return (
      sw.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sw.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sw.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getDashboardLink = () => {
      if (!user) return '/login';
      return user.role === UserRole.ADMIN ? '/admin/software' : '/client/marketplace';
  };

  const getButtonText = () => {
      if (!user) return 'Get License Key';
      return user.role === UserRole.ADMIN ? 'Manage Software' : 'View in Dashboard';
  };

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/products?id=${id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShare = async (product: Software) => {
    const link = `${window.location.origin}/products?id=${product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on RSTechLab!`,
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
    <div className="bg-[#0B1121] min-h-screen font-sans flex flex-col text-white">
      <Navbar user={user} onLogout={onLogout} />

      {/* Hero Section */}
      <div className="relative py-24 overflow-hidden border-b border-gray-800">
         <div className="absolute inset-0 z-0">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                  Premium Software Suite
               </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
               Explore our catalog of enterprise-grade tools designed to accelerate development, enhance security, and power your creativity.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
                <input 
                    type="text" 
                    placeholder="Search software (e.g., 'security', 'design')..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#111827]/80 backdrop-blur-sm border border-gray-700 rounded-full py-4 pl-12 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xl transition-all"
                />
                <svg className="absolute left-4 top-4 w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
         </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-20">
         {loading ? (
             <div className="text-center py-20 bg-[#111827] rounded-2xl border border-gray-800">
                 <p className="text-gray-500 text-lg">Loading software catalog...</p>
             </div>
         ) : filteredSoftware.length === 0 ? (
            <div className="text-center py-20">
                 <p className="text-gray-400 text-lg">
                   {productIdFromUrl ? "Product not found." : `No software found matching "${searchTerm}".`}
                 </p>
                 <button 
                   onClick={() => { setSearchTerm(''); if(productIdFromUrl) navigate('/products'); }} 
                   className="mt-4 text-blue-400 hover:text-blue-300 font-bold"
                 >
                   Show All
                 </button>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredSoftware.map(sw => (
                  <div key={sw.id} className="bg-[#111827] rounded-2xl border border-gray-800 overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 flex flex-col group">
                     <div className="h-56 bg-gray-900 relative overflow-hidden">
                        <img src={sw.imageUrl} alt={sw.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent"></div>
                        
                        {/* Action Buttons */}
                        <div className="absolute top-4 left-4 flex gap-2 z-10">
                           <button 
                              onClick={(e) => { e.preventDefault(); handleCopyLink(sw.id); }}
                              className="p-2 bg-gray-900/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-white hover:bg-blue-600 transition-colors border border-gray-700"
                              title="Copy Link"
                           >
                              {copiedId === sw.id ? <Check size={14} /> : <Copy size={14} />}
                           </button>
                           <button 
                              onClick={(e) => { e.preventDefault(); handleShare(sw); }}
                              className="p-2 bg-gray-900/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-white hover:bg-blue-600 transition-colors border border-gray-700"
                              title="Share"
                           >
                              <Share2 size={14} />
                           </button>
                        </div>

                        <span className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-400 uppercase tracking-wide border border-gray-700">
                           {sw.category}
                        </span>
                     </div>
                     
                     <div className="p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                           <h3 className="text-2xl font-bold text-white leading-tight">{sw.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-6">
                           <span className="bg-blue-900/30 text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-blue-800/50">v{sw.version}</span>
                           <span className="text-gray-600 text-xs">•</span>
                           <span className="text-gray-500 text-xs">Instant Delivery</span>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed flex-1">
                           {sw.description}
                        </p>
                        
                        <div className="mt-auto pt-6 border-t border-gray-800">
                           <div className="flex items-end gap-1 mb-6">
                              <span className="text-3xl font-bold text-white">₹{sw.priceMonthly}</span>
                              <span className="text-gray-500 text-sm mb-1">/month</span>
                           </div>
                           
                           {/* Conditional Button based on Auth state */}
                           <Link to={getDashboardLink()} className="block">
                                <Button className="w-full py-3 text-base bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 border-0">
                                    {getButtonText()}
                                </Button>
                           </Link>
                           
                           <p className="text-center text-xs text-gray-600 mt-3">
                              Includes 30-day money-back guarantee
                           </p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

      {/* Bottom CTA */}
      <div className="py-20 border-t border-gray-800 bg-[#0f1623]">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Need a custom enterprise license?</h2>
            <p className="text-gray-400 mb-8">
               We offer volume discounts and dedicated support for large organizations. Contact our sales team to discuss your specific requirements.
            </p>
            <Link to="/contact">
               <button className="px-8 py-3 text-lg border border-gray-600 text-gray-300 hover:text-white hover:border-white rounded-md transition-colors font-medium">
                  Contact Sales Team
               </button>
            </Link>
         </div>
      </div>
      
      <footer className="bg-[#050911] border-t border-white/10 pt-20 pb-10 mt-auto">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
               <div className="col-span-1 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-6">
                     <span className="text-cyan-500 font-bold text-lg">{'< >'}</span>
                     <span className="text-xl font-bold text-white tracking-wide uppercase">RSTECHLAB</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                     Empowering the next generation of builders with premium software and hardware.
                  </p>
               </div>

               <div>
                  <h4 className="text-white font-bold mb-6">Platform</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                     <li><Link to="/products" className="hover:text-white transition-colors">Software Marketplace</Link></li>
                     <li><Link to="/electronics" className="hover:text-white transition-colors">Electronics Hub</Link></li>
                     <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold mb-6">Company</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                     <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                     <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                     <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold mb-6">Stay Updated</h4>
                  <div className="flex">
                     <input 
                        type="email" 
                        placeholder="Email address" 
                        className="bg-[#111] text-white text-sm px-4 py-3 rounded-l-lg border border-white/10 focus:outline-none focus:border-cyan-500 w-full"
                     />
                     <button className="bg-cyan-600 px-4 rounded-r-lg hover:bg-cyan-500 transition-colors text-white">
                        →
                     </button>
                  </div>
               </div>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-gray-600 text-sm">© 2025 RSTECHLAB. All rights reserved.</p>
               <div className="flex gap-6 text-sm text-gray-600">
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Products;
