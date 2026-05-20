import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, AlertCircle, User, Phone, ArrowLeft, ArrowRight } from 'lucide-react';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            full_name: fullName,
            role: 'Customer',
            contact_number: contactNumber
          }]);

        if (profileError) throw profileError;
        navigate('/login', { state: { message: 'Signup successful! Please log in.' } });
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-toyota-red rounded-sm mb-4 shadow-xl shadow-toyota-red/20 -rotate-3">
            <span className="text-4xl font-black text-white italic tracking-tighter">R</span>
          </div>
          <h1 className="text-4xl font-black text-toyota-black tracking-tighter uppercase italic">RitoMotors</h1>
          <p className="text-toyota-charcoal/60 mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">Create your premium account</p>
        </div>

        <div className="bg-white border-t-4 border-toyota-red p-8 md:p-10 shadow-2xl rounded-sm">
          <div className="flex items-center gap-2 mb-8">
            <button onClick={() => navigate('/login')} className="text-toyota-charcoal/30 hover:text-toyota-black transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-toyota-black uppercase tracking-tight">Registration</h2>
              <p className="text-toyota-charcoal/50 text-xs font-bold uppercase tracking-widest">New Customer Account</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-toyota-red flex items-center gap-3 text-toyota-red text-xs font-bold uppercase tracking-wider">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="label">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-toyota-charcoal/30">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="input pl-12"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

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
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label">Contact Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-toyota-charcoal/30">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="input pl-12"
                  placeholder="+63 9xx..."
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
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
              className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-sm mt-4"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs font-bold text-toyota-charcoal/50 uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-toyota-red font-black hover:underline ml-1">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
