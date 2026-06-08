import React, { useEffect, useState } from 'react';
import { Job } from '../../types';
import { getJobs, addJob, updateJob, deleteJob } from '../../services/mockBackend';
import { Button } from '../../components/Button';

const ManageCareers: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('Remote');
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Internship'>('Full-time');
  const [tags, setTags] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    const data = await getJobs();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();

    const handleUpdate = () => fetchJobs();
    window.addEventListener('jobs-updated', handleUpdate);
    return () => window.removeEventListener('jobs-updated', handleUpdate);
  }, []);

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  }

  const openEditModal = (job: Job) => {
    setEditId(job.id);
    setTitle(job.title);
    setDepartment(job.department);
    setLocation(job.location);
    setType(job.type);
    setTags(job.tags.join(', '));
    setIsActive(job.isActive);
    setIsModalOpen(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');

    const payload = {
        title,
        department,
        location,
        type,
        tags: tagsArray,
        isActive
    };

    if (editId) {
        await updateJob(editId, payload);
    } else {
        await addJob(payload);
    }

    setIsModalOpen(false);
    resetForm();
    await fetchJobs();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      setDeletingId(id);
      try {
        // Optimistic update
        setJobs(prev => prev.filter(item => item.id !== id));
        await deleteJob(id);
      } catch (error) {
        console.error("Failed to delete job:", error);
        alert("Failed to delete job. Please try again.");
        await fetchJobs();
      } finally {
        setDeletingId(null);
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setDepartment('');
    setLocation('Remote');
    setType('Full-time');
    setTags('');
    setIsActive(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Manage Careers</h3>
        <Button onClick={openAddModal}>+ Post New Job</Button>
      </div>

      <div className="bg-[#050505] shadow-lg rounded-xl border border-white/10 overflow-hidden">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Position</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Department</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-white">{job.title}</div>
                  <div className="text-xs text-gray-500">{job.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {job.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {job.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {job.isActive ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                        </span>
                    ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Closed
                        </span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openEditModal(job)} className="text-cyan-400 hover:text-cyan-300 mr-4 font-bold">Edit</button>
                  <button 
                    onClick={() => handleDelete(job.id)} 
                    disabled={deletingId === job.id}
                    className={`${deletingId === job.id ? 'text-gray-500 cursor-not-allowed' : 'text-red-400 hover:text-red-300'} font-bold`}
                  >
                    {deletingId === job.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No job postings found.</td>
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
                <h3 className="text-xl leading-6 font-bold text-white mb-6">{editId ? 'Edit Job' : 'Post New Job'}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Job Title</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm" placeholder="e.g. Senior Developer" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Department</label>
                        <input type="text" required value={department} onChange={e => setDepartment(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none text-sm" placeholder="e.g. Engineering" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Job Type</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none text-sm">
                           <option>Full-time</option>
                           <option>Part-time</option>
                           <option>Contract</option>
                           <option>Internship</option>
                        </select>
                     </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Location</label>
                    <input type="text" required value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none text-sm" placeholder="e.g. Remote / New York" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tags / Requirements</label>
                    <input 
                        type="text" 
                        placeholder="React, Node.js, Teamwork (comma separated)" 
                        value={tags} 
                        onChange={e => setTags(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none text-sm" 
                    />
                  </div>

                  <div className="flex items-center">
                    <input 
                        id="active-check"
                        type="checkbox" 
                        checked={isActive} 
                        onChange={e => setIsActive(e.target.checked)}
                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded" 
                    />
                    <label htmlFor="active-check" className="ml-2 block text-sm text-gray-300">
                        Listing is Active
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex gap-3 pt-4 border-t border-white/10">
                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold border-0" isLoading={loading}>{editId ? 'Update Posting' : 'Post Job'}</Button>
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

export default ManageCareers;
