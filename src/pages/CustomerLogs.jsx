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
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Customer Logs</h1>
          <p className="text-[10px] font-black text-toyota-charcoal uppercase tracking-[0.2em] mt-2">View and manage all completed vehicle sales.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-toyota-charcoal" size={18} />
        <input
          type="text"
          placeholder="Search by customer name, email, or invoice number..."
          className="input pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-toyota-red/20 rounded-sm flex items-center gap-3 text-toyota-red text-[10px] font-bold uppercase tracking-wider">
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
                  <Loader2 className="animate-spin mx-auto text-toyota-red" size={32} />
                </td>
              </tr>
            ) : filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="table-row">
                  <td className="table-cell font-mono text-toyota-red font-black text-[10px] tracking-widest">{sale.invoice_no}</td>
                  <td className="table-cell">
                    <div className="font-black text-toyota-black uppercase text-xs tracking-tight">{sale.customer_name}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sale.customer_email}</div>
                  </td>
                  <td className="table-cell">
                    <div className="text-[10px] font-black text-toyota-charcoal uppercase tracking-widest">
                      {sale.cars?.year} {sale.cars?.make} {sale.cars?.model}
                    </div>
                  </td>
                  <td className="table-cell">
                    <Badge variant="info">{sale.payment_method}</Badge>
                  </td>
                  <td className="table-cell font-black text-toyota-black tracking-tight">${Number(sale.grand_total).toLocaleString()}</td>
                  <td className="table-cell text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                  <td className="table-cell text-right">
                    <button 
                      onClick={() => navigate(`/invoice/${sale.id}`)}
                      className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-auto"
                    >
                      <Eye size={14} />
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="table-cell text-center py-12 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
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
