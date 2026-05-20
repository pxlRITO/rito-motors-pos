import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Eye, 
  Calendar, 
  Loader2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Badge from '../components/Badge';

const CustomerLogs = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          cars (make, model, year)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => 
    sale.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    sale.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
    sale.invoice_no.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customer Logs</h1>
          <p className="text-slate-400">View and manage all completed vehicle sales.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Search by customer name, email, or invoice number..."
          className="input pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="table-container">
        <table className="w-full text-left">
          <thead>
            <tr className="table-header">
              <th className="table-cell">Invoice</th>
              <th className="table-cell">Customer</th>
              <th className="table-cell">Vehicle Sold</th>
              <th className="table-cell">Payment</th>
              <th className="table-cell">Total</th>
              <th className="table-cell">Date</th>
              <th className="table-cell text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !sales.length ? (
              <tr>
                <td colSpan="7" className="table-cell text-center py-12">
                  <Loader2 className="animate-spin mx-auto text-blue-500" size={32} />
                </td>
              </tr>
            ) : filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="table-row">
                  <td className="table-cell font-mono text-blue-500 font-bold">{sale.invoice_no}</td>
                  <td className="table-cell">
                    <div className="font-bold">{sale.customer_name}</div>
                    <div className="text-xs text-slate-500">{sale.customer_email}</div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm">
                      {sale.cars?.year} {sale.cars?.make} {sale.cars?.model}
                    </div>
                  </td>
                  <td className="table-cell">
                    <Badge variant="info">{sale.payment_method}</Badge>
                  </td>
                  <td className="table-cell font-bold">${Number(sale.grand_total).toLocaleString()}</td>
                  <td className="table-cell text-slate-400 text-sm">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                  <td className="table-cell text-right">
                    <button 
                      onClick={() => navigate(`/invoice/${sale.id}`)}
                      className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs ml-auto"
                    >
                      <Eye size={14} />
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="table-cell text-center py-12 text-slate-500">
                  No sales records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerLogs;
