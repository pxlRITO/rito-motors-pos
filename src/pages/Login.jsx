import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, AlertCircle, Car } from 'lucide-react';
import Input from '../components/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Fetch profile to determine role and redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'Customer') {
        navigate('/customer');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/20">
            <span className="text-3xl font-bold text-white">R</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight italic">RitoMotors</h1>
          <p className="text-slate-400 mt-2 font-medium">Point of Sale & Showroom</p>
        </div>

        <div className="card p-8 bg-slate-900/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6 text-center uppercase tracking-widest">Sign In</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3 shadow-xl shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-4">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/showroom')}
                className="btn-secondary w-full py-3 flex items-center justify-center gap-2 group border-slate-800 hover:border-blue-500/50"
              >
                <Car size={18} className="group-hover:text-blue-500 transition-colors" />
                <span className="font-bold uppercase tracking-widest text-xs">Browse Showroom</span>
              </button>
              
              <button
                onClick={() => navigate('/signup')}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Don't have an account? <span className="text-blue-500 font-bold">Sign Up</span>
              </button>
            </div>

            <div className="pt-4">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">RitoMotors Dealership</p>
              <p className="text-[10px] text-slate-600 mt-1 uppercase">Tagbilaran City, Bohol</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
