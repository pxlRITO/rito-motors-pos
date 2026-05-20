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
    return item.roles.includes(profile.role);
  });

  const hasAccess = profile && ['Admin', 'Sales Agent', 'Customer'].includes(profile.role);

  return (
    <aside className={`hidden md:flex flex-col bg-toyota-black text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-toyota-red rounded-sm flex items-center justify-center font-black text-xl text-white italic">R</div>
            <span className="font-black text-xl tracking-tighter uppercase italic">RitoMotors</span>
          </div>
        ) : (
          <div className="w-10 h-10 bg-toyota-red rounded-sm flex items-center justify-center font-black text-xl text-white italic mx-auto">R</div>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto no-scrollbar">
        {hasAccess ? (
          filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-sm transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-toyota-red text-white shadow-lg shadow-toyota-red/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.name : ''}
            >
              <item.icon size={20} className={collapsed ? '' : 'min-w-[20px]'} />
              {!collapsed && <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>}
              {/* Indicator line for active state when not collapsed */}
              {!collapsed && (
                <div className={`absolute left-0 w-1 h-6 bg-white rounded-r-full transition-opacity duration-200 opacity-0 group-[.active]:opacity-100`} />
              )}
            </NavLink>
          ))
        ) : profile ? (
          <div className="px-4 py-8 text-center space-y-4">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-500">
              <Car size={20} />
            </div>
            {!collapsed && (
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-relaxed">
                  No active roles assigned to this account
                </p>
                <button 
                  onClick={() => navigate('/showroom')}
                  className="text-[9px] text-toyota-red font-black uppercase tracking-widest hover:underline"
                >
                  View Showroom
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
            <Loader2 className="animate-spin text-toyota-red" size={24} />
            {!collapsed && <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Synchronizing...</p>}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-4 bg-toyota-charcoal/30">
        {!collapsed && (
          <div className="px-3 py-3 bg-white/5 rounded-sm border border-white/10">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Authenticated As</p>
            <p className="text-xs font-bold text-white truncate">{profile?.full_name || user?.email || 'Active Session'}</p>
            <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest ${profile?.role === 'Guest' ? 'bg-gray-600 text-gray-300' : 'bg-toyota-red text-white'}`}>
              {profile?.role || 'Guest'}
            </div>
          </div>
        )}
        
        <div className="space-y-1">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-sm text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-200 group ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-[11px] font-black uppercase tracking-widest">Logout</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full p-2 text-gray-500 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
