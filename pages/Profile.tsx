import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getCurrentUser, updateUserProfile } from '../services/mockBackend';
import { Button } from '../components/Button';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      setName(u.name);
      setEmail(u.email);
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updated = await updateUserProfile(user.id, { name, email });
      setUser(updated);
      setSuccessMsg('Profile updated successfully.');
      
      // Dispatch custom event if other components need to know user changed immediately
      window.dispatchEvent(new Event('storage')); 
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-gray-400">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-bold text-white">My Profile</h2>
           <p className="text-gray-400 mt-1">Manage your account details and public profile info.</p>
        </div>
        <div className="bg-[#1F2937] px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${user.role === UserRole.ADMIN ? 'bg-purple-500' : 'bg-green-500'}`}></div>
            <span className="text-sm font-bold text-gray-300 uppercase tracking-wide">{user.role} Account</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar Card */}
        <div className="lg:col-span-1">
            <div className="bg-[#111827] rounded-xl border border-gray-800 p-6 shadow-lg text-center">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-5xl font-bold text-white shadow-2xl mb-4 border-4 border-[#1F2937]">
                    {user.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                <p className="text-gray-500 text-sm mb-6">{user.email}</p>
                
                <div className="border-t border-gray-800 pt-6 text-left space-y-3">
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-400">User ID</span>
                      <span className="text-gray-300 font-mono text-xs bg-gray-900 px-2 py-1 rounded">{user.id}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Joined</span>
                      <span className="text-gray-300">Oct 2023</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status</span>
                      <span className="text-green-400">Active</span>
                   </div>
                </div>
            </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
            <div className="bg-[#111827] rounded-xl border border-gray-800 p-8 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6">Edit Details</h3>
                
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-2">Changing email will require re-verification.</p>
                    </div>

                    {successMsg && (
                        <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            <span className="text-green-400 text-sm">{successMsg}</span>
                        </div>
                    )}

                    {errorMsg && (
                         <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span className="text-red-400 text-sm">{errorMsg}</span>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" isLoading={loading} className="px-8 bg-blue-600 hover:bg-blue-500">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;