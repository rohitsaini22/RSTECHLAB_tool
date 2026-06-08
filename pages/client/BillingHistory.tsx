
import React, { useEffect, useState } from 'react';
import { Subscription, Software, Order } from '../../types';
import { getCurrentUser, getUserSubscriptions, getUserOrders } from '../../services/mockBackend';
import { Button } from '../../components/Button';

const BillingHistory: React.FC = () => {
  const [history, setHistory] = useState<(Subscription & { software: Software })[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SUBSCRIPTIONS' | 'ORDERS'>('SUBSCRIPTIONS');

  useEffect(() => {
    const fetchData = async () => {
      const user = getCurrentUser();
      if (user) {
        const [subs, ords] = await Promise.all([
             getUserSubscriptions(user.id),
             getUserOrders(user.id)
        ]);
        
        setHistory(subs.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
        setOrders(ords);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const downloadInvoice = (id: string) => {
    alert(`Downloading Invoice #${id.toUpperCase()}...`);
  };

  if (loading) return <div>Loading history...</div>;

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Order History</h3>

      <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setActiveTab('SUBSCRIPTIONS')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'SUBSCRIPTIONS' ? 'bg-cyan-600 text-white' : 'bg-[#111] text-gray-400 hover:bg-[#222]'}`}
          >
              Software Subscriptions
          </button>
          <button 
            onClick={() => setActiveTab('ORDERS')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'ORDERS' ? 'bg-cyan-600 text-white' : 'bg-[#111] text-gray-400 hover:bg-[#222]'}`}
          >
              Physical Orders
          </button>
      </div>

      <div className="bg-[#050505] shadow-lg rounded-xl border border-white/10 overflow-hidden">
        {activeTab === 'SUBSCRIPTIONS' ? (
            history.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No subscription history available.</div>
            ) : (
                <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                        <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {history.map((sub) => (
                        <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {new Date(sub.startDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-white">{sub.software.name}</div>
                                <div className="text-xs text-gray-500">ID: {sub.id.substring(0,8)}...</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                <span className="capitalize">{sub.plan.toLowerCase()}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                                ₹{sub.amountPaid.toLocaleString('en-IN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${sub.status === 'ACTIVE' ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-gray-800 text-gray-400'}`}>
                                {sub.status === 'ACTIVE' ? 'Paid' : sub.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                    onClick={() => downloadInvoice(sub.id)}
                                    className="text-cyan-400 hover:text-cyan-300 flex items-center justify-end w-full gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    PDF
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            )
        ) : (
            orders.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No physical orders found.</div>
            ) : (
                <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                        <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-cyan-400">
                                #{order.id.substring(0,8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-white">{order.items.length} items</div>
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                    {order.items.map(i => i.name).join(', ')}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                                ₹{order.totalAmount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full 
                                    ${order.status === 'PENDING' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-900/50' : 
                                      order.status === 'SHIPPED' ? 'bg-purple-900/20 text-purple-400 border border-purple-900/50' : 
                                      order.status === 'DELIVERED' ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-gray-800 text-gray-400'}`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                                {new Date(order.date).toLocaleDateString()}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            )
        )}
      </div>
    </div>
  );
};

export default BillingHistory;
