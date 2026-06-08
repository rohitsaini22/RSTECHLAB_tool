import React, { useEffect, useState } from 'react';
import { NewsUpdate } from '../../types';
import { getUpdates, addUpdate, updateUpdate, deleteUpdate } from '../../services/mockBackend';
import { Button } from '../../components/Button';

const ManageUpdates: React.FC = () => {
  const [updates, setUpdates] = useState<NewsUpdate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [tag, setTag] = useState('New Release');

  const fetchUpdates = async () => {
    setLoading(true);
    const data = await getUpdates();
    setUpdates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUpdates();

    const handleUpdate = () => fetchUpdates();
    window.addEventListener('updates-updated', handleUpdate);
    return () => window.removeEventListener('updates-updated', handleUpdate);
  }, []);

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  }

  const openEditModal = (update: NewsUpdate) => {
    setEditId(update.id);
    setTitle(update.title);
    setDescription(update.description);
    setImage(update.image);
    setTag(update.tag);
    setIsModalOpen(true);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
        title,
        description,
        image,
        tag,
        date: new Date().toISOString()
    };

    if (editId) {
        await updateUpdate(editId, payload);
    } else {
        await addUpdate(payload);
    }

    setIsModalOpen(false);
    resetForm();
    await fetchUpdates();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this update?')) {
      setDeletingId(id);
      try {
        // Optimistic update
        setUpdates(prev => prev.filter(item => item.id !== id));
        await deleteUpdate(id);
      } catch (error) {
        console.error("Failed to delete update:", error);
        alert("Failed to delete update. Please try again.");
        await fetchUpdates();
      } finally {
        setDeletingId(null);
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setImage('');
    setTag('New Release');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Manage Latest Updates</h3>
        <Button onClick={openAddModal}>+ Add Update</Button>
      </div>

      <div className="bg-[#050505] shadow-lg rounded-xl border border-white/10 overflow-hidden">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Image</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Title</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Tag</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Description</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {updates.map((update) => (
              <tr key={update.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-12 w-20 bg-gray-800 rounded-lg overflow-hidden border border-white/10">
                      <img src={update.image} alt="" className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-white">{update.title}</div>
                  <div className="text-xs text-gray-500">{new Date(update.date).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-cyan-900/30 text-cyan-400 border border-cyan-500/30">
                        {update.tag}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{update.description}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openEditModal(update)} className="text-cyan-400 hover:text-cyan-300 mr-4 font-bold">Edit</button>
                  <button 
                    onClick={() => handleDelete(update.id)} 
                    disabled={deletingId === update.id}
                    className={`${deletingId === update.id ? 'text-gray-500 cursor-not-allowed' : 'text-red-400 hover:text-red-300'} font-bold`}
                  >
                    {deletingId === update.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {updates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No updates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/80 transition-opacity backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-[#0a0a0a] border border-white/10 rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <form onSubmit={handleSubmit}>
                <h3 className="text-xl leading-6 font-bold text-white mb-6">{editId ? 'Edit Update' : 'Add New Update'}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Title</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm" placeholder="e.g. AI-Powered Analytics Suite" />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tag</label>
                     <select value={tag} onChange={e => setTag(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none text-sm">
                        <option>New Release</option>
                        <option>Update</option>
                        <option>Feature</option>
                        <option>Announcement</option>
                        <option>Event</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Image</label>
                     <div className="space-y-3">
                         <input 
                             type="text" 
                             required={!image}
                             value={image} 
                             onChange={e => setImage(e.target.value)} 
                             className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none text-sm" 
                             placeholder="Paste URL or upload image..." 
                         />
                         <div className="relative">
                             <input
                                 type="file"
                                 accept="image/*"
                                 onChange={handleImageUpload}
                                 className="block w-full text-sm text-gray-400
                                 file:mr-4 file:py-2 file:px-4
                                 file:rounded-lg file:border-0
                                 file:text-xs file:font-bold
                                 file:bg-white/10 file:text-white
                                 hover:file:bg-white/20
                                 cursor-pointer"
                             />
                         </div>
                         {image && (
                             <div className="mt-2 relative group w-full h-48 bg-black/50 rounded-lg border border-white/10 overflow-hidden">
                                 <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <button 
                                         type="button"
                                         onClick={() => setImage('')}
                                         className="text-white text-xs font-bold bg-red-500/80 px-3 py-1 rounded-full hover:bg-red-500"
                                     >
                                         Remove
                                     </button>
                                 </div>
                             </div>
                         )}
                     </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea 
                        required
                        rows={3}
                        value={description} 
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none text-sm resize-none" 
                        placeholder="Brief summary of the update..."
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 flex gap-3 pt-4 border-t border-white/10">
                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold border-0" isLoading={loading}>{editId ? 'Update' : 'Publish'}</Button>
                  <button type="button" className="w-full bg-white/5 border border-white/10 text-white font-bold py-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setIsModalOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUpdates;
