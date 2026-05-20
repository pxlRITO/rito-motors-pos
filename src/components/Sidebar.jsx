import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Sidebar = ({ user, profile, collapsed, setCollapsed }) => {
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
    // Normalize and match exact roles: Admin or Sales Agent
    return item.roles.includes(profile.role);
  });

  return (
    <aside className={`hidden md:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl text-white">R</div>
            <span className="font-bold text-xl tracking-tight text-white">RitoMotors</span>
          </div>
        ) : (
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl text-white mx-auto shadow-lg shadow-blue-600/20">R</div>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
        {profile ? (
          filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'}
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.name : ''}
              >
                <item.icon size={22} className={collapsed ? '' : 'min-w-[22px]'} />
                {!collapsed && <span className="font-semibold whitespace-nowrap">{item.name}</span>}
              </NavLink>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-red-400 text-center bg-red-500/10 rounded-lg border border-red-500/20">
              Access restricted. Role: {profile.role || 'None'}
            </div>
          )
        ) : (
          <div className="px-4 py-6 text-center space-y-4">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Error</p>
              <p className="text-[11px] text-red-400 leading-tight">
                Profile not found. Please add this user to the profiles table.
              </p>
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-900/50">
        {!collapsed && (
          <div className="px-3 py-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Signed in as</p>
            <p className="text-sm font-bold text-slate-100 truncate">{profile?.full_name || user?.email}</p>
            <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
              <span className="text-[10px] text-blue-400 font-black uppercase tracking-tighter">{profile?.role || 'NO ROLE'}</span>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut size={22} />
            {!collapsed && <span className="font-semibold">Logout</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full p-2 text-slate-500 hover:text-blue-500 transition-colors rounded-lg hover:bg-slate-800/50"
          >
            {collapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><ChevronLeft size={16} /> Collapse</div>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
