import React, { useEffect, useState } from 'react';
import { User, UserRole, BusinessPlan } from '../../types';
import { getAllUsers, updateUserProfile, deleteUser, getPlans } from '../../services/mockBackend';
import { Button } from '../../components/Button';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected user for editing in side panel
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form edit states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>(UserRole.CLIENT);
  const [editPlanId, setEditPlanId] = useState('');
  const [editTransferCount, setEditTransferCount] = useState(0);
  const [editBan, setEditBan] = useState(false);
  const [editCustomRole, setEditCustomRole] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, pData] = await Promise.all([
        getAllUsers(),
        getPlans()
      ]);
      setUsers(uData);
      setPlans(pData);
    } catch (err) {
      console.error("Failed to load users/plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenManage = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPlanId(user.planId || 'plan-free');
    setEditTransferCount(user.transferCount || 0);
    setEditBan(user.ban || false);
    setEditCustomRole(user.customRole || '');
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;
    
    const matchedPlan = plans.find(p => p.id === editPlanId);
    const planName = matchedPlan ? matchedPlan.name : 'Free Plan';

    const updates: Partial<User> = {
      name: editName,
      email: editEmail,
      role: editRole,
      planId: editPlanId,
      planName: planName,
      transferCount: editTransferCount,
      ban: editBan,
      customRole: editCustomRole
    };

    try {
      await updateUserProfile(selectedUser.id, updates);
      setSelectedUser(null);
      await loadData();
    } catch (err) {
      alert("Error saving updates: " + err);
    }
  };

  const handleResetUsage = () => {
    setEditTransferCount(0);
  };

  const handleToggleBan = () => {
    setEditBan(!editBan);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you absolutely sure you want to delete this user? This action is permanent.")) {
      try {
        await deleteUser(userId);
        setSelectedUser(null);
        await loadData();
      } catch (err) {
        alert("Error deleting user: " + err);
      }
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.planName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tableHeaderClass = "px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-white/5 border-b border-white/10";
  const cardClass = "bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">User Management</h3>
          <p className="text-sm text-gray-500 mt-1">
            Audit system operators, modify subscription plans, reset usage nodes, and allocate roles.
          </p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search users, emails, plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050505] text-white border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
          />
          <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Users Table Card */}
      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead>
              <tr>
                <th className={tableHeaderClass}>User Identity</th>
                <th className={tableHeaderClass}>System Role</th>
                <th className={tableHeaderClass}>Active Plan</th>
                <th className={tableHeaderClass}>Transfer Count</th>
                <th className={tableHeaderClass}>Account Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider bg-white/5 border-b border-white/10">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#0e0e11]/30 divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-mono text-sm">
                    <span className="inline-block animate-pulse">Synchronizing directory records...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-mono text-sm">
                    No matching user records detected.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isBanned = u.ban === true;
                  const displayRole = u.customRole || u.role;
                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-xl bg-cyan-955 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.05)]">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3.5">
                            <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{u.name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[11px] font-bold font-mono rounded-lg border ${
                          u.role === UserRole.ADMIN 
                            ? 'bg-purple-950/20 text-purple-400 border-purple-500/20' 
                            : 'bg-cyan-950/20 text-cyan-400 border-cyan-500/10'
                        }`}>
                          {displayRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300 font-semibold">{u.planName || 'Free Plan'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-400">
                          {u.transferCount ?? 0} transfers
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
                          isBanned 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isBanned ? 'bg-red-500' : 'bg-green-400'}`}></span>
                          {isBanned ? 'BANNED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button 
                          onClick={() => handleOpenManage(u)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-cyan-500/30 text-white rounded-lg hover:bg-cyan-500 hover:text-black font-semibold text-xs transition-all cursor-pointer"
                        >
                          Manage User
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Slide-over / Side Panel Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedUser(null)}></div>
          
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col bg-[#0b0b0d] border-l border-white/10 shadow-2xl overflow-y-auto">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-[#050505]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Modify Operator Node
                    </h3>
                    <button 
                      onClick={() => setSelectedUser(null)} 
                      className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/5 transition-all"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-950/30 text-cyan-400 flex items-center justify-center font-bold font-mono border border-cyan-500/20">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{selectedUser.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 p-6 space-y-6">
                  {/* Name Edit */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Full Name</label>
                    <input
                      type="text"
                      className="w-full bg-[#050505] text-white border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none transition-all"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>

                  {/* Email Edit */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Email Address</label>
                    <input
                      type="email"
                      className="w-full bg-[#050505] text-white border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none transition-all"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>

                  {/* Subdomain/Auth dynamic pricing tier selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Authorized Subscription Plan</label>
                    <select
                      className="w-full bg-[#050505] text-white border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none transition-all cursor-pointer font-mono"
                      value={editPlanId}
                      onChange={(e) => setEditPlanId(e.target.value)}
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#0b0b0d]">
                          {p.name} (Limit: {p.transferLimit} TF)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role Custom Setup */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">System Role</label>
                      <select
                        className="w-full bg-[#050505] text-white border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none transition-all cursor-pointer font-mono"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                      >
                        <option value={UserRole.CLIENT} className="bg-[#0b0b0d]">CLIENT</option>
                        <option value={UserRole.ADMIN} className="bg-[#0b0b0d]">ADMIN</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Custom Role Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Moderator/Premium"
                        className="w-full bg-[#050505] text-white border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none transition-all font-mono"
                        value={editCustomRole}
                        onChange={(e) => setEditCustomRole(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Transfer Usage Node Reset */}
                  <div className="bg-[#050505] p-4 rounded-xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Usage Track</p>
                        <p className="text-lg font-bold text-white mt-1 font-mono">
                          {editTransferCount} Transfers Filed
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetUsage}
                        className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-black rounded-lg text-red-400 text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        RESET TO 0
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-normal">
                      Manual override clears user transaction queues instantly across active domains.
                    </p>
                  </div>

                  {/* Account Status */}
                  <div className="bg-[#050505] p-4 rounded-xl border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Operator Token Access</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {editBan ? 'This user is currently banned.' : 'Authorized network status.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleBan}
                      className={`px-4 py-1.5 border rounded-lg text-xs font-bold transition-all cursor-pointer font-mono uppercase tracking-wider ${
                        editBan 
                          ? 'bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black' 
                          : 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black'
                      }`}
                    >
                      {editBan ? 'REVOKE BAN' : 'BAN OPERATOR'}
                    </button>
                  </div>

                  {/* Destructive Deletion */}
                  <div className="pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      className="w-full py-2.5 bg-red-6500 border border-red-500/30 hover:bg-red-500 text-red-400 hover:text-black rounded-xl text-xs font-bold tracking-wider font-mono uppercase transition-all cursor-pointer"
                    >
                      PURGE USER RECORD
                    </button>
                  </div>

                </div>

                {/* Bottom Actions footer */}
                <div className="p-6 border-t border-white/10 bg-[#050505] flex gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 py-3 bg-transparent text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    className="flex-1 py-3 bg-cyan-500 text-black hover:bg-cyan-400 rounded-xl text-sm font-extrabold shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
