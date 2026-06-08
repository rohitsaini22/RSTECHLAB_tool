import React, { useEffect, useState } from 'react';
import { getOrders, processRefund } from '../../services/mockBackend';
import { Order, RefundStatus } from '../../types';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const MoneyManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    // Filter for cancelled orders or orders with refund status
    const refundOrders = data.filter(o => o.status === 'CANCELLED' || o.refundStatus === 'PENDING' || o.refundStatus === 'COMPLETED');
    setOrders(refundOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  };

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleProcessRefund = async (orderId: string) => {
    if (window.confirm('Are you sure you want to release this refund?')) {
        setProcessingId(orderId);
        try {
            const success = await processRefund(orderId);
            if (success) {
                await fetchOrders();
            } else {
                alert("Order not found or could not be refunded.");
            }
        } catch (error) {
            console.error("Error processing refund:", error);
            alert("Failed to process refund. Please try again.");
        } finally {
            setProcessingId(null);
        }
    }
  };

  const getStatusBadge = (order: Order) => {
      if (order.refundStatus === 'COMPLETED') {
          return <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-full text-xs border border-green-400/20"><CheckCircle size={12} /> Refunded</span>;
      }
      if (order.refundStatus === 'PENDING' || (order.status === 'CANCELLED' && order.refundStatus !== 'COMPLETED')) {
          return <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full text-xs border border-yellow-400/20"><Clock size={12} /> Pending</span>;
      }
      return <span className="text-gray-500 text-xs">None</span>;
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Money Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111] p-6 rounded-xl border border-white/10">
              <h4 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Pending Refunds</h4>
              <div className="text-3xl font-bold text-white">
                  ₹{orders.filter(o => o.refundStatus === 'PENDING' || (o.status === 'CANCELLED' && o.refundStatus !== 'COMPLETED')).reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)}
              </div>
              <div className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> {orders.filter(o => o.refundStatus === 'PENDING' || (o.status === 'CANCELLED' && o.refundStatus !== 'COMPLETED')).length} orders waiting
              </div>
          </div>
          <div className="bg-[#111] p-6 rounded-xl border border-white/10">
              <h4 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Refunded</h4>
              <div className="text-3xl font-bold text-white">
                  ₹{orders.filter(o => o.refundStatus === 'COMPLETED').reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)}
              </div>
              <div className="text-xs text-green-500 mt-2 flex items-center gap-1">
                  <CheckCircle size={12} /> {orders.filter(o => o.refundStatus === 'COMPLETED').length} orders completed
              </div>
          </div>
      </div>

      <div className="bg-[#050505] shadow-lg rounded-xl border border-white/10 overflow-hidden">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Method</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Refund Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No refund requests found.</td>
                </tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                    #{order.id.substring(0,8)}
                    <span className="block text-xs opacity-50">{new Date(order.date).toLocaleDateString()}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm font-bold text-white">{order.userEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                    ₹{order.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {order.paymentMethod}
                    <span className="block text-xs opacity-50">{order.paymentId}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   {(order.refundStatus === 'PENDING' || (order.status === 'CANCELLED' && order.refundStatus !== 'COMPLETED')) && (
                       <button 
                         onClick={() => handleProcessRefund(order.id)}
                         disabled={processingId === order.id}
                         className={`px-3 py-1 text-xs font-bold rounded-md transition-colors shadow-lg ${processingId === order.id ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 shadow-green-900/20'} text-white`}
                       >
                           {processingId === order.id ? 'Processing...' : 'Release Refund'}
                       </button>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MoneyManagement;
