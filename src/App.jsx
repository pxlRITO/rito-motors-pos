import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Invoice from './pages/Invoice';
import CustomerLogs from './pages/CustomerLogs';
import Reports from './pages/Reports';
import Showroom from './pages/Showroom';
import Inquiries from './pages/Inquiries';
import Signup from './pages/Signup';
import CustomerPortal from './pages/CustomerPortal';

// Components
import Sidebar from './components/Sidebar';
import MobileTopbar from './components/MobileTopbar';

const App = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        // If profile doesn't exist, we might want to treat them as a Guest
        setProfile({ role: 'Guest' });
      } else {
        console.log('Fetched Profile:', data);
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setProfile({ role: 'Guest' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-toyota-gray gap-4">
        <div className="w-16 h-16 bg-toyota-red rounded-sm flex items-center justify-center font-black text-3xl text-white italic shadow-lg shadow-toyota-red/20 animate-pulse">R</div>
        <Loader2 className="animate-spin text-toyota-red" size={32} />
        <p className="text-toyota-charcoal font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Initializing RitoMotors POS...</p>
      </div>
    );
  }

  // Protected Route Component
  const ProtectedRoute = ({ children, roles = [] }) => {
    const location = useLocation();

    if (!session) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Wait for profile to load if session exists
    if (!profile) return null;

    // If role is Guest or unknown, they shouldn't be in protected routes (except maybe showroom)
    if (profile.role === 'Guest' || !['Admin', 'Sales Agent', 'Customer'].includes(profile.role)) {
      return <Navigate to="/showroom" replace />;
    }

    if (roles.length > 0 && !roles.includes(profile.role)) {
      // Redirect based on role if they try to access unauthorized area
      if (profile.role === 'Customer') return <Navigate to="/customer" replace />;
      if (['Admin', 'Sales Agent'].includes(profile.role)) return <Navigate to="/" replace />;
      return <Navigate to="/showroom" replace />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={session ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="/showroom" element={<Showroom />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="flex flex-col md:flex-row min-h-screen bg-toyota-gray text-toyota-black font-sans">
              <Sidebar 
                user={session?.user} 
                profile={profile} 
                collapsed={sidebarCollapsed} 
                setCollapsed={setSidebarCollapsed} 
              />
              <MobileTopbar user={session?.user} profile={profile} />
              
              <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen no-scrollbar">
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={
                      profile?.role === 'Customer' ? (
                        <Navigate to="/customer" replace />
                      ) : ['Admin', 'Sales Agent'].includes(profile?.role) ? (
                        <Dashboard />
                      ) : (
                        <Navigate to="/showroom" replace />
                      )
                    } />
                    
                    <Route path="/inventory" element={
                      <ProtectedRoute roles={['Admin']}>
                        <Inventory />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/pos" element={
                      <ProtectedRoute roles={['Admin', 'Sales Agent']}>
                        <POS user={session?.user} profile={profile} />
                      </ProtectedRoute>
                    } />
                    <Route path="/invoice/:id" element={<Invoice />} />
                    <Route path="/customers" element={
                      <ProtectedRoute roles={['Admin', 'Sales Agent']}>
                        <CustomerLogs />
                      </ProtectedRoute>
                    } />
                    <Route path="/inquiries" element={
                      <ProtectedRoute roles={['Admin', 'Sales Agent']}>
                        <Inquiries />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/customer" element={
                      <ProtectedRoute roles={['Customer']}>
                        <CustomerPortal user={session?.user} profile={profile} />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/reports" element={
                      <ProtectedRoute roles={['Admin']}>
                        <Reports />
                      </ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
