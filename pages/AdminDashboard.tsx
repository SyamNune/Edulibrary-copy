import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/localStorageService';
import { Book, User, Review, LoginLog } from '../types';
import { Users, BookOpen, MessageSquare, Plus, UploadCloud, FileText, History, RefreshCw, AlertTriangle, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'books' | 'users' | 'reviews'>('books');
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  
  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [dataError, setDataError] = useState('');
  
  // Book Upload Form
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Fetch data function wrapped in useCallback to be used in useEffect
  // 'silent' mode prevents the main loading spinner from showing during auto-refresh
  const loadData = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoadingData(true);
    } else {
      setIsAutoRefreshing(true);
    }
    
    setDataError('');
    
    try {
      // Fetch all relevant admin data in parallel
      const [u, r, logs] = await Promise.all([
        api.getUsers(),
        api.getReviews(),
        api.getLoginLogs()
      ]);
      setUsers(u);
      setReviews(r);
      setLoginLogs(logs);
    } catch (err) {
      console.error("Failed to load admin data", err);
      if (!silent) setDataError("An internal error occurred while fetching data. Please refresh.");
    } finally {
      if (!silent) {
        setIsLoadingData(false);
      } else {
        // Short delay to let the spinner spin a bit if visible, mostly for UX feel
        setTimeout(() => setIsAutoRefreshing(false), 500);
      }
    }
  }, []);

  // Effect to handle initial load and auto-polling
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (activeTab === 'users' || activeTab === 'reviews') {
        // Initial load
        loadData();
        
        // Auto-refresh every 5 seconds to keep data live
        intervalId = setInterval(() => {
            loadData(true);
        }, 5000);
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab, loadData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleBookUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadSuccess('');
    
    // Validate File
    if (!selectedFile) {
        alert("Please select a PDF file.");
        setIsUploading(false);
        return;
    }

    // Limit file size to 5MB to avoid localStorage quota limits in this demo
    if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File is too large for the demo storage (Max 5MB).");
        setIsUploading(false);
        return;
    }

    try {
        // Convert file to Base64 to store in "Backend" (LocalStorage)
        const base64Url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
        });

        await api.addBook({
            title,
            author,
            category,
            description,
            pdfUrl: base64Url
        });

        setTitle('');
        setAuthor('');
        setCategory('');
        setDescription('');
        setSelectedFile(null);
        setUploadSuccess('Book and PDF uploaded successfully.');
    } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload file. Please try again.");
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">Manage resources and view system activity.</p>
        </div>
        {(activeTab === 'users' || activeTab === 'reviews') && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            <Activity className={`w-3 h-3 ${isAutoRefreshing ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
            {isAutoRefreshing ? 'Updating live...' : 'Live updates on'}
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('books')}
          className={`pb-4 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'books' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Upload Books
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> User Logins
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-4 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Feedback Review
        </button>
      </div>

      {dataError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          {dataError}
        </div>
      )}

      {activeTab === 'books' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Upload New Book (PDF)
            </h2>
            
            {uploadSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                {uploadSuccess}
              </div>
            )}

            <form onSubmit={handleBookUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Book Title</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Advanced Physics"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                  <input
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Science"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload PDF Document</label>
                <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition ${selectedFile ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                  <input 
                    type="file" 
                    id="file-upload"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden" 
                    required 
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full h-full">
                    {selectedFile ? (
                      <>
                        <FileText className="w-8 h-8 mb-2 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700">{selectedFile.name}</span>
                        <span className="text-xs text-blue-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                        <span className="text-sm text-slate-600">Click to upload PDF file</span>
                        <span className="text-xs text-slate-400 mt-1">Supported format: .pdf (Max 5MB)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
              >
                {isUploading ? 'Uploading...' : 'Add to Library'}
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-center items-center text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700">Library Preview</h3>
            <p className="text-slate-500 max-w-sm mt-2">
              Newly added books with their PDF links will appear instantly in the user search directory.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-bold text-blue-800 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Registered Users
                </h3>
                <p className="text-sm text-blue-600">
                  List of all users registered in the system.
                </p>
              </div>
              <button 
                onClick={() => loadData(false)} 
                disabled={isLoadingData || isAutoRefreshing}
                className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-100 transition shadow-sm disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingData || isAutoRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {u.lastLogin ? (
                           <span className="flex items-center gap-2 text-xs">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              Last seen: {new Date(u.lastLogin).toLocaleDateString()}
                           </span>
                        ) : (
                           <span className="text-slate-400 text-xs">Never</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
             <div className="bg-slate-100 border border-slate-200 p-4 rounded-lg">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4" /> Login History Log
              </h3>
              <p className="text-sm text-slate-600">
                Chronological log of all system access events.
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-h-[600px] overflow-y-auto">
              {loginLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No login activity recorded yet.</div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {loginLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${log.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                          {log.username}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
           <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold text-amber-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> User Feedback
              </h3>
              <p className="text-sm text-amber-700">
                Review feedback and see which user submitted it. Sorted by most recent.
              </p>
            </div>
            <button 
              onClick={() => loadData(false)} 
              disabled={isLoadingData || isAutoRefreshing}
              className="p-2 bg-white text-amber-600 rounded-full hover:bg-amber-100 transition shadow-sm disabled:opacity-50"
              title="Refresh Feedback"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData || isAutoRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Submitted By (User)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Resource ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {reviews.map((r) => {
                  if (!r) return null; // Defensive check for corrupt data
                  return (
                    <tr key={r.id || Math.random()} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">{r.username || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{r.bookId || 'General'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500 font-bold">{r.rating} / 5</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{r.comment}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;