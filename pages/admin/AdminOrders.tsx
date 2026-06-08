
import React, { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, processRefund } from '../../services/mockBackend';
import { Order, OrderStatus, RefundStatus } from '../../types';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    // Sort by date desc
    setOrders(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    fetchOrders(); // Refresh list
  };

  const [processingRefundId, setProcessingRefundId] = useState<string | null>(null);

  const handleProcessRefund = async (orderId: string) => {
    if (window.confirm('Are you sure you want to release this refund?')) {
        setProcessingRefundId(orderId);
        try {
            const success = await processRefund(orderId);
            if (success) {
                await fetchOrders();
            } else {
                alert("Order not found or could not be refunded.");
            }
        } catch (error) {
            console.error("Error processing refund:", error);
            alert("Failed to process refund.");
        } finally {
            setProcessingRefundId(null);
        }
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'PROCESSING': return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'SHIPPED': return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
      case 'DELIVERED': return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'CANCELLED': return 'bg-red-500/20 text-red-500 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getRefundStatusBadge = (order: Order) => {
      if (order.refundStatus === 'COMPLETED') {
          return <span className="flex items-center gap-1 text-green-400 text-[10px] uppercase tracking-wider"><CheckCircle size={10} /> Refunded</span>;
      }
      if (order.refundStatus === 'PENDING' || (order.status === 'CANCELLED' && order.refundStatus !== 'COMPLETED')) {
          return <span className="flex items-center gap-1 text-yellow-400 text-[10px] uppercase tracking-wider"><Clock size={10} /> Refund Pending</span>;
      }
      return null;
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Order Management</h3>

      <div className="bg-[#050505] shadow-lg rounded-xl border border-white/10 overflow-hidden">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Items</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Total</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                </tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                    #{order.id.substring(0,8)}
                    <span className="block text-xs opacity-50">{new Date(order.date).toLocaleDateString()}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm font-bold text-white">{order.userEmail}</div>
                   <div className="text-xs text-gray-500 truncate max-w-[150px]" title={order.shippingAddress}>{order.shippingAddress}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex -space-x-2">
                      {order.items.slice(0,3).map((item, idx) => (
                          <img key={idx} className="w-8 h-8 rounded-full border border-gray-800 bg-gray-700 object-cover" src={item.image} title={item.name} />
                      ))}
                      {order.items.length > 3 && (
                          <div className="w-8 h-8 rounded-full border border-gray-800 bg-gray-700 flex items-center justify-center text-xs text-white">+{order.items.length - 3}</div>
                      )}
                   </div>
                   <span className="text-xs text-gray-500 mt-1 block">{order.items.length} items</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                    ₹{order.totalAmount.toFixed(2)}
                    <span className="block text-xs font-normal text-gray-500">{order.paymentMethod}</span>
                    <div className="mt-1">
                        {getRefundStatusBadge(order)}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex flex-col items-end gap-2">
                   <select 
                     value={order.status}
                     onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                     className="bg-[#111] text-gray-300 text-xs border border-white/20 rounded px-2 py-1 outline-none focus:border-cyan-500"
                   >
                       <option value="PENDING">Pending</option>
                       <option value="PROCESSING">Processing</option>
                       <option value="SHIPPED">Shipped</option>
                       <option value="DELIVERED">Delivered</option>
                       <option value="CANCELLED">Cancelled</option>
                   </select>

                   {(order.refundStatus === 'PENDING' || (order.status === 'CANCELLED' && order.refundStatus !== 'COMPLETED')) && (
                       <button 
                         onClick={() => handleProcessRefund(order.id)}
                         disabled={processingRefundId === order.id}
                         className={`text-xs ${processingRefundId === order.id ? 'text-gray-500 cursor-not-allowed' : 'text-green-400 hover:text-green-300 hover:underline'} font-bold`}
                       >
                           {processingRefundId === order.id ? 'Processing...' : 'Release Refund'}
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

export default AdminOrders;
