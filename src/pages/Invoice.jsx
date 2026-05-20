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
      setError(null);
      
      // 1. Fetch the sale by ID
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', id)
        .single();

      if (saleError) throw saleError;
      if (!saleData) throw new Error('Sale not found');

      // 2. Fetch the related car separately
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('*')
        .eq('id', saleData.car_id)
        .single();

      if (carError) console.error('Error fetching car:', carError);

      // 3. Fetch the agent profile separately
      let agentData = null;
      if (saleData.agent_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', saleData.agent_id)
          .single();
        
        if (profileError) console.error('Error fetching agent profile:', profileError);
        else agentData = profileData;
      }

      // 4. Combine data manually
      setSale({
        ...saleData,
        cars: carData,
        agent_name: agentData?.full_name || 'Sales Agent'
      });

    } catch (err) {
      console.error('Invoice fetch error:', err);
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
        <Loader2 className="animate-spin text-toyota-red" size={40} />
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-4 font-sans">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-sm text-toyota-red">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-toyota-black">Error Loading Invoice</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{error || 'Invoice not found'}</p>
        <button onClick={() => navigate('/pos')} className="btn-primary">
          Back to POS
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex items-center justify-between no-print">
        <button 
          onClick={() => navigate('/customers')}
          className="flex items-center gap-2 text-gray-400 hover:text-toyota-red transition-colors font-black uppercase text-[10px] tracking-widest"
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

      <div id="invoice-content" className="bg-white text-toyota-black rounded-sm overflow-hidden shadow-2xl p-8 md:p-12 border border-gray-100">
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row justify-between gap-8 pb-8 border-b-4 border-toyota-black">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-toyota-red rounded-sm flex items-center justify-center font-black text-white text-2xl italic shadow-lg shadow-toyota-red/20">R</div>
              <h1 className="text-3xl font-black tracking-tighter text-toyota-black uppercase italic">RitoMotors</h1>
            </div>
            <div className="space-y-1 text-gray-500 text-[10px] font-black uppercase tracking-widest">
              <p className="flex items-center gap-2"><MapPin size={14} className="text-toyota-red" /> Tagbilaran City, Bohol, Philippines</p>
              <p className="flex items-center gap-2"><Phone size={14} className="text-toyota-red" /> +63 912 345 6789</p>
              <p className="flex items-center gap-2"><Mail size={14} className="text-toyota-red" /> sales@ritomotors.com</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-5xl font-black text-gray-100 uppercase mb-2 tracking-tighter">Invoice</h2>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice No: <span className="text-toyota-black font-black">#{sale.invoice_no}</span></p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date: <span className="text-toyota-black font-black">{new Date(sale.created_at).toLocaleDateString()}</span></p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment: <span className="text-toyota-black font-black">{sale.payment_method}</span></p>
            </div>
          </div>
        </div>

        {/* Billing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-black text-toyota-red uppercase tracking-[0.2em] mb-3">Bill To</p>
            <h3 className="text-xl font-black uppercase tracking-tight text-toyota-black">{sale.customer_name}</h3>
            <div className="text-gray-500 space-y-1 text-xs font-bold uppercase tracking-widest">
              <p>{sale.customer_email}</p>
              <p>{sale.customer_contact}</p>
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-[10px] font-black text-toyota-red uppercase tracking-[0.2em] mb-3">Sales Agent</p>
            <h3 className="text-xl font-black uppercase tracking-tight text-toyota-black">{sale.agent_name}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RitoMotors Representative</p>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="py-8">
          <p className="text-[10px] font-black text-toyota-red uppercase tracking-[0.2em] mb-4">Vehicle Details</p>
          <div className="bg-toyota-gray rounded-sm p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h4 className="text-2xl font-black uppercase tracking-tight text-toyota-black mb-1">{sale.cars?.year} {sale.cars?.make} {sale.cars?.model}</h4>
                <p className="text-toyota-red font-black font-mono text-[10px] tracking-widest uppercase mb-4">VIN: {sale.cars?.vin}</p>
                <div className="flex flex-wrap gap-2">
                  {sale.cars?.specs?.map((spec, i) => (
                    <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded-sm text-[9px] font-black uppercase tracking-widest text-toyota-charcoal">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehicle Price</p>
                <p className="text-4xl font-black text-toyota-black tracking-tighter">${Number(sale.subtotal).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end pt-8">
          <div className="w-full md:w-80 space-y-3">
            <div className="flex justify-between text-gray-500 text-[11px] font-black uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-toyota-black">${Number(sale.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-[11px] font-black uppercase tracking-widest">
              <span>Tax ({sale.tax_rate}%)</span>
              <span className="text-toyota-black">${Number(sale.tax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-[11px] font-black uppercase tracking-widest">
              <span>Dealership Fee</span>
              <span className="text-toyota-black">${Number(sale.dealership_fee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-[11px] font-black uppercase tracking-widest">
              <span>Discount</span>
              <span className="text-toyota-red">-${Number(sale.discount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-6 border-t-4 border-toyota-black">
              <span className="text-xl font-black uppercase tracking-tighter">Grand Total</span>
              <span className="text-4xl font-black text-toyota-red tracking-tighter">${Number(sale.grand_total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-gray-100 text-center">
          <p className="text-toyota-black text-[10px] font-black uppercase tracking-[0.2em] mb-2">Thank you for choosing RitoMotors!</p>
          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">This is a computer-generated invoice. No signature required.</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
