import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { getCompanySettings, submitContactMessage } from '../services/mockBackend';
import { CompanySettings, User } from '../types';
import { Link } from 'react-router-dom';

interface PageProps {
  user?: User | null;
  onLogout?: () => void;
}

const Contact: React.FC<PageProps> = ({ user, onLogout }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<CompanySettings>({
    address: 'Loading...',
    email: 'Loading...',
    phone: 'Loading...',
    hours: 'Loading...'
  });

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getCompanySettings().then(setSettings);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await submitContactMessage({
            firstName,
            lastName,
            email,
            subject,
            message
        });
        setSubmitted(true);
    } catch (error) {
        alert("Failed to send message. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-[#0B1121] min-h-screen font-sans text-white">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-6">Get in touch</h1>
            <p className="text-lg text-gray-400 mb-8">
              Whether you have a question about our services, pricing, or want to discuss a new project, our team is ready to answer all your questions.
            </p>

            <div className="space-y-6">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#111827] rounded-lg flex items-center justify-center text-blue-500 border border-gray-800 flex-shrink-0">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <div>
                     <h3 className="font-bold text-white">Headquarters</h3>
                     <p className="text-gray-400 mt-1 whitespace-pre-wrap">
                        {settings.address}
                     </p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#111827] rounded-lg flex items-center justify-center text-blue-500 border border-gray-800 flex-shrink-0">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                     <h3 className="font-bold text-white">Email Us</h3>
                     <p className="text-gray-400 mt-1">
                        {settings.email}
                     </p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#111827] rounded-lg flex items-center justify-center text-blue-500 border border-gray-800 flex-shrink-0">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <div>
                     <h3 className="font-bold text-white">Call Us</h3>
                     <p className="text-gray-400 mt-1">
                        {settings.phone}<br />
                        {settings.hours}
                     </p>
                  </div>
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800 shadow-2xl">
             {!submitted ? (
               <form onSubmit={handleSubmit} className="space-y-6">
                 <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                       <input 
                           type="text" 
                           required 
                           value={firstName}
                           onChange={e => setFirstName(e.target.value)}
                           className="w-full rounded-lg bg-[#1F2937] border-gray-700 border p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                       <input 
                           type="text" 
                           required 
                           value={lastName}
                           onChange={e => setLastName(e.target.value)}
                           className="w-full rounded-lg bg-[#1F2937] border-gray-700 border p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full rounded-lg bg-[#1F2937] border-gray-700 border p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                    <select 
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full rounded-lg bg-[#1F2937] border-gray-700 border p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    >
                       <option>General Inquiry</option>
                       <option>Project Proposal</option>
                       <option>Support</option>
                       <option>Careers</option>
                    </select>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                    <textarea 
                        rows={4} 
                        required 
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className="w-full rounded-lg bg-[#1F2937] border-gray-700 border p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    ></textarea>
                 </div>

                 <Button type="submit" isLoading={loading} className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/50">Send Message</Button>
               </form>
             ) : (
                <div className="text-center py-20">
                   <div className="w-16 h-16 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-800">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                   <p className="text-gray-400">Thank you for contacting RSTECHLAB. We will get back to you shortly.</p>
                   <button onClick={() => { setSubmitted(false); setFirstName(''); setLastName(''); setEmail(''); setMessage(''); }} className="mt-6 text-blue-400 font-medium hover:text-blue-300 underline">Send another message</button>
                </div>
             )}
          </div>
        </div>
      </div>
      
      <footer className="bg-[#050911] border-t border-white/10 pt-20 pb-10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
               <div className="col-span-1 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-6">
                     <span className="text-cyan-500 font-bold text-lg">{'< >'}</span>
                     <span className="text-xl font-bold text-white tracking-wide uppercase">RSTECHLAB</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                     Empowering the next generation of builders with premium software and hardware.
                  </p>
               </div>

               <div>
                  <h4 className="text-white font-bold mb-6">Platform</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                     <li><Link to="/products" className="hover:text-white transition-colors">Software Marketplace</Link></li>
                     <li><Link to="/electronics" className="hover:text-white transition-colors">Electronics Hub</Link></li>
                     <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold mb-6">Company</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                     <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                     <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                     <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold mb-6">Stay Updated</h4>
                  <div className="flex">
                     <input 
                        type="email" 
                        placeholder="Email address" 
                        className="bg-[#111] text-white text-sm px-4 py-3 rounded-l-lg border border-white/10 focus:outline-none focus:border-cyan-500 w-full"
                     />
                     <button className="bg-cyan-600 px-4 rounded-r-lg hover:bg-cyan-500 transition-colors text-white">
                        →
                     </button>
                  </div>
               </div>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-gray-600 text-sm">© 2025 RSTECHLAB. All rights reserved.</p>
               <div className="flex gap-6 text-sm text-gray-600">
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Contact;