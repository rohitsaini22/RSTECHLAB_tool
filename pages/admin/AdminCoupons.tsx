
import React, { useEffect, useState } from 'react';
import { Coupon, Software, ElectronicsItem } from '../../types';
import { getCoupons, addCoupon, deleteCoupon, getSoftware, getElectronics } from '../../services/mockBackend';
import { Button } from '../../components/Button';

const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [value, setValue] = useState(10);
  const [targetType, setTargetType] = useState<'ALL' | 'SOFTWARE' | 'ELECTRONICS'>('ALL');
  const [targetId, setTargetId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');

  // Dropdown data
  const [softwareList, setSoftwareList] = useState<Software[]>([]);
  const [electronicsList, setElectronicsList] = useState<ElectronicsItem[]>([]);

  useEffect(() => {
    fetchData();

    const handleUpdate = () => fetchData();
    window.addEventListener('coupons-updated', handleUpdate);
    return () => window.removeEventListener('coupons-updated', handleUpdate);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [c, sw, el] = await Promise.all([getCoupons(), getSoftware(), getElectronics()]);
    setCoupons(c);
    setSoftwareList(sw);
    setElectronicsList(el);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this coupon?")) {
        setDeletingId(id);
        try {
            // Optimistic update
            setCoupons(prev => prev.filter(item => item.id !== id));
            await deleteCoupon(id);
        } catch (error) {
            console.error("Failed to delete coupon:", error);
            alert("Failed to delete coupon. Please try again.");
            await fetchData();
        } finally {
            setDeletingId(null);
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await addCoupon({
        code: code.toUpperCase(),
        discountType,
        value: Number(value),
        targetType,
        targetId: targetId || undefined,
        expiryDate: expiryDate || undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined
    });

    setLoading(false);
    setIsModalOpen(false);
    resetForm();
    fetchData();
  };

  const resetForm = () => {
      setCode('');
      setDiscountType('PERCENTAGE');
      setValue(10);
      setTargetType('ALL');
      setTargetId('');
      setExpiryDate('');
      setUsageLimit('');
  };

  const getTargetName = (c: Coupon) => {
      if (c.targetType === 'ALL') return 'Store-wide';
      if (!c.targetId) return `All ${c.targetType}`; // e.g. All Software
      
      if (c.targetType === 'SOFTWARE') {
          const sw = softwareList.find(s => s.id === c.targetId);
          return sw ? `Software: ${sw.name}` : 'Unknown Software';
      }
      if (c.targetType === 'ELECTRONICS') {
          const el = electronicsList.find(e => e.id === c.targetId);
          return el ? `Electronics: ${el.name}` : 'Unknown Item';
      }
      return 'Specific Item';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Coupons & Gift Cards</h3>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-cyan-600 hover:bg-cyan-500">
            + Create Coupon
        </Button>
      </div>

      <div className="bg-[#050505] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Code</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Applies To</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Expiry</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-2">
                       <span className="font-mono font-bold text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded border border-cyan-900/50">{c.code}</span>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">
                    {c.discountType === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {getTargetName(c)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : ' / ∞'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleDelete(c.id)} 
                    disabled={deletingId === c.id}
                    className={`${deletingId === c.id ? 'text-gray-500 cursor-not-allowed' : 'text-red-400 hover:text-red-300'} font-bold bg-red-900/10 px-3 py-1.5 rounded border border-red-900/30`}
                  >
                    {deletingId === c.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
             {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No coupons active.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

       {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/90 transition-opacity backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-[#0F172A] border border-white/10 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              
              <div className="px-6 py-6 border-b border-white/10 bg-[#111827]">
                  <h3 className="text-xl font-bold text-white">Create New Coupon</h3>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Coupon Code</label>
                    <input type="text" required value={code} onChange={e => setCode(e.target.value)} className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-cyan-500 outline-none uppercase" placeholder="e.g. SUMMER25" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Discount Type</label>
                        <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-cyan-500 outline-none">
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount (₹)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Value</label>
                        <input type="number" required min="1" value={value} onChange={e => setValue(Number(e.target.value))} className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-cyan-500 outline-none" />
                    </div>
                </div>

                <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Applies To</label>
                     <select value={targetType} onChange={e => { setTargetType(e.target.value as any); setTargetId(''); }} className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-cyan-500 outline-none mb-2">
                        <option value="ALL">Entire Store</option>
                        <option value="SOFTWARE">Software Products</option>
                        <option value="ELECTRONICS">Electronics</option>
                     </select>
                     
                     {/* Dynamic Secondary Dropdown */}
                     {targetType === 'SOFTWARE' && (
                         <select value={targetId} onChange={e => setTargetId(e.target.value)} className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-cyan-500 outline-none animate-in fade-in slide-in-from-top-2">
                             <option value="">All Software</option>
                             {softwareList.map(sw => <option key={sw.id} value={sw.id}>{sw.name}</option>)}
                         </select>
                     )}
                     {targetType === 'ELECTRONICS' && (
                         <select value={targetId} onChange={e => setTargetId(e.target.value)} className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-cyan-500 outline-none animate-in fade-in slide-in-from-top-2">
                             <option value="">All Electronics</option>
                             {electronicsList.map(el => <option key={el.id} value={el.id}>{el.name}</option>)}
                         </select>
                     )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Expiry Date (Optional)</label>
                        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Usage Limit (Optional)</label>
                        <input type="number" min="1" value={usageLimit} onChange={e => setUsageLimit(Number(e.target.value))} className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-cyan-500 outline-none" placeholder="Unlimited" />
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-500 border-0" isLoading={loading}>
                      Create Coupon
                  </Button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 border border-white/10 font-bold transition-colors">
                      Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
