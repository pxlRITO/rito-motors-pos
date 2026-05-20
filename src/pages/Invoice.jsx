import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  ArrowLeft, 
  Download, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Badge from '../components/Badge';

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          cars (*),
          profiles:agent_id (full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setSale(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full text-red-500">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold">Error Loading Invoice</h2>
        <p className="text-slate-400">{error || 'Invoice not found'}</p>
        <button onClick={() => navigate('/pos')} className="btn-primary">
          Back to POS
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between no-print">
        <button 
          onClick={() => navigate('/customers')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Logs
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            <Printer size={20} />
            Print Invoice
          </button>
        </div>
      </div>

      <div id="invoice-content" className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl p-8 md:p-12">
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row justify-between gap-8 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-2xl">R</div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">RitoMotors</h1>
            </div>
            <div className="space-y-1 text-slate-500 text-sm">
              <p className="flex items-center gap-2"><MapPin size={14} /> Tagbilaran City, Bohol, Philippines</p>
              <p className="flex items-center gap-2"><Phone size={14} /> +63 912 345 6789</p>
              <p className="flex items-center gap-2"><Mail size={14} /> sales@ritomotors.com</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-4xl font-black text-slate-200 uppercase mb-2">Invoice</h2>
            <div className="space-y-1">
              <p className="text-slate-500 font-medium">Invoice No: <span className="text-slate-900 font-bold">#{sale.invoice_no}</span></p>
              <p className="text-slate-500 font-medium">Date: <span className="text-slate-900 font-bold">{new Date(sale.created_at).toLocaleDateString()}</span></p>
              <p className="text-slate-500 font-medium">Payment: <span className="text-slate-900 font-bold">{sale.payment_method}</span></p>
            </div>
          </div>
        </div>

        {/* Billing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-slate-200">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Bill To</p>
            <h3 className="text-xl font-bold mb-1">{sale.customer_name}</h3>
            <div className="text-slate-500 space-y-1">
              <p>{sale.customer_email}</p>
              <p>{sale.customer_contact}</p>
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Sales Agent</p>
            <h3 className="text-xl font-bold mb-1">{sale.profiles?.full_name || 'System User'}</h3>
            <p className="text-slate-500">RitoMotors Representative</p>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="py-8">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Vehicle Details</p>
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h4 className="text-2xl font-bold mb-1">{sale.cars?.year} {sale.cars?.make} {sale.cars?.model}</h4>
                <p className="text-slate-500 font-mono text-sm mb-4">VIN: {sale.cars?.vin}</p>
                <div className="flex flex-wrap gap-2">
                  {sale.cars?.specs?.map((spec, i) => (
                    <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-slate-500 mb-1">Vehicle Price</p>
                <p className="text-3xl font-black text-slate-900">${Number(sale.subtotal).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end pt-8">
          <div className="w-full md:w-80 space-y-3">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">${Number(sale.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax ({sale.tax_rate}%)</span>
              <span className="font-bold text-slate-900">${Number(sale.tax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Dealership Fee</span>
              <span className="font-bold text-slate-900">${Number(sale.dealership_fee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Discount</span>
              <span className="font-bold text-slate-900">-${Number(sale.discount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900">
              <span className="text-xl font-black uppercase">Grand Total</span>
              <span className="text-3xl font-black text-blue-600">${Number(sale.grand_total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-500 text-sm mb-2 font-medium">Thank you for choosing RitoMotors!</p>
          <p className="text-slate-400 text-xs">This is a computer-generated invoice. No signature required.</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
