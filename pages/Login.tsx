import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, CheckCircle, User, ShieldCheck } from 'lucide-react';
import { Role } from '../types';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Role>(Role.USER); // 'USER' or 'ADMIN'
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Reset form when switching tabs
  const handleTabChange = (role: Role) => {
    setActiveTab(role);
    setIsRegistering(false);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegistering && activeTab === Role.USER) {
        await register(username, password);
        setSuccess('Registration successful! Please log in with your new credentials.');
        setIsRegistering(false);
        setPassword('');
        // We do not navigate here; the user stays on the login page (now in login mode)
      } else {
        await login(username, password, activeTab);
        if (activeTab === Role.ADMIN) {
           navigate('/admin');
        } else {
           navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="bg-white p-3 rounded-full shadow-lg mb-4">
            <BookOpen className="h-10 w-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">EduResource Library</h1>
        <p className="text-slate-500 mt-2">Access your learning materials</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
        {/* Role Toggles */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => handleTabChange(Role.USER)}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === Role.USER 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'bg-slate-50 text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-4 h-4" /> Student Login
          </button>
          <button
            onClick={() => handleTabChange(Role.ADMIN)}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === Role.ADMIN
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                : 'bg-slate-50 text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Admin Login
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 text-center">
            {activeTab === Role.ADMIN 
              ? 'Administrator Access' 
              : (isRegistering ? 'Create Student Account' : 'Welcome Student')}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder={activeTab === Role.ADMIN ? "admin" : "Enter your username"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center shadow-md ${
                activeTab === Role.ADMIN 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                activeTab === Role.ADMIN ? 'Login as Admin' : (isRegistering ? 'Sign Up' : 'Sign In')
              )}
            </button>
          </form>

          {activeTab === Role.USER && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
                <button
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                    setSuccess('');
                  }}
                  className="ml-2 text-blue-600 font-medium hover:underline"
                >
                  {isRegistering ? 'Login here' : 'Register now'}
                </button>
              </p>
            </div>
          )}
          
          {activeTab === Role.ADMIN && (
             <div className="mt-6 text-center text-xs text-slate-400">
                Secure access for library administrators only.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;