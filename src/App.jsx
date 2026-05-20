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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        setProfile(null);
      } else {
        console.log('Fetched Profile:', data);
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-3xl animate-pulse">R</div>
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="text-slate-400 font-medium animate-pulse">Initializing RitoMotors POS...</p>
      </div>
    );
  }

  // Protected Route Component
  const ProtectedRoute = ({ children, roles = [] }) => {
    const location = useLocation();

    if (!session) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles.length > 0 && profile && !roles.includes(profile.role)) {
      return <Navigate to="/" replace />;
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
            <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100">
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
                      profile?.role === 'Customer' ? <Navigate to="/customer" replace /> : <Dashboard />
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
                    <Route path="/customers" element={<CustomerLogs />} />
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
