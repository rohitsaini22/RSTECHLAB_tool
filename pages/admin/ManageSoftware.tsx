
import React, { useEffect, useState } from 'react';
import { Software } from '../../types';
import { addSoftware, deleteSoftware, getSoftware, updateSoftware, saveSoftwareFile } from '../../services/mockBackend';
import { Button } from '../../components/Button';
import { generateMarketingCopy } from '../../services/geminiService';

const ManageSoftware: React.FC = () => {
  const [softwareList, setSoftwareList] = useState<Software[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Development');
  const [platform, setPlatform] = useState<'Windows' | 'MacOS' | 'Linux' | 'Cross-Platform'>('Windows');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [priceMonthly, setPriceMonthly] = useState(10);
  const [priceYearly, setPriceYearly] = useState(100);
  
  // File Handling
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchSoftware = async () => {
    setLoading(true);
    const data = await getSoftware();
    setSoftwareList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSoftware();

    const handleUpdate = () => fetchSoftware();
    window.addEventListener('software-updated', handleUpdate);
    return () => window.removeEventListener('software-updated', handleUpdate);
  }, []);

  const handleAiGenerate = async () => {
    if (!name || !category) {
      alert("Please enter Name and Category first.");
      return;
    }
    setAiLoading(true);
    const copy = await generateMarketingCopy(name, category);
    setDescription(copy);
    setAiLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
      setSelectedFile(file);
      setUploadedFileName(file.name);
      // Calculate mocked size string
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setFileSize(`${sizeInMB} MB`);
  };

  // Drag and Drop handlers
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if(e.dataTransfer.files && e.dataTransfer.files[0]) {
          processFile(e.dataTransfer.files[0]);
      }
  };

  const simulateUpload = async () => {
      // Simulate progress bar
      return new Promise<void>((resolve) => {
          setUploadProgress(10);
          const interval = setInterval(() => {
              setUploadProgress(prev => {
                  if (prev >= 100) {
                      clearInterval(interval);
                      resolve();
                      return 100;
                  }
                  return prev + 20;
              });
          }, 300);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate Upload Process
    if (uploadedFileName) {
        await simulateUpload();
    }
    
    // Simplistic mock handling for demo
    let finalImageUrl = imageUrl || imagePreview || `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`;
    
    const payload = { 
        name, 
        version, 
        category, 
        description, 
        priceMonthly, 
        priceYearly, 
        fileUrl: uploadedFileName ? `https://cdn.rstechlab.com/builds/${uploadedFileName}` : '#', 
        imageUrl: finalImageUrl,
        platform,
        fileSize: fileSize || '500 MB',
        requirements
    };

    let targetId = editId;
    if (editId) {
        await updateSoftware(editId, payload);
    } else {
        const newSw = await addSoftware(payload);
        targetId = newSw.id;
    }

    // Save the actual file to IndexedDB for download
    if (targetId && selectedFile) {
        await saveSoftwareFile(targetId, selectedFile);
    }

    setUploadProgress(0);
    setIsModalOpen(false);
    resetForm();
    await fetchSoftware();
    setLoading(false);
  };

  const handleEdit = (sw: Software) => {
    setEditId(sw.id);
    setName(sw.name);
    setCategory(sw.category);
    setPlatform(sw.platform);
    setVersion(sw.version);
    setDescription(sw.description);
    setRequirements(sw.requirements || '');
    setPriceMonthly(sw.priceMonthly);
    setPriceYearly(sw.priceYearly);
    setImageUrl(sw.imageUrl);
    setImagePreview(sw.imageUrl);
    setFileSize(sw.fileSize);
    setUploadedFileName(sw.fileUrl !== '#' ? sw.fileUrl.split('/').pop() || '' : '');
    setSelectedFile(null); // Reset actual file on edit mode open
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this software?')) {
      setDeletingId(id);
      try {
        // Optimistic update
        setSoftwareList(prev => prev.filter(item => item.id !== id));
        await deleteSoftware(id);
      } catch (error) {
        console.error("Failed to delete software:", error);
        alert("Failed to delete software. Please try again.");
        await fetchSoftware();
      } finally {
        setDeletingId(null);
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName(''); setVersion(''); setDescription(''); setRequirements('');
    setPriceMonthly(10); setPriceYearly(100); 
    setImageUrl(''); setImagePreview(''); 
    setUploadedFileName(''); setFileSize(''); setUploadProgress(0);
    setPlatform('Windows');
    setSelectedFile(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">System Management</h3>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-cyan-600 hover:bg-cyan-500">
            + Upload New Version
        </Button>
      </div>

      <div className="bg-[#050505] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Software Package</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Platform</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Version</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Size</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {softwareList.map((sw) => (
              <tr key={sw.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-lg object-cover bg-gray-800 border border-white/10" src={sw.imageUrl} alt="" />
                    <div className="ml-4">
                      <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{sw.name}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">{sw.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                        {sw.platform === 'Windows' && <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4h-13.051M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>}
                        {sw.platform === 'MacOS' && <svg className="w-4 h-4 text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.98 1.07-3.11-1.04.05-2.29.69-3.02 1.55-.67.78-1.26 2.05-1.11 3.15 1.16.09 2.34-.73 3.06-1.59"/></svg>}
                        {sw.platform === 'Linux' && <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>}
                        {sw.platform}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-cyan-500">{sw.version}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sw.fileSize || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(sw)} className="text-cyan-400 hover:text-cyan-300 mr-4 font-bold bg-cyan-900/20 px-3 py-1.5 rounded border border-cyan-900/50">Manage</button>
                  <button 
                    onClick={() => handleDelete(sw.id)} 
                    disabled={deletingId === sw.id}
                    className={`${deletingId === sw.id ? 'text-gray-500 cursor-not-allowed' : 'text-red-400 hover:text-red-300'} font-bold bg-red-900/10 px-3 py-1.5 rounded border border-red-900/30`}
                  >
                    {deletingId === sw.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/90 transition-opacity backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-[#0F172A] border border-white/10 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              
              {/* Progress Overlay */}
              {loading && uploadProgress > 0 && (
                  <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-8">
                      <div className="w-full max-w-sm mb-4">
                          <div className="flex justify-between text-xs text-cyan-400 mb-1">
                              <span>UPLOADING TO CDN...</span>
                              <span>{uploadProgress}%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500 transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
                          </div>
                      </div>
                      <p className="text-white font-mono text-sm">Please wait while we secure your package.</p>
                  </div>
              )}

              <div className="px-6 py-6 border-b border-white/10 flex justify-between items-center bg-[#111827]">
                  <h3 className="text-xl font-bold text-white">{editId ? 'Update Software Package' : 'Upload New Software'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* General Info */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Software Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input-tech w-full rounded-lg px-3 py-2.5 text-sm" placeholder="e.g. DevStudio Pro" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Version Tag</label>
                        <input type="text" required value={version} onChange={e => setVersion(e.target.value)} className="input-tech w-full rounded-lg px-3 py-2.5 text-sm" placeholder="e.g. 2024.2.1" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="input-tech w-full rounded-lg px-3 py-2.5 text-sm">
                            <option>Development</option><option>Security</option><option>Design</option><option>Productivity</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Target Platform</label>
                        <select value={platform} onChange={e => setPlatform(e.target.value as any)} className="input-tech w-full rounded-lg px-3 py-2.5 text-sm">
                            <option>Windows</option><option>MacOS</option><option>Linux</option><option>Cross-Platform</option>
                        </select>
                    </div>
                </div>

                {/* File Upload Simulation with Drag & Drop */}
                <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`p-6 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center text-center ${isDragging ? 'border-cyan-500 bg-cyan-900/10' : 'border-gray-600 bg-[#1E293B] hover:border-gray-500'}`}
                >
                    <div className="mb-3 p-3 bg-white/5 rounded-full">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    </div>
                    <label className="block text-sm font-bold text-white mb-1 cursor-pointer hover:underline">
                        Click to upload
                        <input type="file" onChange={handleFileSelect} className="hidden"/>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">or drag and drop installer file</p>
                    {uploadedFileName && (
                        <div className="mt-2 flex items-center gap-2 bg-cyan-900/20 px-3 py-1.5 rounded-full border border-cyan-900/30">
                            <span className="text-xs font-mono text-cyan-400">{uploadedFileName}</span>
                            <span className="text-[10px] text-gray-400">({fileSize})</span>
                        </div>
                    )}
                </div>

                {/* System Specs */}
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">System Requirements</label>
                   <textarea rows={2} value={requirements} onChange={e => setRequirements(e.target.value)} className="input-tech w-full rounded-lg px-3 py-2.5 text-sm" placeholder="e.g. Windows 10+, 8GB RAM, 2GB Disk Space"></textarea>
                </div>

                {/* Description & AI */}
                <div>
                   <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
                       <button type="button" onClick={handleAiGenerate} disabled={aiLoading} className="text-xs flex items-center gap-1 text-cyan-400 hover:text-white transition-colors bg-cyan-900/10 px-2 py-0.5 rounded border border-cyan-900/30">
                           {aiLoading ? 'Generating...' : '✨ AI Generate'}
                       </button>
                   </div>
                   <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="input-tech w-full rounded-lg px-3 py-2.5 text-sm"></textarea>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-6 p-4 bg-[#1E293B] rounded-xl border border-white/5">
                    <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Monthly Price (₹)</label><input type="number" value={priceMonthly} onChange={e => setPriceMonthly(Number(e.target.value))} className="input-tech w-full rounded-lg px-3 py-2 text-white" /></div>
                    <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Yearly Price (₹)</label><input type="number" value={priceYearly} onChange={e => setPriceYearly(Number(e.target.value))} className="input-tech w-full rounded-lg px-3 py-2 text-white" /></div>
                </div>
                
                {/* Visuals */}
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Cover Image URL</label>
                   <input type="text" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value); }} className="input-tech w-full rounded-lg px-3 py-2.5 text-sm" placeholder="https://..." />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-500 border-0 py-3 shadow-lg shadow-cyan-900/20" isLoading={loading}>
                      {editId ? 'Save Changes' : 'Upload & Publish'}
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
export default ManageSoftware;
