
import React, { useEffect, useState, useRef } from 'react';
import { ElectronicsItem } from '../../types';
import { addElectronics, deleteElectronics, getElectronics, updateElectronics } from '../../services/mockBackend';
import { Button } from '../../components/Button';
import { Upload, Link, Image as ImageIcon, X, Trash2 } from 'lucide-react';

const ManageElectronics: React.FC = () => {
  const [items, setItems] = useState<ElectronicsItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Development');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState('');
  
  // Image State
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    const data = await getElectronics();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'sh_electronics') {
            fetchItems();
        }
    };

    const handleCustomUpdate = () => {
        fetchItems();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('electronics-updated', handleCustomUpdate);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('electronics-updated', handleCustomUpdate);
    };
  }, []);

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  }

  const openEditModal = (item: ElectronicsItem) => {
    setEditId(item.id);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setStock(item.stock || 0);
    setDescription(item.description || '');
    setImageUrl(item.image);
    setImagePreview(item.image);
    
    // Determine if it's a URL or Base64 (simple check)
    if (item.image.startsWith('data:')) {
        setUploadMethod('file');
    } else {
        setUploadMethod('url');
    }
    
    setIsModalOpen(true);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setImageUrl(result);
            setImagePreview(result);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock Image Handling if URL is empty but preview exists (from file input simulation)
    let finalImageUrl = imageUrl;
    if (!finalImageUrl) {
        finalImageUrl = `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80`; // Default
    }

    const payload = {
        name,
        category,
        price,
        stock,
        description,
        image: finalImageUrl
    };

    if (editId) {
        await updateElectronics(editId, payload);
    } else {
        await addElectronics(payload);
    }

    setIsModalOpen(false);
    resetForm();
    await fetchItems();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setDeletingId(id);
      try {
        // Optimistic update: Remove immediately from UI
        setItems(prev => prev.filter(item => item.id !== id));
        
        await deleteElectronics(id);
        // The event listener will trigger fetchItems to ensure sync
      } catch (error) {
        console.error("Failed to delete item:", error);
        alert("Failed to delete item. Please try again.");
        // Revert/Sync on error
        await fetchItems();
      } finally {
        setDeletingId(null);
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setCategory('Development');
    setPrice(0);
    setStock(0);
    setDescription('');
    setImageUrl('');
    setImagePreview('');
    setUploadMethod('file');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Manage Electronics</h3>
        <Button onClick={openAddModal}>+ Add Product</Button>
      </div>

      {/* List */}
      <div className="bg-[#050505] shadow-lg rounded-xl border border-white/10 overflow-hidden">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img className="h-10 w-10 rounded-lg object-cover bg-gray-800" src={item.image} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-white">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {item.stock > 0 ? (
                        <span className="text-green-400">{item.stock} in stock</span>
                    ) : (
                        <span className="text-red-400">Out of stock</span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                  ₹{item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openEditModal(item)} className="text-cyan-400 hover:text-cyan-300 mr-4 font-bold">Edit</button>
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    disabled={deletingId === item.id}
                    className={`${deletingId === item.id ? 'text-gray-500 cursor-not-allowed' : 'text-red-400 hover:text-red-300'} font-bold`}
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No electronics found. Add one to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/80 transition-opacity backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-[#0a0a0a] border border-white/10 rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl leading-6 font-bold text-white">{editId ? 'Edit Product' : 'Add New Product'}</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Product Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm" placeholder="e.g. Arduino Uno R3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none text-sm">
                           <option>Development</option>
                           <option>Boards</option>
                           <option>Sensors</option>
                           <option>Robotics</option>
                           <option>Components</option>
                           <option>Microcontrollers</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Stock Qty</label>
                        <input type="number" required min="0" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none text-sm" />
                     </div>
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Product Image</label>
                    
                    {/* Toggle Tabs */}
                    <div className="flex space-x-4 mb-3">
                        <button 
                            type="button"
                            onClick={() => setUploadMethod('file')}
                            className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${uploadMethod === 'file' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
                        >
                            <Upload size={14} className="mr-1.5" /> Upload File
                        </button>
                        <button 
                            type="button"
                            onClick={() => setUploadMethod('url')}
                            className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${uploadMethod === 'url' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'}`}
                        >
                            <Link size={14} className="mr-1.5" /> Image URL
                        </button>
                    </div>

                    {uploadMethod === 'file' ? (
                        <div className="relative group">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden" 
                                id="file-upload"
                            />
                            <label 
                                htmlFor="file-upload" 
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${imagePreview ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10 bg-[#111] hover:bg-[#161616] hover:border-white/20'}`}
                            >
                                {imagePreview ? (
                                    <div className="relative w-full h-full p-2">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                            <span className="text-white text-xs font-bold">Change Image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                        <p className="mb-1 text-sm text-gray-400"><span className="font-bold text-white">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ImageIcon size={16} className="text-gray-500" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="https://example.com/image.jpg" 
                                value={imageUrl} 
                                onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value); }}
                                className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-cyan-500 outline-none text-sm" 
                            />
                        </div>
                    )}

                    {/* Preview for URL mode or general remove button */}
                    {imagePreview && (
                        <div className="mt-2 flex justify-end">
                            <button 
                                type="button" 
                                onClick={handleRemoveImage}
                                className="text-xs text-red-400 hover:text-red-300 flex items-center"
                            >
                                <Trash2 size={12} className="mr-1" /> Remove Image
                            </button>
                        </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea 
                        rows={3} 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none text-sm"
                        placeholder="Product description..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Price (₹)</label>
                    <input type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none text-sm" />
                  </div>
                </div>

                <div className="mt-8 flex gap-3 pt-4 border-t border-white/10">
                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold border-0" isLoading={loading}>{editId ? 'Update Product' : 'Add Product'}</Button>
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

export default ManageElectronics;
