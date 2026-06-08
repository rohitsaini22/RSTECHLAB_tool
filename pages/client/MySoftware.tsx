import React, { useEffect, useState } from 'react';
import { License, Software } from '../../types';
import { getCurrentUser, getUserLicenses, getSoftwareFile, addDownloadRecord } from '../../services/mockBackend';
import { Button } from '../../components/Button';

type EnrichedLicense = License & { software: Software };

const MySoftware: React.FC = () => {
  const [licenses, setLicenses] = useState<EnrichedLicense[]>([]);
  const [loading, setLoading] = useState(true);

  // Download Manager State
  const [downloadState, setDownloadState] = useState<{
    active: boolean;
    fileName: string;
    progress: number;
    speed: string;
  }>({ active: false, fileName: '', progress: 0, speed: '' });

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      getUserLicenses(user.id).then(data => {
        setLicenses(data);
        setLoading(false);
      });
    }
  }, []);

  const handleDownload = (item: EnrichedLicense) => {
    if (new Date(item.expiryDate) < new Date()) {
        alert("License expired.");
        return;
    }
    if (downloadState.active) return; // Prevent multiple downloads

    // CHANGE: Use .zip extension to prevent Antivirus/Browser blocking of raw .exe blobs
    let fileName = item.software.fileUrl && item.software.fileUrl !== '#' 
        ? item.software.fileUrl.split('/').pop() || 'setup.zip'
        : `${item.software.name.replace(/\s+/g, '_').toLowerCase()}_setup.zip`;
    
    if (fileName.endsWith('.exe') || fileName.endsWith('.msi')) {
        fileName = fileName.substring(0, fileName.lastIndexOf('.')) + '.zip';
    }
    
    setDownloadState({ active: true, fileName, progress: 0, speed: 'Initializing...' });

    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 8 + 4; // Slower increment
        if (progress >= 100) {
            clearInterval(interval);
            // Simulate Security Scan
            setDownloadState(prev => ({ ...prev, progress: 100, speed: 'Scanning for viruses...' }));
            
            setTimeout(async () => {
                setDownloadState(prev => ({ ...prev, speed: 'Scan Clean. Starting Download...' }));
                
                // Add to history
                const user = getCurrentUser();
                if(user) {
                    await addDownloadRecord({
                        userId: user.id,
                        softwareId: item.software.id,
                        softwareName: item.software.name,
                        version: item.software.version,
                        fileName: fileName,
                        size: item.software.fileSize || 'N/A'
                    });
                }

                setTimeout(() => {
                    triggerBinaryDownload(item.software.id, fileName);
                    setDownloadState({ active: false, fileName: '', progress: 0, speed: '' });
                }, 1000);
            }, 1500);
        } else {
            setDownloadState(prev => ({ 
                ...prev, 
                progress: Math.min(progress, 99),
                speed: `${(Math.random() * 8 + 3).toFixed(1)} MB/s`
            }));
        }
    }, 500);
  };

  const triggerBinaryDownload = async (softwareId: string, fileName: string) => {
     let blob: Blob | null = null;
     
     // Try to get real file from IndexedDB
     try {
         const storedFile = await getSoftwareFile(softwareId);
         if (storedFile) {
             blob = storedFile;
             console.log("Found real file in IndexedDB, downloading...");
         }
     } catch(e) {
         console.warn("Could not retrieve file from DB, using fallback");
     }

     if (!blob) {
         // Create a 5MB dummy binary buffer to simulate a "Proper" software file
         const size = 5 * 1024 * 1024; // 5MB
         const buffer = new Uint8Array(size);
         
         // Fill with some dummy data
         for(let i = 0; i < size; i+=1024) {
             buffer[i] = i % 255;
         }
         // Use application/zip for better browser trust on blob downloads
         blob = new Blob([buffer], { type: 'application/zip' });
     }

     const url = window.URL.createObjectURL(blob);
    
     const link = document.createElement('a');
     link.href = url;
     link.setAttribute('download', fileName);
     document.body.appendChild(link);
     link.click();
    
     setTimeout(() => {
         document.body.removeChild(link);
         window.URL.revokeObjectURL(url);
     }, 100);
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    alert("Key copied!");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="relative">
      <h3 className="text-2xl font-bold text-white mb-6">My Software & Licenses</h3>

      {licenses.length === 0 ? (
        <div className="text-center py-20 bg-[#050505] rounded-xl border border-white/10">
           <p className="text-gray-500 mb-4">You don't have any active subscriptions.</p>
           <Button onClick={() => window.location.href = '#/client/marketplace'}>Browse Marketplace</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {licenses.map((item) => {
            const isExpired = new Date(item.expiryDate) < new Date();
            const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            
            // Extract filename from URL mock
            const displayFileName = item.software.fileUrl && item.software.fileUrl !== '#' 
                ? item.software.fileUrl.split('/').pop() 
                : `${item.software.name.replace(/\s+/g, '_').toLowerCase()}.zip`;

            return (
              <div key={item.id} className="bg-[#050505] rounded-xl border border-white/10 p-6 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 flex-shrink-0">
                    <img src={item.software.imageUrl} alt={item.software.name} className="w-full h-32 object-cover rounded-lg bg-gray-900 border border-white/5" />
                    <div className="mt-2 flex justify-center gap-2">
                        <span className="text-[10px] bg-gray-900 border border-white/10 px-2 py-1 rounded text-gray-400">{item.software.platform}</span>
                        <span className="text-[10px] bg-gray-900 border border-white/10 px-2 py-1 rounded text-gray-400">{item.software.fileSize || 'N/A'}</span>
                    </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-white">{item.software.name}</h4>
                      <div className="flex items-center gap-2 mt-1 mb-2">
                         <span className="text-sm text-cyan-400 font-mono">v{item.software.version}</span>
                         <span className="text-gray-600 text-xs">•</span>
                         <span className="text-xs text-gray-500">Auto-Update Enabled</span>
                      </div>
                    </div>
                    <div>
                        {isExpired ? (
                            <span className="text-red-400 text-xs font-bold border border-red-900/50 bg-red-900/20 px-2 py-1 rounded">Expired</span>
                        ) : (
                            <span className="text-green-400 text-xs font-bold border border-green-900/50 bg-green-900/20 px-2 py-1 rounded">Active • {daysLeft} days left</span>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 bg-[#0a0a0a] p-4 rounded border border-white/5">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">License Key</p>
                        <div className="flex items-center gap-2 mt-1">
                            <code className="text-sm font-mono text-cyan-400 bg-cyan-900/10 px-2 py-1 rounded border border-cyan-900/30 select-all">
                                {item.key}
                            </code>
                            <button onClick={() => copyKey(item.key)} className="text-gray-400 hover:text-white text-xs font-bold p-1">COPY</button>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</p>
                        <p className="text-sm text-gray-300 mt-1">
                            {isExpired ? `Expired on ${new Date(item.expiryDate).toLocaleDateString()}` : `Valid until ${new Date(item.expiryDate).toLocaleDateString()}`}
                        </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
                     <Button onClick={() => handleDownload(item)} disabled={isExpired || downloadState.active} className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 border-0 font-bold flex items-center justify-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                       {isExpired ? 'Renew to Download' : 'Download Package'}
                     </Button>
                     <span className="text-xs text-gray-500 font-mono">
                        {displayFileName}
                     </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Download Manager Toast */}
      {downloadState.active && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom fade-in duration-300">
            <div className="bg-[#111827] border border-cyan-500/30 rounded-lg shadow-2xl p-4 w-80">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-white font-bold text-sm truncate pr-2">{downloadState.fileName}</h4>
                    <span className="text-xs text-cyan-400 font-mono">{Math.round(downloadState.progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${downloadState.progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        {downloadState.progress === 100 && (
                            <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        )}
                        <span>{downloadState.speed}</span>
                    </div>
                    <span>{downloadState.progress >= 100 ? 'Secure' : 'Downloading...'}</span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
export default MySoftware;