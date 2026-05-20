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
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Business Reports</h1>
        <p className="text-slate-400">Detailed overview of dealership performance.</p>
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
          color="blue"
        />
        <StatCard 
          title="Total Units Sold" 
          value={reportData.totalSales} 
          icon={Package} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Summary */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <PieChart size={24} className="text-blue-500" />
            Inventory Status
          </h2>
          <div className="space-y-4">
            {Object.entries(reportData.inventoryStats).map(([status, count]) => {
              const total = Object.values(reportData.inventoryStats).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors = {
                Available: 'bg-emerald-500',
                Reserved: 'bg-amber-500',
                Sold: 'bg-blue-600'
              };

              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-sm font-medium text-slate-400">{status}</span>
                      <p className="text-lg font-bold">{count} Units</p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`${colors[status] || 'bg-slate-500'} h-full rounded-full transition-all duration-1000`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CreditCard size={24} className="text-blue-500" />
            Payment Method Distribution
          </h2>
          <div className="space-y-6">
            {Object.entries(reportData.paymentMethods).length > 0 ? (
              Object.entries(reportData.paymentMethods).map(([method, count]) => {
                const total = reportData.totalSales;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={method} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-blue-500">
                      {count}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">{method}</span>
                        <span className="text-slate-400 text-sm">{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
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
