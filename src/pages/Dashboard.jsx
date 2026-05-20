import React, { useState, useEffect } from 'react';
import { 
  Car, 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  ArrowUpRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCarsSold: 0,
    activeInventory: 0,
    availableCars: 0,
    reservedCars: 0,
    totalRevenue: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('status, price');
      
      if (carsError) throw carsError;

      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*, car_id(make, model)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (salesError) throw salesError;

      const totalCarsSold = cars.filter(c => c.status === 'Sold').length;
      const activeInventory = cars.filter(c => c.status !== 'Sold').length;
      const availableCars = cars.filter(c => c.status === 'Available').length;
      const reservedCars = cars.filter(c => c.status === 'Reserved').length;
      
      const { data: revenueData } = await supabase
        .from('sales')
        .select('grand_total');
      
      const totalRevenue = revenueData?.reduce((sum, sale) => sum + Number(sale.grand_total), 0) || 0;

      setStats({
        totalCarsSold,
        activeInventory,
        availableCars,
        reservedCars,
        totalRevenue,
      });
      setRecentSales(sales || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-toyota-gray">
        <Loader2 className="animate-spin text-toyota-red" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-sans p-6 md:p-12 bg-toyota-gray min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-64 bg-toyota-red skew-x-[30deg] translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-64 bg-toyota-black skew-x-[-30deg] -translate-x-1/2 translate-y-1/2 opacity-[0.02] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-toyota-black pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-toyota-red rounded-sm flex items-center justify-center font-black text-white italic rotate-3 shadow-lg shadow-toyota-red/20">R</div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-toyota-red">Administrative Control</p>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-toyota-black leading-none">
            Dashboard<span className="text-toyota-red">.</span>
          </h1>
          <p className="text-toyota-charcoal/50 text-[10px] font-black uppercase tracking-[0.2em] mt-4">Real-time performance metrics for RitoMotors Dealership</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-sm border border-gray-100 shadow-xl flex items-center gap-4 group hover:border-toyota-red/30 transition-all">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Status</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-toyota-black">Systems Operational</p>
            </div>
          </div>
          <div className="hidden md:flex bg-toyota-black px-6 py-3 rounded-sm shadow-xl flex-col items-end">
            <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 leading-none mb-1">Today's Date</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <StatCard 
          title="Gross Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="emerald"
        />
        <StatCard 
          title="Total Units Sold" 
          value={stats.totalCarsSold} 
          icon={ShoppingCart} 
          color="red"
        />
        <StatCard 
          title="Available Stock" 
          value={stats.availableCars} 
          icon={Car} 
          color="black"
        />
        <StatCard 
          title="Pending Reservations" 
          value={stats.reservedCars} 
          icon={Clock} 
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-toyota-red" />
              <h2 className="text-2xl font-black uppercase tracking-tight text-toyota-black italic">Recent Sales <span className="text-gray-300 not-italic font-medium">Activity</span></h2>
            </div>
            <button className="btn-secondary py-2 px-4 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 group">
              View All Records
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-sm shadow-2xl overflow-hidden group">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-toyota-black text-white">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Invoice No</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Client</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Vehicle Model</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Sale Amount</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentSales.length > 0 ? (
                    recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-toyota-gray transition-colors group/row">
                        <td className="px-6 py-5 font-black text-toyota-red text-xs tracking-widest font-mono">#{sale.invoice_no}</td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-black text-toyota-black uppercase tracking-tight">{sale.customer_name}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-[10px] font-black text-toyota-charcoal uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-sm inline-block">
                            {sale.car_id?.make} {sale.car_id?.model}
                          </p>
                        </td>
                        <td className="px-6 py-5 font-black text-toyota-black tracking-tighter text-lg">${Number(sale.grand_total).toLocaleString()}</td>
                        <td className="px-6 py-5 text-right">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            {new Date(sale.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                          <ShoppingCart size={48} />
                          <p className="font-black uppercase tracking-[0.3em] text-xs">No Recent Sales Found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-1.5 h-8 bg-toyota-black" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-toyota-black italic">Inventory <span className="text-gray-300 not-italic font-medium">Status</span></h2>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-toyota-red skew-x-[45deg] translate-x-12 -translate-y-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" />
            
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Available Stock</p>
                    <p className="text-3xl font-black text-toyota-black tracking-tighter leading-none">{stats.availableCars} Units</p>
                  </div>
                  <p className="text-[10px] font-black text-emerald-600 tracking-widest">
                    {Math.round((stats.availableCars / (stats.activeInventory || 1)) * 100)}%
                  </p>
                </div>
                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-[1.5s] ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                    style={{ width: `${(stats.availableCars / (stats.activeInventory || 1)) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Reserved Stock</p>
                    <p className="text-3xl font-black text-toyota-black tracking-tighter leading-none">{stats.reservedCars} Units</p>
                  </div>
                  <p className="text-[10px] font-black text-amber-600 tracking-widest">
                    {Math.round((stats.reservedCars / (stats.activeInventory || 1)) * 100)}%
                  </p>
                </div>
                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-[1.5s] ease-out shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                    style={{ width: `${(stats.reservedCars / (stats.activeInventory || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-10 border-t-4 border-toyota-black">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-toyota-red mb-2">Total Active Inventory</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-6xl font-black text-toyota-black tracking-tighter leading-none">{stats.activeInventory}</p>
                      <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Vehicles</p>
                    </div>
                  </div>
                  <div className="w-20 h-20 bg-toyota-gray border border-gray-100 rounded-sm flex items-center justify-center text-toyota-black shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Car size={40} strokeWidth={1.5} />
                  </div>
                </div>
                
                <div className="mt-8 flex gap-2">
                  <div className="flex-1 h-1 bg-toyota-red" />
                  <div className="flex-1 h-1 bg-toyota-black" />
                  <div className="flex-1 h-1 bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
