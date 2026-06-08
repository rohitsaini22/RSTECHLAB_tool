import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { User, Job } from '../types';
import { Link } from 'react-router-dom';
import { getJobs } from '../services/mockBackend';

interface PageProps {
  user?: User | null;
  onLogout?: () => void;
}

const Careers: React.FC<PageProps> = ({ user, onLogout }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
        const data = await getJobs();
        // Filter only active jobs
        setJobs(data.filter(job => job.isActive));
        setLoading(false);
    };
    fetchJobs();
  }, []);

  const scrollToOpenings = () => {
    const element = document.getElementById('openings');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#0B1121] min-h-screen font-sans text-white">
      <Navbar user={user} onLogout={onLogout} />

      {/* Hero Section */}
      <div className="relative py-32 overflow-hidden flex items-center justify-center text-center">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] via-[#0B1121]/80 to-transparent"></div>
         
         <div className="relative z-10 max-w-4xl px-4">
            <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm mb-4 block">We are hiring</span>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
               Build the future of <br/>
               <span className="text-white">Tech & Hardware</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
               Join a team of builders, creators, and innovators. We are on a mission to democratize access to powerful software and hardware tools.
            </p>
            <button onClick={scrollToOpenings} className="inline-block bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition-transform hover:-translate-y-1 shadow-lg">
               View Open Positions
            </button>
         </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-[#111827]">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-blue-500/30">🚀</div>
                  <h3 className="text-xl font-bold mb-2">Innovation First</h3>
                  <p className="text-gray-400 text-sm">We don't just follow trends; we set them. We encourage experimentation and bold ideas.</p>
               </div>
               <div className="text-center p-6">
                  <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-purple-500/30">🤝</div>
                  <h3 className="text-xl font-bold mb-2">Collaborative Spirit</h3>
                  <p className="text-gray-400 text-sm">Great things are never done by one person. We win together and learn together.</p>
               </div>
               <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-green-500/30">🌍</div>
                  <h3 className="text-xl font-bold mb-2">Global Impact</h3>
                  <p className="text-gray-400 text-sm">Our tools are used by developers and engineers in over 50 countries.</p>
               </div>
            </div>
         </div>
      </div>

      {/* Job Listings */}
      <div id="openings" className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
         <h2 className="text-3xl font-bold mb-12 border-l-4 border-cyan-500 pl-4">Open Positions</h2>
         
         {loading ? (
             <div className="text-center py-10 text-gray-500">Loading openings...</div>
         ) : (
             <div className="space-y-4">
                {jobs.length === 0 ? (
                    <p className="text-gray-400">There are currently no open positions. Please check back later.</p>
                ) : (
                    jobs.map((job) => (
                    <div key={job.id} className="group bg-[#111827] border border-gray-800 p-6 rounded-xl hover:border-cyan-500/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{job.title}</h3>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg> {job.department}</span>
                                <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> {job.location}</span>
                                <span className="bg-gray-800 px-2 py-0.5 rounded text-xs text-gray-300 border border-gray-700">{job.type}</span>
                            </div>
                            <div className="mt-3 flex gap-2">
                                {job.tags.map(tag => (
                                <span key={tag} className="text-xs bg-blue-900/20 text-blue-300 px-2 py-1 rounded border border-blue-900/30">
                                    {tag}
                                </span>
                                ))}
                            </div>
                        </div>
                        <Link to="/contact">
                            <button className="px-6 py-2 border border-white/20 rounded-lg text-sm font-bold hover:bg-white hover:text-black transition-colors whitespace-nowrap">
                                Apply Now
                            </button>
                        </Link>
                    </div>
                    ))
                )}
             </div>
         )}

         <div className="mt-12 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-white/10 text-center">
            <h3 className="text-xl font-bold mb-2">Don't see a role that fits?</h3>
            <p className="text-gray-400 mb-6">We are always looking for talented individuals to join our network.</p>
            <Link to="/contact" className="text-cyan-400 hover:text-cyan-300 font-bold underline">Send us your resume</Link>
         </div>
      </div>

      <footer className="bg-[#050911] text-gray-600 py-8 text-center text-sm border-t border-gray-900">
         <p>© 2024 RSTECHLAB. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Careers;