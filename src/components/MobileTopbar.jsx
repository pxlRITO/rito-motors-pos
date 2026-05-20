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

  return (
    <div className="md:hidden relative z-[100]">
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">R</div>
          <span className="font-bold text-lg tracking-tight text-white">RitoMotors</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="bg-slate-900 border-b border-slate-800 p-4 space-y-2 absolute w-full z-50 shadow-2xl animate-in slide-in-from-top duration-200">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                  `}
                >
                  <item.icon size={20} />
                  <span className="font-semibold">{item.name}</span>
                </NavLink>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-slate-500 italic text-center">
                {!profile ? 'Loading profile...' : 'No access granted'}
              </div>
            )}
            
            <div className="pt-4 mt-4 border-t border-slate-800">
              <div className="px-4 py-3 mb-2 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">User</p>
                <p className="text-sm font-bold text-slate-100 truncate">{profile?.full_name || user?.email}</p>
                <p className="text-[10px] text-blue-500 font-black uppercase mt-1">{profile?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
              >
                <LogOut size={20} />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileTopbar;
