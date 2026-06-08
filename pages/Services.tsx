import React from 'react';
import { Navbar } from '../components/Navbar';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface PageProps {
  user?: User | null;
  onLogout?: () => void;
}

const Services: React.FC<PageProps> = ({ user, onLogout }) => {
  const services = [
    {
      title: "Custom Software Development",
      description: "We build tailored software solutions that address your unique business challenges, from CRM systems to enterprise ERPs.",
      icon: "💻"
    },
    {
      title: "Mobile App Development",
      description: "Reach your customers on the go with native iOS and Android apps, or cross-platform solutions using React Native and Flutter.",
      icon: "📱"
    },
    {
      title: "Cloud & DevOps",
      description: "Optimize your infrastructure with AWS, Azure, or Google Cloud. We implement CI/CD pipelines and scalable architecture.",
      icon: "☁️"
    },
    {
      title: "UI/UX Design",
      description: "Create intuitive and engaging user experiences. Our design team focuses on usability and modern aesthetics.",
      icon: "🎨"
    },
    {
      title: "AI & Machine Learning",
      description: "Leverage the power of data. We integrate AI models, chatbots, and predictive analytics into your business workflows.",
      icon: "🤖"
    },
    {
      title: "SaaS Product Development",
      description: "Have a product idea? We help startups and enterprises build, launch, and scale successful SaaS platforms.",
      icon: "🚀"
    }
  ];

  return (
    <div className="bg-[#0B1121] min-h-screen font-sans text-white">
      <Navbar user={user} onLogout={onLogout} />

      {/* Header */}
      <div className="relative py-24 text-center overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-[#111827] to-[#0B1121]"></div>
         <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
               Our <span className="text-blue-500">Services</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto px-4 text-lg">
               Comprehensive technology solutions designed to help your business grow and succeed in the digital age.
            </p>
         </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-[#111827] p-8 rounded-xl border border-gray-800 hover:border-blue-500/50 hover:bg-[#1a2333] transition-all duration-300 group">
              <div className="text-4xl mb-6 bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-gray-700 group-hover:border-blue-500">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{service.title}</h3>
              <p className="text-gray-400 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Process Section */}
      <div className="py-20 border-t border-gray-800 bg-[#0f1623]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white">How We Work</h2>
           </div>
           <div className="grid md:grid-cols-4 gap-8 text-center relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-800 -z-10"></div>
              
              {[
                  { id: '01', title: 'Discovery', desc: 'We analyze your requirements and plan the roadmap.' },
                  { id: '02', title: 'Design', desc: 'We create prototypes and finalize the user experience.' },
                  { id: '03', title: 'Development', desc: 'Agile coding sprints with regular updates and testing.' },
                  { id: '04', title: 'Launch', desc: 'Deployment, training, and ongoing support.' }
              ].map((step) => (
                  <div key={step.id}>
                    <div className="w-24 h-24 bg-[#111827] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-gray-800 shadow-xl relative z-10">
                        <span className="text-2xl font-bold text-blue-500">{step.id}</span>
                    </div>
                    <h4 className="font-bold text-lg mb-2 text-white">{step.title}</h4>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 text-center border-t border-gray-800 relative overflow-hidden">
         <div className="absolute inset-0 bg-blue-900/10"></div>
         <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4 text-white">Have a project in mind?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">Let's discuss how RSTECHLAB can help bring your vision to life.</p>
            <Link to="/contact" className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-md hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25">
               Start a Conversation
            </Link>
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

export default Services;