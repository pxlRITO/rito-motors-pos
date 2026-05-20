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
      
      // Fetch cars for stats
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('status, price');
      
      if (carsError) throw carsError;

      // Fetch sales for revenue and recent sales
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*, car_id(make, model)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (salesError) throw salesError;

      // Calculate stats
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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-slate-400">Welcome back to RitoMotors POS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="emerald"
        />
        <StatCard 
          title="Cars Sold" 
          value={stats.totalCarsSold} 
          icon={ShoppingCart} 
          color="blue"
        />
        <StatCard 
          title="Available Inventory" 
          value={stats.availableCars} 
          icon={Car} 
          color="amber"
        />
        <StatCard 
          title="Reserved Cars" 
          value={stats.reservedCars} 
          icon={Clock} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Sales</h2>
            <button className="text-sm text-blue-500 hover:text-blue-400 font-medium">View All</button>
          </div>
          
          <div className="table-container">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header">
                  <th className="table-cell">Invoice</th>
                  <th className="table-cell">Customer</th>
                  <th className="table-cell">Vehicle</th>
                  <th className="table-cell">Amount</th>
                  <th className="table-cell text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <tr key={sale.id} className="table-row">
                      <td className="table-cell font-medium text-blue-500">{sale.invoice_no}</td>
                      <td className="table-cell">{sale.customer_name}</td>
                      <td className="table-cell">{sale.car_id?.make} {sale.car_id?.model}</td>
                      <td className="table-cell font-semibold">${Number(sale.grand_total).toLocaleString()}</td>
                      <td className="table-cell text-right text-slate-400">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="table-cell text-center py-8 text-slate-500">
                      No sales records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Inventory Status</h2>
          <div className="card p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Available</span>
                <span className="font-semibold">{stats.availableCars}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${(stats.availableCars / (stats.activeInventory || 1)) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Reserved</span>
                <span className="font-semibold">{stats.reservedCars}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${(stats.reservedCars / (stats.activeInventory || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total Active Units</span>
                <span className="text-lg font-bold">{stats.activeInventory}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
