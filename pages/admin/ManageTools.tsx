import React, { useEffect, useState } from 'react';
import { Tool, BusinessPlan } from '../../types';
import { getTools, addTool, updateTool, deleteTool, getPlans } from '../../services/mockBackend';
import { Button } from '../../components/Button';
import * as Lucide from 'lucide-react';
import { 
  Plus, Search, Edit2, Trash2, Globe, Cpu, Shield, Key, Terminal, 
  Sparkles, FileText, Wifi, Share2, Compass, Check, X, Star, Activity, Link2, 
  TrendingUp, BarChart2, CheckCircle, HelpCircle, Eye, EyeOff, Upload 
} from 'lucide-react';

const PRESET_ICONS = [
  { name: 'Wifi', desc: 'Connectivity / P2P', icon: Wifi },
  { name: 'Shield', desc: 'Security / Encrypt', icon: Shield },
  { name: 'Key', desc: 'Credentials / Access', icon: Key },
  { name: 'Terminal', desc: 'Dev tools / Cmd', icon: Terminal },
  { name: 'Sparkles', desc: 'AI / Generation', icon: Sparkles },
  { name: 'FileText', desc: 'Markdown / Docs', icon: FileText },
  { name: 'Cpu', desc: 'Hardware / Micro', icon: Cpu },
  { name: 'Globe', desc: 'Web apps / Clouds', icon: Globe },
  { name: 'Compass', desc: 'Navigation / Scan', icon: Compass },
  { name: 'Share2', desc: 'Social / Feed', icon: Share2 }
];

// Dynamic Icon Component inside Admin namespace
const AdminToolIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "w-5 h-5 text-gray-400" }) => {
  // If name is a Base64 image or a URL (starts with http or data:image)
  if (name.startsWith('data:') || name.startsWith('http://') || name.startsWith('https://')) {
    return <img src={name} alt="" className={`${className} object-contain rounded`} referrerPolicy="no-referrer" />;
  }
  const IconComponent = (Lucide as any)[name] || HelpCircle;
  return <IconComponent className={className} />;
};

const ManageTools: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Form Field States
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Developer Utilities');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('Terminal');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [featured, setFeatured] = useState(false);

  // Access Permission States
  const [loginRequired, setLoginRequired] = useState(false);
  const [premiumRequired, setPremiumRequired] = useState(false);
  const [allowedPlans, setAllowedPlans] = useState<string[]>([]);
  const [availablePlans, setAvailablePlans] = useState<BusinessPlan[]>([]);

  // Stats Counters
  const [totalTools, setTotalTools] = useState(0);
  const [activeTools, setActiveTools] = useState(0);
  const [featuredTools, setFeaturedTools] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);

  const fetchTools = async () => {
    setLoading(true);
    const data = await getTools();
    setTools(data);
    
    // Calculate statistics
    setTotalTools(data.length);
    setActiveTools(data.filter(t => t.status === 'ACTIVE').length);
    setFeaturedTools(data.filter(t => t.featured).length);
    setTotalClicks(data.reduce((acc, t) => acc + (t.clicks || 0), 0));

    // Fetch plans dynamically
    const pData = await getPlans();
    setAvailablePlans(pData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const openAddModal = () => {
    resetForm();
    setErrorText('');
    setIsModalOpen(true);
  };

  const openEditModal = (tool: Tool) => {
    setErrorText('');
    setEditId(tool.id);
    setName(tool.name);
    setDescription(tool.description);
    setCategory(tool.category);
    setUrl(tool.url);
    setIcon(tool.icon);
    setStatus(tool.status);
    setFeatured(tool.featured);
    setLoginRequired(!!tool.loginRequired);
    setPremiumRequired(!!tool.premiumRequired);
    setAllowedPlans(tool.allowedPlans || []);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setCategory('Developer Utilities');
    setUrl('');
    setIcon('Terminal');
    setStatus('ACTIVE');
    setFeatured(false);
    setLoginRequired(false);
    setPremiumRequired(false);
    setAllowedPlans([]);
  };

  const handleCustomIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Please choose an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Direct toggle helpers for table rows
  const handleToggleStatus = async (tool: Tool) => {
    const nextStatus = tool.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    // Optimistic Update
    setTools(prev => prev.map(t => t.id === tool.id ? { ...t, status: nextStatus } : t));
    setActiveTools(prev => nextStatus === 'ACTIVE' ? prev + 1 : prev - 1);
    
    try {
      await updateTool(tool.id, { status: nextStatus });
    } catch (err) {
      console.error(err);
      fetchTools();
    }
  };

  const handleToggleFeatured = async (tool: Tool) => {
    const nextFeatured = !tool.featured;
    // Optimistic Update
    setTools(prev => prev.map(t => t.id === tool.id ? { ...t, featured: nextFeatured } : t));
    setFeaturedTools(prev => nextFeatured ? prev + 1 : prev - 1);

    try {
      await updateTool(tool.id, { featured: nextFeatured });
    } catch (err) {
      console.error(err);
      fetchTools();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorText('Tool name is required.');
    if (!description.trim()) return setErrorText('Tool description is required.');
    if (!url.trim() || !url.startsWith('http')) return setErrorText('Please enter a valid URL starting with http:// or https://');

    setLoading(true);
    const payload = {
      name,
      description,
      category,
      url,
      icon,
      status,
      featured,
      loginRequired,
      premiumRequired,
      allowedPlans
    };

    try {
      if (editId) {
        await updateTool(editId, payload);
      } else {
        await addTool(payload);
      }
      setIsModalOpen(false);
      resetForm();
      await fetchTools();
    } catch (err: any) {
      setErrorText(err.message || 'Verification or persistence failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this custom utility from RSTechLab? Users will lose remote visibility.')) {
      setTools(prev => prev.filter(t => t.id !== id));
      try {
        await deleteTool(id);
        await fetchTools();
      } catch (err) {
        console.error(err);
        fetchTools();
      }
    }
  };

  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.category.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Upper Title Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">Manage Tool Registry</h3>
          <p className="text-sm text-gray-500 mt-1">Configure live subdomains, tracking statuses, and custom client assets dynamically.</p>
        </div>
        <Button 
          onClick={openAddModal}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Custom Tool
        </Button>
      </div>

      {/* Dynamic Statistics Panel Card Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total stats card */}
        <div className="bg-[#050505] p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Tools Registered</span>
            <div className="p-2 bg-white/5 border border-white/5 rounded-lg text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-white font-mono">{totalTools}</h4>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total sandbox services</span>
          </div>
        </div>

        {/* Active stats card */}
        <div className="bg-[#050505] p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Active Visibility</span>
            <div className="p-2 bg-white/5 border border-white/5 rounded-lg text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-emerald-400 font-mono">{activeTools}</h4>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Online on website</span>
          </div>
        </div>

        {/* Featured count stats card */}
        <div className="bg-[#050505] p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Featured Spots</span>
            <div className="p-2 bg-white/5 border border-white/5 rounded-lg text-yellow-400">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-yellow-400 font-mono">{featuredTools}</h4>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Highlighted listings</span>
          </div>
        </div>

        {/* clicks metrics card */}
        <div className="bg-[#050505] p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Total Engagements</span>
            <div className="p-2 bg-white/5 border border-white/5 rounded-lg text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-white font-mono">{totalClicks.toLocaleString()}</h4>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold font-mono flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-400" /> clicks tracked
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Container & Filters section */}
      <div className="bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Filter by name, query or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
            />
          </div>
          <div className="text-xs text-gray-500">
            Showing <strong className="text-gray-300 font-mono">{filteredTools.length}</strong> of {totalTools} tools
          </div>
        </div>

        {/* Tabular Layout */}
        <div className="overflow-x-auto">
          {filteredTools.length === 0 ? (
            <div className="p-16 text-center text-gray-500 italic">
              No matching tools in local storage registry. Click 'Add Custom Tool' above to start!
            </div>
          ) : (
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/5 font-mono">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Icon</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tool Identity</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Featured</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">clicks</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-white/5 transition-colors group">
                    {/* Icon column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                        <AdminToolIcon name={tool.icon} className="w-5 h-5 text-cyan-400 max-h-8 max-w-8" />
                      </div>
                    </td>

                    {/* Meta info Column */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{tool.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{tool.description}</div>
                        <div className="flex items-center gap-1 text-[10px] text-cyan-500/80 font-mono mt-1 select-all select-none">
                          <Link2 className="w-2.5 h-2.5" /> {tool.url}
                        </div>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white/5 text-gray-400 border border-white/15">
                        {tool.category}
                      </span>
                    </td>

                    {/* Featured Toggle Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleFeatured(tool)}
                        className={`inline-flex items-center justify-center p-2 rounded-xl border cursor-pointer transition-all ${
                          tool.featured 
                            ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400 shadow-sm' 
                            : 'bg-white/5 border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                        title="Toggle Featured Spot"
                      >
                        <Star className={`w-4 h-4 ${tool.featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    {/* Status Visibility Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleStatus(tool)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] uppercase font-bold tracking-wider cursor-pointer ${
                          tool.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                        title="Toggle Status Visibility"
                      >
                        {tool.status === 'ACTIVE' ? (
                          <>
                            <Eye className="w-3 h-3" /> Online
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Offline
                          </>
                        )}
                      </button>
                    </td>

                    {/* click stats column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center font-mono text-xs text-gray-300 font-semibold">
                      {tool.clicks || 0}
                    </td>

                    {/* Action buttons column */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(tool)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg transition-all cursor-pointer"
                          title="Edit Tool Parameters"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tool.id)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-500/20 rounded-lg transition-all cursor-pointer"
                          title="Delete Tool"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide Modal Drawer Container */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[#090909] border border-white/15 rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Heading Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h4 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                {editId ? 'Modify Custom Service' : 'Configure New Tool'}
              </h4>
              <button 
                onClick={() => setIsOpenModal(false) /* Note closure safety below: we use setIsModalOpen directly */}
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error notifications row */}
            {errorText && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-xs text-red-400 font-semibold font-mono">
                ⚠️ {errorText}
              </div>
            )}

            {/* Main Form container */}
            <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tool Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400">Tool Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. File Transfer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-semibold"
                  />
                </div>

                {/* Category Preset Suggestion or text input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono"
                  >
                    <option value="Developer Utilities">Developer Utilities</option>
                    <option value="Security & Cryptography">Security & Cryptography</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Network & P2P">Network & P2P</option>
                    <option value="Graphics & Design">Graphics & Design</option>
                  </select>
                </div>
              </div>

              {/* Tool URL Endpoint */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400">Subdomain / Service Endpoint URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://transfer.rstechlab.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-cyan-400"
                />
                <span className="text-[10px] font-mono text-gray-600 block mt-1">Include secure protocol. Dynamic redirect resolves immediately when clients select item.</span>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400">Description Statement *</label>
                <textarea
                  required
                  rows={2}
                  maxLength={190}
                  placeholder="Pithy high-impact descriptive bullet. Recommends WebRTC peer connections directly."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <span className="text-[10px] text-right block text-gray-600">{190 - description.length} characters left</span>
              </div>

              {/* Icon selection container */}
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400">Component Asset or Upload Icon</label>
                    <p className="text-[10px] text-gray-600 mt-0.5">Pick standard representation, or upload custom imagery.</p>
                  </div>

                  {/* Built-in file upload tool */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black cursor-pointer text-xs font-bold transition-all">
                    <Upload className="w-3.5 h-3.5" /> Upload Cover
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleCustomIconUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Grid list of Preset SVG representations */}
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_ICONS.map((p) => {
                    const PresetComp = p.icon;
                    const isSelected = icon === p.name;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setIcon(p.name)}
                        className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all text-center border cursor-pointer ${
                          isSelected 
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]' 
                            : 'bg-black/50 border-transparent text-gray-500 hover:text-gray-300 hover:bg-black/80'
                        }`}
                        title={p.desc}
                      >
                        <PresetComp className="w-4 h-4" />
                        <span className="text-[8px] font-bold font-mono tracking-wider truncate max-w-full">{p.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Icon Field or string identifier */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[9px] font-mono uppercase tracking-wider font-semibold text-gray-500">Manual String representation (Lucide component name or Raw URL)</label>
                  <input
                    type="text"
                    placeholder="Terminal, CPU or custom image URL..."
                    value={icon.startsWith('data:') ? 'Custom local image uploaded' : icon}
                    disabled={icon.startsWith('data:')}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
                  />
                  {icon.startsWith('data:') && (
                    <button
                      type="button"
                      onClick={() => setIcon('Terminal')}
                      className="text-[9px] text-red-400 hover:underline font-semibold block"
                    >
                      Clear custom image, restore presets
                    </button>
                  )}
                </div>
              </div>

              {/* Toggles row */}
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                {/* Active Toggle Switch option */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Visible Status</span>
                    <span className="text-[10px] text-gray-500 block">Deploy tool immediately</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatus(prev => prev === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      status === 'ACTIVE' ? 'bg-cyan-500' : 'bg-gray-800'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                      status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Featured toggle option */}
                <div className="flex items-center justify-between border-l border-white/10 pl-4">
                  <div>
                    <span className="text-xs font-bold text-white block">Highlight Service</span>
                    <span className="text-[10px] text-gray-500 block">Spotlight on top cards</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeatured(prev => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      featured ? 'bg-yellow-500' : 'bg-gray-800'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                      featured ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Dynamic Subscription Constraints */}
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                {/* Login Required */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Login Required</span>
                    <span className="text-[10px] text-gray-500 block">Require user session</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLoginRequired(prev => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      loginRequired ? 'bg-cyan-500' : 'bg-gray-800'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                      loginRequired ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Premium Required */}
                <div className="flex items-center justify-between border-l border-white/10 pl-4">
                  <div>
                    <span className="text-xs font-bold text-white block font-mono">Premium Req</span>
                    <span className="text-[10px] text-gray-500 block">Require upgrade</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPremiumRequired(prev => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      premiumRequired ? 'bg-cyan-500' : 'bg-gray-800'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                      premiumRequired ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Allowed subscription tiers checkboxes */}
              <div className="bg-[#111111] p-4 rounded-xl border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white block font-mono">Access Permission Tiers</span>
                <span className="text-[10px] text-gray-500 block">Select which license plans can access this specific tool. If none, visible to all tiers.</span>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {availablePlans.map(plan => {
                    const isAllowed = allowedPlans.includes(plan.name) || allowedPlans.includes(plan.id);
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => {
                          if (isAllowed) {
                            setAllowedPlans(prev => prev.filter(p => p !== plan.id && p !== plan.name));
                          } else {
                            setAllowedPlans(prev => [...prev, plan.name]);
                          }
                        }}
                        className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 text-left text-xs font-mono select-none pointer-events-auto cursor-pointer"
                      >
                        <span className="text-gray-300 truncate pr-2">{plan.name}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isAllowed ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-white/20'}`}>
                          {isAllowed && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action triggers bottom */}
              <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 bg-[#090909]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white text-xs uppercase font-extrabold tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 text-xs uppercase font-extrabold tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Processing...' : editId ? 'Apply Refinements' : 'Deploy Micro-Tool'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTools;
