import React, { useEffect, useState } from 'react';
import { getContactMessages, deleteContactMessage } from '../../services/mockBackend';
import { ContactMessage } from '../../types';
import { Button } from '../../components/Button';

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();

    const handleUpdate = () => fetchMessages();
    window.addEventListener('messages-updated', handleUpdate);
    return () => window.removeEventListener('messages-updated', handleUpdate);
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const data = await getContactMessages();
    // Sort by date desc
    setMessages(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this message?')) {
        setDeletingId(id);
        try {
            // Optimistic update
            setMessages(prev => prev.filter(item => item.id !== id));
            await deleteContactMessage(id);
        } catch (error) {
            console.error("Failed to delete message:", error);
            alert("Failed to delete message. Please try again.");
            await fetchMessages();
        } finally {
            setDeletingId(null);
        }
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Contact Messages</h3>

      <div className="bg-[#050505] shadow-lg rounded-xl border border-white/10 overflow-hidden">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Sender</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Message</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {messages.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No messages found.</td>
                </tr>
            ) : messages.map((msg) => (
              <tr key={msg.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {new Date(msg.date).toLocaleDateString()}
                    <span className="block text-xs opacity-50">{new Date(msg.date).toLocaleTimeString()}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm font-bold text-white">{msg.firstName} {msg.lastName}</div>
                   <div className="text-xs text-gray-500">{msg.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900/30 text-blue-300 border border-blue-800/50">
                        {msg.subject}
                    </span>
                </td>
                <td className="px-6 py-4">
                   <p className="text-sm text-gray-300 line-clamp-2 max-w-xs">{msg.message}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleDelete(msg.id)} 
                    disabled={deletingId === msg.id}
                    className={`${deletingId === msg.id ? 'text-gray-500 cursor-not-allowed' : 'text-red-400 hover:text-red-300'} font-bold text-xs bg-red-900/10 px-3 py-1.5 rounded border border-red-900/30`}
                  >
                    {deletingId === msg.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMessages;