import React, { useEffect, useState } from 'react';
import { DownloadRecord } from '../../types';
import { getDownloadHistory, getCurrentUser } from '../../services/mockBackend';

const Downloads: React.FC = () => {
  const [history, setHistory] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = getCurrentUser();
      if (user) {
        const data = await getDownloadHistory(user.id);
        setHistory(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleOpenFolder = (fileName: string) => {
      alert(`Opening folder location for: ${fileName}`);
  };

  const handleDeleteRecord = (id: string) => {
      // For mock, just remove from local state view
      if(confirm('Remove this record from history?')) {
          setHistory(prev => prev.filter(item => item.id !== id));
      }
  };

  if (loading) return <div>Loading downloads...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Download Center</h3>
          <span className="text-gray-500 text-sm">Secure Transfer Protocol</span>
      </div>

      <div className="bg-[#050505] shadow-xl rounded-xl border border-white/10 overflow-hidden">
        {history.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
                <div className="mb-4 text-6xl opacity-20">⬇️</div>
                <p>No download history found.</p>
                <p className="text-sm mt-2">Go to My Software to download your products.</p>
            </div>
        ) : (
            <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">File Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Software</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Security</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {history.map((record) => (
                        <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-900/20 text-blue-400 rounded flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <span className="text-sm font-medium text-white">{record.fileName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-300">{record.softwareName}</div>
                                <div className="text-xs text-gray-500">v{record.version}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                {record.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                    record.securityScanResult === 'CLEAN' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-red-900/20 text-red-400 border-red-900/50'
                                }`}>
                                    {record.securityScanResult === 'CLEAN' ? '✓ Clean' : '⚠️ Threat'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleOpenFolder(record.fileName)} className="text-cyan-400 hover:text-cyan-300 mr-4 text-xs font-bold">Show in Folder</button>
                                <button onClick={() => handleDeleteRecord(record.id)} className="text-gray-500 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default Downloads;
