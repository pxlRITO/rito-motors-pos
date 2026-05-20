import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Package, 
  Loader2, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import StatCard from '../components/StatCard';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    grossRevenue: 0,
    avgSaleValue: 0,
    totalSales: 0,
    inventoryStats: {
      Available: 0,
      Reserved: 0,
      Sold: 0
    },
    paymentMethods: {}
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all sales
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*');
      
      if (salesError) throw salesError;

      // Fetch all cars for inventory summary
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('status');
      
      if (carsError) throw carsError;

      // Process Sales Stats
      const grossRevenue = sales.reduce((sum, s) => sum + Number(s.grand_total), 0);
      const totalSales = sales.length;
      const avgSaleValue = totalSales > 0 ? grossRevenue / totalSales : 0;

      // Process Inventory Stats
      const inventoryStats = cars.reduce((acc, car) => {
        acc[car.status] = (acc[car.status] || 0) + 1;
        return acc;
      }, { Available: 0, Reserved: 0, Sold: 0 });

      // Process Payment Methods
      const paymentMethods = sales.reduce((acc, sale) => {
        acc[sale.payment_method] = (acc[sale.payment_method] || 0) + 1;
        return acc;
      }, {});

      setReportData({
        grossRevenue,
        avgSaleValue,
        totalSales,
        inventoryStats,
        paymentMethods
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-toyota-red" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      <div>
        <h1 className="section-title">Business Reports</h1>
        <p className="text-[10px] font-black text-toyota-charcoal uppercase tracking-[0.2em] mt-2">Detailed overview of dealership performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Gross Revenue" 
          value={`$${reportData.grossRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="emerald"
        />
        <StatCard 
          title="Average Sale Value" 
          value={`$${reportData.avgSaleValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={TrendingUp} 
          color="red"
        />
        <StatCard 
          title="Total Units Sold" 
          value={reportData.totalSales} 
          icon={Package} 
          color="black"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Summary */}
        <div className="card p-6 border-t-4 border-t-toyota-red">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2 text-toyota-black">
            <PieChart size={24} className="text-toyota-red" />
            Inventory Status
          </h2>
          <div className="space-y-4">
            {Object.entries(reportData.inventoryStats).map(([status, count]) => {
              const total = Object.values(reportData.inventoryStats).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors = {
                Available: 'bg-emerald-500',
                Reserved: 'bg-amber-500',
                Sold: 'bg-toyota-red'
              };

              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{status}</span>
                      <p className="text-lg font-black text-toyota-black tracking-tight">{count} Units</p>
                    </div>
                    <span className="text-[10px] font-black text-gray-500 tracking-widest">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-toyota-gray h-2 rounded-sm overflow-hidden border border-gray-100">
                    <div 
                      className={`${colors[status] || 'bg-gray-400'} h-full rounded-sm transition-all duration-1000`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card p-6 border-t-4 border-t-toyota-black">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2 text-toyota-black">
            <CreditCard size={24} className="text-toyota-red" />
            Payment Distribution
          </h2>
          <div className="space-y-6">
            {Object.entries(reportData.paymentMethods).length > 0 ? (
              Object.entries(reportData.paymentMethods).map(([method, count]) => {
                const total = reportData.totalSales;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={method} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-toyota-gray rounded-sm flex items-center justify-center font-black text-toyota-red border border-gray-100">
                      {count}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] font-black text-toyota-black uppercase tracking-widest">{method}</span>
                        <span className="text-gray-400 text-[10px] font-bold tracking-widest">{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-toyota-gray h-1.5 rounded-sm overflow-hidden border border-gray-100">
                        <div 
                          className="bg-toyota-red h-full rounded-sm" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <BarChart3 size={48} className="mb-4 opacity-20" />
                <p>No payment data available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for simple icons
const CreditCard = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

export default Reports;
