import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white">About EduResource</h1>
        </div>
        
        <div className="p-8 md:p-12 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              EduResource Library is designed to bridge the gap between educational materials and the students who need them. 
              We believe that access to quality study guides, textbooks, and research papers is fundamental to academic success.
              Our platform empowers educators to distribute materials efficiently while giving students a centralized hub for learning.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-8 py-6">
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="font-bold text-slate-800 mb-2">For Students</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Instant access to course materials</li>
                <li>AI-powered study summaries</li>
                <li>Offline reading support (PDF)</li>
                <li>Community feedback system</li>
              </ul>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="font-bold text-slate-800 mb-2">For Educators</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Simple resource management</li>
                <li>Track student engagement</li>
                <li>Receive direct feedback</li>
                <li>Secure platform environment</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Contact</h2>
            <p className="text-slate-600">
              Have questions or need support? Reach out to the administration team.
            </p>
            <p className="text-blue-600 font-medium mt-2">admin@edulibrary.com</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;