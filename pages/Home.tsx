import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Search, MessageSquare, Download } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
          Empowering Education Through <span className="text-blue-600">Access</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
          A centralized platform for students and educators to organize, share, and access essential educational resources.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/books" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
            Browse Library
          </Link>
          <Link to="/about" className="px-8 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 transition">
            Learn More
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <FeatureCard 
          icon={<Search className="w-8 h-8 text-indigo-500" />}
          title="Search & Discover"
          description="Find textbooks, research papers, and study guides instantly with our powerful search tools."
        />
        <FeatureCard 
          icon={<Download className="w-8 h-8 text-teal-500" />}
          title="Easy Downloads"
          description="Access materials offline. Download resources as PDFs directly to your device."
        />
        <FeatureCard 
          icon={<MessageSquare className="w-8 h-8 text-amber-500" />}
          title="Community Feedback"
          description="Read reviews from other students and provide your own feedback to help improve the collection."
        />
      </div>
      
      {/* Decorative Section */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Start your learning journey today.</h2>
            <p className="text-slate-300">Join hundreds of students accessing quality materials.</p>
          </div>
          <Link to="/books" className="px-6 py-2 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="mb-4 p-3 bg-slate-50 w-fit rounded-lg">{icon}</div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

export default Home;