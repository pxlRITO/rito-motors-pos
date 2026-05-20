import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, AlertCircle, Car, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-toyota-gray p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-toyota-red rounded-sm mb-4 shadow-xl shadow-toyota-red/20 rotate-3">
            <span className="text-4xl font-black text-white italic tracking-tighter">R</span>
          </div>
          <h1 className="text-4xl font-black text-toyota-black tracking-tighter uppercase italic">RitoMotors</h1>
          <p className="text-toyota-charcoal/60 mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">Premium Automotive POS & Showroom</p>
        </div>

        <div className="bg-white border-t-4 border-toyota-red p-8 md:p-10 shadow-2xl rounded-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-toyota-black uppercase tracking-tight">Welcome Back</h2>
            <p className="text-toyota-charcoal/50 text-xs font-bold uppercase tracking-widest mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-toyota-red flex items-center gap-3 text-toyota-red text-xs font-bold uppercase tracking-wider">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="label">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-toyota-charcoal/30">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="input pl-12"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-toyota-charcoal/30">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="input pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center space-y-6">
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => navigate('/showroom')}
                className="btn-secondary w-full py-4 flex items-center justify-center gap-3 group"
              >
                <Car size={20} className="group-hover:text-toyota-red transition-colors" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Explore Showroom</span>
              </button>
              
              <p className="text-xs font-bold text-toyota-charcoal/50 uppercase tracking-widest">
                Don't have an account?{' '}
                <Link to="/signup" className="text-toyota-red font-black hover:underline ml-1">
                  Create One
                </Link>
              </p>
            </div>

            <div className="pt-4 flex flex-col items-center gap-1 opacity-40">
              <p className="text-[10px] text-toyota-black font-black uppercase tracking-[0.3em]">RitoMotors Dealership</p>
              <div className="w-8 h-0.5 bg-toyota-red"></div>
              <p className="text-[8px] text-toyota-charcoal font-bold uppercase tracking-widest mt-1">Tagbilaran City, Bohol</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
