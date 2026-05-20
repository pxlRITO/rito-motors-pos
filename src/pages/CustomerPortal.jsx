import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MessageSquare, 
  Car, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  Loader2, 
  AlertCircle,
  Tag,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Badge from '../components/Badge';

const CustomerPortal = ({ user, profile }) => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMyInquiries();
    }
  }, [user]);

  const fetchMyInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_inquiries')
        .select('*, cars (make, model, year, price, image_url)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <Badge variant="warning">{status}</Badge>;
      case 'Contacted': return <Badge variant="info">{status}</Badge>;
      case 'Converted': return <Badge variant="success">{status}</Badge>;
      case 'Cancelled': return <Badge variant="danger">{status}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">Customer <span className="text-blue-500 not-italic">Portal</span></h1>
          <p className="text-slate-400 font-medium">Welcome back, {profile?.full_name || 'Valued Customer'}.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
            <User size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none mb-1">{profile?.full_name}</p>
            <p className="text-[10px] text-slate-500 font-mono">{user?.email}</p>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-500" />
            My Inquiries
          </h2>
          <button 
            onClick={() => navigate('/showroom')}
            className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            Browse More Cars <ArrowRight size={14} />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {inquiries.length > 0 ? (
            inquiries.map((inq) => (
              <div key={inq.id} className="card p-6 bg-slate-900/50 hover:border-slate-700 transition-all group">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Vehicle Info */}
                  <div className="flex items-center gap-4 lg:w-1/3">
                    <div className="w-24 h-16 rounded-xl bg-slate-800 overflow-hidden border border-slate-700 flex-shrink-0">
                      {inq.cars?.image_url ? (
                        <img src={inq.cars.image_url} alt={inq.cars.model} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                          <Car size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">
                        {inq.cars?.make} {inq.cars?.model}
                      </h3>
                      <p className="text-xs font-bold text-slate-500">{inq.cars?.year} Model</p>
                      <p className="text-sm font-black text-blue-500 mt-1">${Number(inq.cars?.price).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Inquiry Info */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Inquiry Details</p>
                        <p className="text-xs text-slate-300 italic">"{inq.message || 'No message provided'}"</p>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1"><Tag size={12} /> {inq.payment_method}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(inq.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Status Update</p>
                        {getStatusBadge(inq.status)}
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        {inq.staff_message ? (
                          <div className="flex gap-2">
                            <span className="text-blue-500 font-bold">Staff:</span>
                            <span>{inq.staff_message}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Our sales team is reviewing your inquiry. We will update you here shortly.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-300 uppercase tracking-tight">No Inquiries Yet</h3>
              <p className="text-slate-500 mt-2 mb-8 max-w-xs mx-auto">Found something you like? Browse our showroom and send an inquiry to get started.</p>
              <button 
                onClick={() => navigate('/showroom')}
                className="btn-primary px-8 py-3 font-black uppercase tracking-widest text-xs"
              >
                Browse Showroom
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CustomerPortal;
