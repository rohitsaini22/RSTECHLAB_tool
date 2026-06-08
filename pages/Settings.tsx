import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { 
  getCurrentUser, 
  getCompanySettings, 
  updateCompanySettings,
  getPlans,
  addPlan,
  updatePlan,
  deletePlan,
  getCustomRoles,
  addCustomRole,
  updateCustomRole,
  deleteCustomRole,
  getSystemSettings,
  updateSystemSettings,
  getFeatureFlags,
  updateFeatureFlag,
  getTools
} from '../services/mockBackend';
import { User, UserRole, CompanySettings, BusinessPlan, SystemSettings, FeatureFlag, CustomRole, Tool } from '../types';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  ShieldAlert, 
  Sparkles, 
  Key, 
  Sliders, 
  LayoutBoards, 
  ToggleLeft,
  ToggleRight,
  Database,
  Grid,
  Info,
  Lock
} from 'lucide-react';

const Settings: React.FC = () => {
  // Current user configuration
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'plans' | 'roles' | 'features'>('profile');

  // Load state
  const [loading, setLoading] = useState(false);

  // Profile preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Company core (public support link sync)
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    address: '',
    email: '',
    phone: '',
    hours: ''
  });
  const [companyLoading, setCompanyLoading] = useState(false);

  // --- No-Code Database States ---
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'RSTechLab',
    branding: 'Cyberpunk Teal',
    logo: '',
    themeColor: 'cyan',
    contactEmail: '',
    supportLink: '',
    maintenanceMode: false,
    registrationEnabled: true,
    loginEnabled: true,
    defaultPlanId: 'plan-free'
  });

  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [allTools, setAllTools] = useState<Tool[]>([]);

  // Form modals / active configurations
  const [editingPlan, setEditingPlan] = useState<BusinessPlan | null>(null);
  const [editingPlanForm, setEditingPlanForm] = useState<Partial<BusinessPlan>>({
    name: '',
    priceMonthly: 0,
    priceLifetime: 0,
    transferLimit: 10,
    storageLimit: '2 GB',
    toolAccess: [],
    premiumFeatures: [],
    trialDays: 0,
    status: 'ACTIVE'
  });

  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [editingRoleForm, setEditingRoleForm] = useState<Partial<CustomRole>>({
    name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    if (user?.role === UserRole.ADMIN) {
      setActiveTab('system'); // Admin starts in backend configuration center
      getCompanySettings().then(setCompanySettings);
      getSystemSettings().then(setSystemSettings);
      getPlans().then(setPlans);
      getCustomRoles().then(setRoles);
      getFeatureFlags().then(setFeatures);
      getTools().then(setAllTools);
    }
  }, []);

  const handleSavePreferences = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Preferences saved successfully!");
    }, 600);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert("New passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Password updated successfully.");
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    }, 800);
  };

  const handleCompanyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyLoading(true);
    await updateCompanySettings(companySettings);
    setCompanyLoading(false);
    alert("Public corporate contacts updated!");
  };

  // --- Dynamic System Settings Actions ---
  const handleUpdateSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const updated = await updateSystemSettings(systemSettings);
    setSystemSettings(updated);
    setLoading(false);
    alert("System branding parameters saved dynamically across memory modules.");
  };

  // --- Dynamic Plans Helpers ---
  const handleSelectPlanForEditing = (plan: BusinessPlan | null) => {
    if (plan === null) {
      setEditingPlan(null);
      setEditingPlanForm({
        name: '',
        priceMonthly: 0,
        priceLifetime: 0,
        transferLimit: 10,
        storageLimit: '2 GB',
        toolAccess: [],
        premiumFeatures: [],
        trialDays: 0,
        status: 'ACTIVE'
      });
    } else {
      setEditingPlan(plan);
      setEditingPlanForm({ ...plan });
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const planData = {
      name: editingPlanForm.name || 'Unnamed Plan',
      priceMonthly: Number(editingPlanForm.priceMonthly || 0),
      priceLifetime: Number(editingPlanForm.priceLifetime || 0),
      transferLimit: Number(editingPlanForm.transferLimit || 10),
      storageLimit: editingPlanForm.storageLimit || '2 GB',
      toolAccess: editingPlanForm.toolAccess || [],
      premiumFeatures: editingPlanForm.premiumFeatures || [],
      trialDays: Number(editingPlanForm.trialDays || 0),
      status: editingPlanForm.status || 'ACTIVE'
    };

    if (editingPlan) {
      const updated = await updatePlan(editingPlan.id, planData);
      setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
      alert(`Plan "${updated.name}" updated successfully.`);
    } else {
      const created = await addPlan(planData);
      setPlans(prev => [...prev, created]);
      alert(`Plan "${created.name}" injected successfully into persistence tables.`);
    }

    setLoading(false);
    handleSelectPlanForEditing(null);
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!window.confirm(`Permanently wipe out license tier: "${name}"?`)) return;
    setLoading(true);
    await deletePlan(id);
    setPlans(prev => prev.filter(p => p.id !== id));
    setLoading(false);
    alert(`Wiped out ${name} parameters.`);
  };

  // --- Custom Roles Actions ---
  const handleSelectRoleForEditing = (role: CustomRole | null) => {
    if (role === null) {
      setEditingRole(null);
      setEditingRoleForm({
        name: '',
        description: '',
        permissions: []
      });
    } else {
      setEditingRole(role);
      setEditingRoleForm({ ...role });
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const roleData = {
      name: editingRoleForm.name || 'Unnamed Role',
      description: editingRoleForm.description || '',
      permissions: editingRoleForm.permissions || []
    };

    if (editingRole) {
      const updated = await updateCustomRole(editingRole.id, roleData);
      setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
      alert(`Custom role "${updated.name}" updated!`);
    } else {
      const created = await addCustomRole(roleData);
      setRoles(prev => [...prev, created]);
      alert(`Role "${created.name}" configured and activated.`);
    }
    setLoading(false);
    handleSelectRoleForEditing(null);
  };

  const handleDeleteRole = async (id: string, name: string) => {
    if (!window.confirm(`Wipe role archetype: "${name}" from memory matrix?`)) return;
    setLoading(true);
    await deleteCustomRole(id);
    setRoles(prev => prev.filter(r => r.id !== id));
    setLoading(false);
    alert(`Removed role parameters for ${name}.`);
  };

  // --- Live Feature Flags Switcher ---
  const handleToggleFeature = async (id: string, currentStatus: boolean) => {
    const updated = await updateFeatureFlag(id, !currentStatus);
    setFeatures(prev => prev.map(f => f.id === id ? updated : f));
  };

  // Setup tools checkbox selections for dynamic plans
  const toggleToolAccess = (toolId: string) => {
    const accesses = editingPlanForm.toolAccess || [];
    if (accesses.includes(toolId)) {
      setEditingPlanForm({
        ...editingPlanForm,
        toolAccess: accesses.filter(id => id !== toolId)
      });
    } else {
      setEditingPlanForm({
        ...editingPlanForm,
        toolAccess: [...accesses, toolId]
      });
    }
  };

  // Preset permissions set for custom roles mapping
  const availablePermissions = [
    { key: 'view_landing', label: 'View Public Pages' },
    { key: 'view_tools', label: 'View Sandbox Toollist' },
    { key: 'use_free_tools', label: 'Execute Guest Core Utilities' },
    { key: 'use_premium_tools', label: 'Launch Subscription Weight Engines' },
    { key: 'manage_content', label: 'Publish Updates / Messages' },
    { key: 'configure_system', label: 'Bypass No-Code Business Restrictions' }
  ];

  const toggleRolePermission = (permKey: string) => {
    const perms = editingRoleForm.permissions || [];
    if (perms.includes(permKey)) {
      setEditingRoleForm({
        ...editingRoleForm,
        permissions: perms.filter(p => p !== permKey)
      });
    } else {
      setEditingRoleForm({
        ...editingRoleForm,
        permissions: [...perms, permKey]
      });
    }
  };

  const togglePremiumFeature = (featureText: string) => {
    const feats = editingPlanForm.premiumFeatures || [];
    if (feats.includes(featureText)) {
      setEditingPlanForm({
        ...editingPlanForm,
        premiumFeatures: feats.filter(f => f !== featureText)
      });
    } else {
      setEditingPlanForm({
        ...editingPlanForm,
        premiumFeatures: [...feats, featureText]
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <SettingsIcon className="w-8 h-8 text-cyan-400" />
            Config Deck Settings
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {currentUser?.role === UserRole.ADMIN 
              ? 'In-memory dynamic configuration, business rules control, and system parameters module.' 
              : 'Configure account credentials, e-mail filters, and active profile values.'}
          </p>
        </div>

        {/* Global tab options */}
        {currentUser?.role === UserRole.ADMIN && (
          <div className="flex flex-wrap gap-2 bg-[#050505]/40 border border-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'profile' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Account Profiler
            </button>
            <button 
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'system' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-white-80 shadow-md'}`}
            >
              Site Branding
            </button>
            <button 
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'plans' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-white'}`}
            >
              Plan Editor
            </button>
            <button 
              onClick={() => setActiveTab('roles')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'roles' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-white'}`}
            >
              Custom Roles
            </button>
            <button 
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'features' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-white'}`}
            >
              Feature Flags
            </button>
          </div>
        )}
      </div>

      {/* TABS CONTAINER */}
      <div className="space-y-8">
        
        {/* TAB: SYSTEM BRANDING & DEFAULTS */}
        {currentUser?.role === UserRole.ADMIN && activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* System Form */}
            <div className="lg:col-span-2 bg-[#050505]/75 border border-white/10 rounded-2xl p-6 relative">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                Global Brand Customization
              </h3>

              <form onSubmit={handleUpdateSystemSettings} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Site Name</label>
                    <input 
                      type="text" 
                      required
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Theme Identity Hue (Custom Prefixes)</label>
                    <select 
                      value={systemSettings.themeColor}
                      onChange={(e) => setSystemSettings({ ...systemSettings, themeColor: e.target.value })}
                      className="w-full bg-[#0d1527] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="cyan">Cyberpunk Mint (Teal)</option>
                      <option value="purple">Cosmic Nebulae (Purple)</option>
                      <option value="emerald">DeFi Hex (Green)</option>
                      <option value="rose">Synthwave Pulse (Pink)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Corporate Branding Slogan</label>
                    <input 
                      type="text" 
                      required
                      value={systemSettings.branding}
                      onChange={(e) => setSystemSettings({ ...systemSettings, branding: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Contact Support E-mail</label>
                    <input 
                      type="email" 
                      required
                      value={systemSettings.contactEmail}
                      onChange={(e) => setSystemSettings({ ...systemSettings, contactEmail: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Default User Registering Plan</label>
                    <select 
                      value={systemSettings.defaultPlanId}
                      onChange={(e) => setSystemSettings({ ...systemSettings, defaultPlanId: e.target.value })}
                      className="w-full bg-[#0d1527] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name} • Limits: {p.transferLimit} limit</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Branding Logo Asset URL</label>
                    <input 
                      type="text" 
                      value={systemSettings.logo}
                      onChange={(e) => setSystemSettings({ ...systemSettings, logo: e.target.value })}
                      placeholder="Image vector resource URL"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between p-3 bg-black/25 rounded-xl border border-white/5">
                    <div>
                      <p className="text-white font-bold text-xs">Login State</p>
                      <p className="text-[10px] text-gray-500">Enable user sign in</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSystemSettings({ ...systemSettings, loginEnabled: !systemSettings.loginEnabled })}
                    >
                      {systemSettings.loginEnabled ? (
                        <ToggleRight className="w-8 h-8 text-cyan-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-600" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/25 rounded-xl border border-white/5">
                    <div>
                      <p className="text-white font-bold text-xs">Self-Registering</p>
                      <p className="text-[10px] text-gray-500">Enable signs up</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSystemSettings({ ...systemSettings, registrationEnabled: !systemSettings.registrationEnabled })}
                    >
                      {systemSettings.registrationEnabled ? (
                        <ToggleRight className="w-8 h-8 text-cyan-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-600" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/25 rounded-xl border border-red-500/10">
                    <div>
                      <p className="text-red-400 font-bold text-xs">Maintenance Mode</p>
                      <p className="text-[10px] text-gray-500">Block public queries</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSystemSettings({ ...systemSettings, maintenanceMode: !systemSettings.maintenanceMode })}
                    >
                      {systemSettings.maintenanceMode ? (
                        <ToggleRight className="w-8 h-8 text-red-500 animate-pulse" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" isLoading={loading} className="bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 px-6">
                    Incorporate Brand Settings
                  </Button>
                </div>
              </form>
            </div>

            {/* Public Company Contact Information */}
            <div className="bg-[#050505]/75 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-400" />
                  Public Headquarters Link
                </h3>
                <p className="text-gray-500 text-xs mb-6">These fields propagate to your client contact forms dynamically.</p>

                <form onSubmit={handleCompanyUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Support Desk URL Link</label>
                    <input 
                      type="text" 
                      value={systemSettings.supportLink}
                      onChange={(e) => setSystemSettings({ ...systemSettings, supportLink: e.target.value })}
                      placeholder="e.g. support.rstechlab.com"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Business Operations Email</label>
                    <input 
                      type="text" 
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Physical Address Location</label>
                    <textarea 
                      rows={2}
                      value={companySettings.address}
                      onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" isLoading={companyLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs uppercase font-extrabold py-3">
                      Update contact settings
                    </Button>
                  </div>
                </form>
              </div>

              <div className="bg-cyan-950/20 border border-cyan-500/20 p-4 rounded-xl text-xs text-cyan-300 font-mono leading-normal mt-6">
                System Active brand name is globally bound to: <span className="font-extrabold text-white">{systemSettings.siteName}</span> Slogan context: "{systemSettings.branding}". No code overrides.
              </div>
            </div>
          </div>
        )}

        {/* TAB: PLAN MANAGEMENT */}
        {currentUser?.role === UserRole.ADMIN && activeTab === 'plans' && (
          <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex justify-between items-center bg-[#050505]/40 border border-white/5 p-4 rounded-xl">
              <div>
                <h3 className="font-bold text-white text-base">Database Plans Matrix</h3>
                <p className="text-xs text-gray-500">Currently hosting {plans.length} licensing configurations.</p>
              </div>
              <button 
                onClick={() => handleSelectPlanForEditing(null)}
                className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold uppercase tracking-wide px-4 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Pricing Model
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
              
              {/* Left Plans List */}
              <div className="xl:col-span-2 space-y-4">
                {plans.map(p => (
                  <div key={p.id} className="bg-[#050505]/65 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-white leading-none">{p.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider font-mono ${p.status === 'ACTIVE' ? 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-400' : 'bg-red-950/60 border border-red-500/30 text-red-400'}`}>
                          {p.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs font-mono text-gray-400">
                        <div>
                          <p className="text-gray-600 font-bold uppercase text-[9px]">Monthly cost</p>
                          <p className="text-white font-extrabold mt-0.5">₹{p.priceMonthly}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-bold uppercase text-[9px]">Lifetime cost</p>
                          <p className="text-white font-extrabold mt-0.5">₹{p.priceLifetime}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-bold uppercase text-[9px]">File quota</p>
                          <p className="text-white font-bold mt-0.5">{p.transferLimit} limit</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-bold uppercase text-[9px]">Storage</p>
                          <p className="text-white font-bold mt-0.5">{p.storageLimit}</p>
                        </div>
                      </div>

                      {/* Tool Permissions mapped preview */}
                      <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-gray-600 font-bold uppercase mr-1">Bound Sandboxes:</span>
                        {p.toolAccess.length === 0 ? (
                          <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">None</span>
                        ) : (
                          p.toolAccess.map(tid => {
                            const foundTool = allTools.find(t => t.id === tid);
                            return (
                              <span key={tid} className="text-[10px] bg-cyan-950/40 border border-cyan-500/10 px-2 py-0.5 rounded text-cyan-400 font-mono">
                                {foundTool ? foundTool.name : tid}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="flex gap-2.5 shrink-0 justify-end md:border-l md:border-white/5 md:pl-6">
                      <button 
                        onClick={() => handleSelectPlanForEditing(p)}
                        className="text-gray-400 hover:text-white p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                        title="Edit Plan Settings"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePlan(p.id, p.name)}
                        className="text-red-400 hover:text-red-300 p-2.5 bg-red-950/20 hover:bg-red-900/20 border border-red-500/10 rounded-xl transition-all"
                        title="Delete Plan Config"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Input Form */}
              <div className="bg-[#050505]/75 border border-white/10 rounded-2xl p-6 relative">
                <h4 className="text-base font-bold text-white mb-6 border-b border-white/5 pb-3">
                  {editingPlan ? `Edit Model: ${editingPlan.name}` : 'Setup New Pricing Tier'}
                </h4>

                <form onSubmit={handleSavePlan} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Plan Name Archetype</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Startup Plan"
                      value={editingPlanForm.name}
                      onChange={(e) => setEditingPlanForm({ ...editingPlanForm, name: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Monthly (₹)</label>
                      <input 
                        type="number" 
                        required
                        value={editingPlanForm.priceMonthly}
                        onChange={(e) => setEditingPlanForm({ ...editingPlanForm, priceMonthly: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Lifetime (₹)</label>
                      <input 
                        type="number" 
                        required
                        value={editingPlanForm.priceLifetime}
                        onChange={(e) => setEditingPlanForm({ ...editingPlanForm, priceLifetime: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Monthly Purchases</label>
                      <input 
                        type="number" 
                        required
                        value={editingPlanForm.transferLimit}
                        onChange={(e) => setEditingPlanForm({ ...editingPlanForm, transferLimit: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Storage Allocation</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. 50 GB"
                        value={editingPlanForm.storageLimit}
                        onChange={(e) => setEditingPlanForm({ ...editingPlanForm, storageLimit: e.target.value })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Trial Period Days</label>
                      <input 
                        type="number" 
                        required
                        value={editingPlanForm.trialDays}
                        onChange={(e) => setEditingPlanForm({ ...editingPlanForm, trialDays: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Status</label>
                      <select 
                        value={editingPlanForm.status}
                        onChange={(e) => setEditingPlanForm({ ...editingPlanForm, status: e.target.value as any })}
                        className="w-full bg-[#0d1527] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        <option value="ACTIVE">ACTIVE (Display Onsite)</option>
                        <option value="INACTIVE">DISABLED (Archived)</option>
                      </select>
                    </div>
                  </div>

                  {/* Sandboxes tool access permissions toggle list */}
                  <div className="border border-white/5 bg-black/35 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Included Toolboxes</p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                      {allTools.map(t => {
                        const isGranted = (editingPlanForm.toolAccess || []).includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleToolAccess(t.id)}
                            className="flex items-center justify-between w-full p-2 rounded hover:bg-white/5 text-left text-xs text-gray-300 font-mono"
                          >
                            <span>{t.name}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isGranted ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-white/20'}`}>
                              {isGranted && <Check className="w-3 h-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comma-separated dynamic checklist features list */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Selected High-Yield Marketing Tags</label>
                    <div className="grid grid-cols-1 gap-1.5 text-xs">
                      {[
                        'P2P File Transfer',
                        'Public Sandbox Access',
                        'Decentralized Channels',
                        'JWT Utility Validator',
                        'Support Link Sandbox',
                        'Neural Weight Evaluator',
                        'Unlimited Concurrent Tunnels'
                      ].map(featText => {
                        const isIncluded = (editingPlanForm.premiumFeatures || []).includes(featText);
                        return (
                          <button
                            key={featText}
                            type="button"
                            onClick={() => togglePremiumFeature(featText)}
                            className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 text-left"
                          >
                            <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${isIncluded ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-white/20'}`}>
                              {isIncluded && <Check className="w-3 h-3" />}
                            </div>
                            <span className="text-gray-400 text-[11px]">{featText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" isLoading={loading} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider py-3">
                      {editingPlan ? 'Settle Changes' : 'Inject Plan Parameters'}
                    </Button>
                    {editingPlan && (
                      <button 
                        type="button" 
                        onClick={() => handleSelectPlanForEditing(null)}
                        className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-xl text-xs uppercase font-extrabold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB: ROLE &archetype MANAGEMENT */}
        {currentUser?.role === UserRole.ADMIN && activeTab === 'roles' && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center bg-[#050505]/40 border border-white/5 p-4 rounded-xl">
              <div>
                <h3 className="font-bold text-white text-base">Security Archetypes Directory</h3>
                <p className="text-xs text-gray-500">Currently managing {roles.length} role groups dynamically.</p>
              </div>
              <button 
                onClick={() => handleSelectRoleForEditing(null)}
                className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold uppercase tracking-wide px-4 py-2.5 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Configure New Role
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Role List */}
              <div className="lg:col-span-2 space-y-4">
                {roles.map(r => (
                  <div key={r.id} className="bg-[#050505]/65 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-white leading-none">{r.name}</h4>
                        <span className="text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-500/10 px-2 py-0.5 rounded-full font-mono">
                          ID: {r.id}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">{r.description}</p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-4 items-center">
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mr-1.5">Authority Nodes:</span>
                        {r.permissions.map(pKey => {
                          const matchedPerm = availablePermissions.find(p => p.key === pKey);
                          return (
                            <span key={pKey} className="text-[10px] bg-indigo-950/40 border border-indigo-500/10 text-indigo-400 rounded px-2.5 py-0.5 font-mono">
                              {matchedPerm ? matchedPerm.label : pKey}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0 md:border-l md:border-white/5 md:pl-6 justify-end">
                      <button 
                        onClick={() => handleSelectRoleForEditing(r)}
                        className="text-gray-400 hover:text-white p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteRole(r.id, r.name)}
                        className="text-red-400 hover:text-red-300 p-2.5 bg-red-950/20 hover:bg-red-900/20 border border-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Form */}
              <div className="bg-[#050505]/75 border border-white/10 rounded-2xl p-6">
                <h4 className="text-base font-bold text-white mb-6 border-b border-white/5 pb-3">
                  {editingRole ? `Structure: ${editingRole.name}` : 'Assemble Dynamic Authority'}
                </h4>

                <form onSubmit={handleSaveRole} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Role Identifier Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Technical Director"
                      value={editingRoleForm.name}
                      onChange={(e) => setEditingRoleForm({ ...editingRoleForm, name: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 animate-pulse">Scope / Mandate Description</label>
                    <textarea 
                      rows={2}
                      required
                      placeholder="Specify typical audience and responsibilities..."
                      value={editingRoleForm.description}
                      onChange={(e) => setEditingRoleForm({ ...editingRoleForm, description: e.target.value })}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Checkbox authorities lists */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Configure Permission Matrices</label>
                    <div className="bg-black/35 border border-white/5 p-4 rounded-xl space-y-2">
                      {availablePermissions.map(chk => {
                        const isChecked = (editingRoleForm.permissions || []).includes(chk.key);
                        return (
                          <button
                            type="button"
                            key={chk.key}
                            onClick={() => toggleRolePermission(chk.key)}
                            className="flex items-center justify-between w-full text-left p-1 rounded hover:bg-white/5"
                          >
                            <span className="text-xs text-gray-400 font-mono">{chk.label}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-white/20'}`}>
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" isLoading={loading} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider py-3">
                      {editingRole ? 'Update Role' : 'Inject Role Schema'}
                    </Button>
                    {editingRole && (
                      <button 
                        type="button" 
                        onClick={() => handleSelectRoleForEditing(null)}
                        className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-xl text-xs uppercase font-extrabold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB: FEATURE FLAGS switcher */}
        {currentUser?.role === UserRole.ADMIN && activeTab === 'features' && (
          <div className="bg-[#050505]/75 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Hot Module Switches
                </h3>
                <p className="text-xs text-gray-500">Enable or disable major website subsystems dynamically without updating code or redeploying builds.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map(f => (
                <div key={f.id} className="bg-black/30 border border-white/5 p-5 rounded-2xl hover:border-cyan-500/10 transition-all flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{f.name}</span>
                      <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-500 font-mono uppercase tracking-wider">
                        {f.key}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {f.description}
                    </p>
                  </div>

                  <button 
                    onClick={() => handleToggleFeature(f.id, f.enabled)}
                    className="shrink-0 p-1 rounded-full text-transparent hover:text-white relative"
                  >
                    {f.enabled ? (
                      <div className="flex items-center gap-1 bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold py-1 px-2.5 rounded-full filter hover:brightness-110 shadow-sm shadow-cyan-500/10 transition-all">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                        ACTIVE
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-red-950/50 border border-red-500/20 text-red-400 text-[10px] font-bold py-1 px-2.5 rounded-full hover:brightness-110 transition-all">
                        DISABLED
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: STANDARD PROFILE (For both administrators & client customers) */}
        {(currentUser?.role === UserRole.CLIENT || activeTab === 'profile') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Preferences Panel */}
            <div className="bg-[#111827] rounded-xl border border-gray-800 p-6 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-green-500" />
                Notification Subcategories
              </h3>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">System Email Metrics</p>
                    <p className="text-xs text-gray-500">Receive alerts on logins and activities.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setEmailNotifs(!emailNotifs)}
                  >
                    {emailNotifs ? (
                      <ToggleRight className="w-8 h-8 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-600" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">Real-time Safety Messages</p>
                    <p className="text-xs text-gray-500">Security breach notification triggers.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSecurityAlerts(!securityAlerts)}
                  >
                    {securityAlerts ? (
                      <ToggleRight className="w-8 h-8 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-600" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">Marketing and Updates</p>
                    <p className="text-xs text-gray-500">Receive promotional emails with discount coupon codes.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setMarketingEmails(!marketingEmails)}
                  >
                    {marketingEmails ? (
                      <ToggleRight className="w-8 h-8 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-600" />
                    )}
                  </button>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Button onClick={handleSavePreferences} className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs uppercase font-extrabold py-3 px-6">
                    Save preferences
                  </Button>
                </div>
              </div>
            </div>

            {/* Password Credentials */}
            <div className="bg-[#111827] rounded-xl border border-gray-800 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-500" />
                  Credentials Settings
                </h3>

                <form onSubmit={handlePasswordChange} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Current Password</label>
                    <input 
                      type="password" 
                      required
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 font-mono">New Password</label>
                    <input 
                      type="password" 
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 font-mono">Confirm New Password</label>
                    <input 
                      type="password" 
                      required
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 border-0 text-xs font-extrabold uppercase py-3.5">
                      Update accounts password
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
