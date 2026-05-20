import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  Mail, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Badge from '../components/Badge';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_inquiries')
        .select('*, cars (make, model, year, price)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('customer_inquiries')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Re-fetch to ensure sync across all lists
      await fetchInquiries();
      
      // Update local selected inquiry if it's the one being changed
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
      
      alert(`Inquiry status updated to ${newStatus}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveStaffMessage = async () => {
    try {
      setUpdating(true);
      setSaveSuccess(false);
      const { error } = await supabase
        .from('customer_inquiries')
        .update({ staff_message: selectedInquiry.staff_message })
        .eq('id', selectedInquiry.id);
      
      if (error) throw error;
      
      setSaveSuccess(true);
      alert("Staff message saved.");
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Re-fetch list to keep everything in sync
      await fetchInquiries();
      
      // Explicitly update selected inquiry to ensure UI is fresh
      const updatedInquiry = inquiries.find(inq => inq.id === selectedInquiry.id);
      if (updatedInquiry) {
        setSelectedInquiry({ ...updatedInquiry, staff_message: selectedInquiry.staff_message });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const filteredInquiries = inquiries.filter(inq => 
    inq.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    inq.customer_email.toLowerCase().includes(search.toLowerCase()) ||
    inq.cars?.make.toLowerCase().includes(search.toLowerCase()) ||
    inq.cars?.model.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <Badge variant="warning">{status}</Badge>;
      case 'Contacted': return <Badge variant="info">{status}</Badge>;
      case 'Converted': return <Badge variant="success">{status}</Badge>;
      case 'Cancelled': return <Badge variant="danger">{status}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Customer Inquiries</h1>
          <p className="text-[10px] font-black text-toyota-charcoal uppercase tracking-[0.2em] mt-2">Manage showroom leads and customer inquiries.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-toyota-charcoal" size={18} />
        <input
          type="text"
          placeholder="Search by customer, email, or vehicle..."
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inquiries List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="table-container">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header">
                  <th className="table-cell">Customer</th>
                  <th className="table-cell">Vehicle Interest</th>
                  <th className="table-cell">Status</th>
                  <th className="table-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="table-cell text-center py-12">
                      <Loader2 className="animate-spin mx-auto text-toyota-red" size={32} />
                    </td>
                  </tr>
                ) : filteredInquiries.length > 0 ? (
                  filteredInquiries.map((inq) => (
                    <tr 
                      key={inq.id} 
                      className={`table-row cursor-pointer ${selectedInquiry?.id === inq.id ? 'bg-toyota-red/5 border-l-2 border-l-toyota-red' : ''}`}
                      onClick={() => setSelectedInquiry(inq)}
                    >
                      <td className="table-cell">
                        <div className="font-black text-toyota-black uppercase text-xs tracking-tight">{inq.customer_name}</div>
                        <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{new Date(inq.created_at).toLocaleString()}</div>
                      </td>
                      <td className="table-cell">
                        <div className="text-[10px] font-black text-toyota-charcoal uppercase tracking-widest">{inq.cars?.year} {inq.cars?.make} {inq.cars?.model}</div>
                        <div className="text-[10px] text-toyota-red font-black tracking-widest">${Number(inq.cars?.price).toLocaleString()}</div>
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(inq.status)}
                      </td>
                      <td className="table-cell text-right">
                        <button className="p-2 text-gray-400 hover:text-toyota-red transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="table-cell text-center py-12 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                      No inquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inquiry Detail Sidebar */}
        <div className="space-y-6">
          {selectedInquiry ? (
            <div className="card p-6 sticky top-6 space-y-8 animate-in slide-in-from-right-4 duration-300 border-t-4 border-t-toyota-red">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight text-toyota-black">Inquiry Details</h2>
                {getStatusBadge(selectedInquiry.status)}
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-toyota-gray rounded-sm border border-gray-100 space-y-3">
                  <div className="flex items-center gap-3 text-toyota-charcoal">
                    <Phone size={16} className="text-toyota-red" />
                    <span className="text-xs font-bold uppercase tracking-widest">{selectedInquiry.customer_contact}</span>
                  </div>
                  <div className="flex items-center gap-3 text-toyota-charcoal">
                    <Mail size={16} className="text-toyota-red" />
                    <span className="text-xs font-bold lowercase tracking-wider">{selectedInquiry.customer_email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Message from Customer</p>
                  <div className="p-4 bg-toyota-gray/50 rounded-sm border border-gray-100 text-xs text-toyota-charcoal italic leading-relaxed">
                    "{selectedInquiry.message || 'No additional notes provided.'}"
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-toyota-red uppercase tracking-widest">Staff Message (Visible to Customer)</p>
                  <textarea 
                    className="input min-h-[80px] py-3 resize-none bg-toyota-gray border-gray-100 text-xs font-medium text-toyota-charcoal"
                    value={selectedInquiry.staff_message || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedInquiry(prev => ({ ...prev, staff_message: val }));
                    }}
                    placeholder="Add a message for the customer..."
                  />
                  <button 
                    disabled={updating}
                    onClick={handleSaveStaffMessage}
                    className={`btn-secondary w-full py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${saveSuccess ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}`}
                  >
                    {updating ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle2 size={14} />
                        Message Saved!
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        Save Staff Message
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Vehicle Interest</p>
                  <div className="p-4 bg-toyota-gray rounded-sm border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-black text-toyota-black uppercase tracking-tight">{selectedInquiry.cars?.make} {selectedInquiry.cars?.model}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedInquiry.cars?.year} Model</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-toyota-red tracking-tighter">${Number(selectedInquiry.cars?.price).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Update Inquiry Status</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedInquiry.id, 'Contacted')}
                    className="btn-secondary py-2 text-[10px] flex items-center justify-center gap-2 hover:bg-toyota-red/5 hover:text-toyota-red border-gray-100"
                  >
                    <Phone size={14} />
                    Contacted
                  </button>
                  <button 
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedInquiry.id, 'Converted')}
                    className="btn-secondary py-2 text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 border-gray-100"
                  >
                    <CheckCircle2 size={14} />
                    Converted
                  </button>
                  <button 
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedInquiry.id, 'Cancelled')}
                    className="btn-secondary py-2 text-[10px] flex items-center justify-center gap-2 hover:bg-red-50 hover:text-toyota-red border-gray-100"
                  >
                    <XCircle size={14} />
                    Cancelled
                  </button>
                  <button 
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedInquiry.id, 'Pending')}
                    className="btn-secondary py-2 text-[10px] flex items-center justify-center gap-2 hover:bg-amber-50 hover:text-amber-600 border-gray-100"
                  >
                    <Clock size={14} />
                    Pending
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center border-dashed flex flex-col items-center justify-center space-y-4 bg-white/50">
              <div className="w-16 h-16 bg-toyota-gray rounded-full flex items-center justify-center text-gray-300">
                <MessageSquare size={32} />
              </div>
              <div>
                <h3 className="text-sm font-black text-toyota-black uppercase tracking-widest">No Inquiry Selected</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Select an inquiry from the list to view details.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inquiries;
