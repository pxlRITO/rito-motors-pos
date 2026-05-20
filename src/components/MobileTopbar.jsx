import React, { useState } from 'react';

import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Car, ShoppingCart, Users, BarChart3, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

const MobileTopbar = ({ user, profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Sales Agent'] },
    { name: 'Inventory', path: '/inventory', icon: Car, roles: ['Admin'] },
    { name: 'POS Sales', path: '/pos', icon: ShoppingCart, roles: ['Admin', 'Sales Agent'] },
    { name: 'Customer Logs', path: '/customers', icon: Users, roles: ['Admin', 'Sales Agent'] },
    { name: 'Inquiries', path: '/inquiries', icon: MessageSquare, roles: ['Admin', 'Sales Agent'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['Admin'] },
    { name: 'Showroom', path: '/showroom', icon: Car, roles: ['Customer'] },
    { name: 'My Inquiries', path: '/customer', icon: MessageSquare, roles: ['Customer'] },
  ];

  const filteredItems = menuItems.filter(item => {
    if (!profile?.role) return false;
    return item.roles.includes(profile.role);
  });

  const hasAccess = profile && ['Admin', 'Sales Agent', 'Customer'].includes(profile.role);

  return (
    <div className="md:hidden relative z-[100] font-sans">
      <div className="bg-toyota-black text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-toyota-red rounded-sm flex items-center justify-center font-black text-lg italic shadow-lg shadow-toyota-red/20">R</div>
          <span className="font-black text-lg tracking-tighter uppercase italic">RitoMotors</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-white hover:text-toyota-red transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-toyota-black/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="bg-white border-b border-gray-200 p-4 space-y-1 absolute w-full z-50 shadow-2xl animate-in slide-in-from-top duration-200">
            {hasAccess ? (
              filteredItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-4 px-4 py-4 rounded-sm transition-all duration-200
                    ${isActive 
                      ? 'bg-toyota-red text-white shadow-lg shadow-toyota-red/20' 
                      : 'text-toyota-charcoal hover:bg-toyota-gray hover:text-toyota-black'}
                  `}
                >
                  <item.icon size={20} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>
                </NavLink>
              ))
            ) : profile ? (
              <div className="px-4 py-8 text-center space-y-3">
                <p className="text-[10px] text-gray-400 italic uppercase font-black tracking-widest">
                  No access granted for this role
                </p>
                <button 
                  onClick={() => { navigate('/showroom'); setIsOpen(false); }}
                  className="text-[10px] text-toyota-red font-black uppercase tracking-widest"
                >
                  Back to Showroom
                </button>
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <Loader2 className="animate-spin text-toyota-red mx-auto mb-2" size={20} />
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Loading...</p>
              </div>
            )}
            
            <div className="pt-6 mt-4 border-t border-gray-100">
              <div className="px-4 py-4 mb-4 bg-toyota-gray rounded-sm border border-gray-200">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Authenticated As</p>
                <p className="text-xs font-bold text-toyota-black truncate">{profile?.full_name || user?.email}</p>
                <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-sm text-white text-[9px] font-black uppercase tracking-widest ${profile?.role === 'Guest' ? 'bg-gray-500' : 'bg-toyota-red'}`}>
                  {profile?.role || 'Guest'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-4 py-4 rounded-sm text-toyota-red hover:bg-toyota-red hover:text-white transition-all duration-200"
              >
                <LogOut size={20} />
                <span className="text-[11px] font-black uppercase tracking-widest">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileTopbar;
