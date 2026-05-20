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
  ArrowRight,
  RefreshCw,
  LogOut,
  LayoutDashboard,
  Calendar,
  DollarSign,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';

const CustomerPortal = ({ user, profile }) => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [recommendedCars, setRecommendedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchMyInquiries(),
      fetchRecommendedCars()
    ]);
    setLoading(false);
  };

  const fetchMyInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_inquiries')
        .select('*, cars (make, model, year, price, image_url)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchRecommendedCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'Available')
        .limit(3);

      if (error) throw error;
      setRecommendedCars(data || []);
    } catch (err) {
      console.error('Error fetching recommended cars:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
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

  // Calculate stats
  const totalInquiries = inquiries.length;
  const pendingInquiries = inquiries.filter(i => i.status === 'Pending').length;
  const activeInquiries = inquiries.filter(i => ['Contacted', 'Converted'].includes(i.status)).length;
  const latestStaffUpdate = inquiries.find(i => i.staff_message)?.staff_message || 'No staff response yet.';

  const StatusTimeline = ({ currentStatus }) => {
    const statuses = [
      { id: 'Pending', label: 'Pending', color: 'bg-amber-500', shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.4)]' },
      { id: 'Contacted', label: 'Contacted', color: 'bg-blue-500', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.4)]' },
      { id: 'Converted', label: 'Converted', color: 'bg-emerald-500', shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]' }
    ];
    
    const currentIndex = statuses.findIndex(s => s.id === currentStatus);
    const isCancelled = currentStatus === 'Cancelled';

    if (isCancelled) {
      return (
        <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-100 rounded-sm text-toyota-red font-black uppercase text-[10px] tracking-widest animate-in fade-in zoom-in-95 duration-300">
          <XCircle size={16} /> 
          <span>Inquiry Cancelled</span>
        </div>
      );
    }

    return (
      <div className="flex items-center w-full max-w-sm gap-0 pt-2">
        {statuses.map((status, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isInactive = idx > currentIndex;
          
          let circleClass = 'bg-gray-200';
          let labelClass = 'text-gray-300';
          let lineClass = 'bg-gray-200';

          if (isCurrent) {
            circleClass = `${status.color} ${status.shadow} scale-125`;
            labelClass = 'text-toyota-black font-black scale-105';
          } else if (isCompleted) {
            circleClass = status.color;
            labelClass = 'text-toyota-charcoal font-bold';
            lineClass = status.color;
          }

          return (
            <React.Fragment key={status.id}>
              <div className="flex flex-col items-center gap-2 flex-1 relative">
                <div className={`w-3 h-3 rounded-full transition-all duration-500 relative z-10 ${circleClass}`} />
                <span className={`text-[9px] uppercase tracking-wider transition-all duration-500 text-center whitespace-nowrap ${labelClass}`}>
                  {status.label}
                </span>
              </div>
              {idx < statuses.length - 1 && (
                <div className="flex-1 px-1 mb-5">
                  <div className={`h-[2px] w-full transition-all duration-700 ${lineClass}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 font-sans bg-toyota-gray min-h-screen">
        <Loader2 className="animate-spin text-toyota-red" size={48} />
        <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans p-4 md:p-8 bg-toyota-gray min-h-screen">
      {/* Dashboard Header */}
      <div className="relative overflow-hidden bg-toyota-black text-white p-8 md:p-12 rounded-sm shadow-2xl border-b-4 border-toyota-red">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-toyota-red skew-x-[30deg] translate-x-1/2 opacity-10" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-toyota-red rounded-sm flex items-center justify-center font-black text-2xl italic shadow-lg shadow-toyota-red/20 rotate-3">R</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-toyota-red leading-none mb-1">Customer Dashboard</p>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
                Welcome, <span className="text-toyota-red">{profile?.full_name?.split(' ')[0] || 'Valued Customer'}</span>
              </h1>
            </div>
          </div>
          <p className="text-gray-400 max-w-xl font-bold uppercase tracking-widest text-[10px] md:text-xs">
            Track your inquiries, staff updates, and vehicle interests in real-time.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-50 rounded-sm text-toyota-black group-hover:text-toyota-red transition-colors">
              <MessageSquare size={20} />
            </div>
            <span className="text-2xl font-black text-toyota-black tracking-tighter">{totalInquiries}</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Total Inquiries</p>
        </div>
        
        <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 rounded-sm text-amber-600">
              <Clock size={20} />
            </div>
            <span className="text-2xl font-black text-toyota-black tracking-tighter">{pendingInquiries}</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Pending Review</p>
        </div>

        <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-sm text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-2xl font-black text-toyota-black tracking-tighter">{activeInquiries}</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Active Progress</p>
        </div>

        <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 rounded-sm text-toyota-red">
              <RefreshCw size={20} />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Latest Staff Note</p>
          </div>
          <p className="text-[10px] font-bold text-toyota-charcoal truncate italic">"{latestStaffUpdate}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section: Inquiries */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-toyota-black italic flex items-center gap-3">
              <div className="w-1.5 h-6 bg-toyota-red" />
              My Vehicle <span className="text-gray-300 not-italic font-medium">Inquiries</span>
            </h2>
            <button 
              onClick={fetchData}
              className="text-[9px] font-black text-gray-400 hover:text-toyota-red uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div className="space-y-6">
            {inquiries.length > 0 ? (
              inquiries.map((inq) => (
                <div key={inq.id} className="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                  <div className="flex flex-col md:flex-row">
                    {/* Vehicle Image/Info */}
                    <div className="md:w-64 relative bg-toyota-gray overflow-hidden">
                      {inq.cars?.image_url ? (
                        <img 
                          src={inq.cars.image_url} 
                          alt={inq.cars.model} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-48 md:h-full flex items-center justify-center text-gray-200">
                          <Car size={48} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        {getStatusBadge(inq.status)}
                      </div>
                    </div>

                    {/* Inquiry Content */}
                    <div className="flex-1 p-6 md:p-8 space-y-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black text-toyota-red uppercase tracking-widest">{inq.cars?.year} Model</span>
                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{inq.payment_method}</span>
                          </div>
                          <h3 className="text-2xl font-black text-toyota-black uppercase tracking-tighter leading-none mb-2">
                            {inq.cars?.make} {inq.cars?.model}
                          </h3>
                          <p className="text-xl font-black text-toyota-red tracking-tighter">${Number(inq.cars?.price).toLocaleString()}</p>
                        </div>
                        <div className="space-y-4 md:text-right">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center md:justify-end gap-2">
                            <Calendar size={12} /> Submitted {new Date(inq.created_at).toLocaleDateString()}
                          </p>
                          <StatusTimeline currentStatus={inq.status} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                        <div className="space-y-3">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Your Message</p>
                          <div className="bg-toyota-gray/30 p-4 rounded-sm border border-gray-50 text-[11px] text-toyota-charcoal italic leading-relaxed">
                            "{inq.message || 'No additional notes provided.'}"
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[9px] font-black text-toyota-red uppercase tracking-widest leading-none">Staff Response</p>
                          <div className={`p-4 rounded-sm border transition-all ${inq.staff_message ? 'bg-red-50 border-toyota-red/10 text-toyota-black' : 'bg-gray-50 border-gray-100 text-gray-400 italic'}`}>
                            <p className="text-[11px] font-medium leading-relaxed">
                              {inq.staff_message || 'No staff response yet. Our team is currently reviewing your inquiry.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-sm border border-dashed border-gray-200">
                <MessageSquare size={48} className="mx-auto text-gray-100 mb-4" />
                <h3 className="text-xl font-black text-toyota-black uppercase tracking-tight">No Active Inquiries</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2 mb-8">Ready to find your next vehicle?</p>
                <button 
                  onClick={() => navigate('/showroom')}
                  className="btn-primary px-8"
                >
                  Explore Showroom
                </button>
              </div>
            )}
          </div>

          {/* Recommended Cars Section */}
          <div className="pt-12 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
              <h2 className="text-xl font-black uppercase tracking-tight text-toyota-black italic flex items-center gap-3">
                <div className="w-1.5 h-6 bg-toyota-black" />
                Recommended <span className="text-gray-300 not-italic font-medium">For You</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recommendedCars.map((car) => (
                <div key={car.id} className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="aspect-[16/10] bg-toyota-gray mb-4 overflow-hidden rounded-sm">
                    {car.image_url ? (
                      <img src={car.image_url} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <Car size={32} />
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-toyota-black uppercase tracking-tight truncate">{car.make} {car.model}</h4>
                  <p className="text-toyota-red font-black text-xs tracking-tighter mb-4">${Number(car.price).toLocaleString()}</p>
                  <button 
                    onClick={() => navigate('/showroom')}
                    className="w-full py-2 bg-toyota-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-toyota-red transition-colors flex items-center justify-center gap-2"
                  >
                    View Details <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Profile & Quick Actions */}
        <div className="space-y-8">
          <div className="bg-white border border-gray-100 rounded-sm shadow-2xl overflow-hidden">
            <div className="h-2 bg-toyota-red w-full" />
            <div className="p-8 space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 bg-toyota-gray rounded-full flex items-center justify-center text-toyota-red border-4 border-white shadow-xl relative">
                  <User size={48} />
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-toyota-black uppercase tracking-tighter leading-none mb-1">{profile?.full_name}</h3>
                  <div className="inline-flex items-center px-2 py-0.5 bg-toyota-red text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-sm">
                    {profile?.role || 'Customer'}
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-y border-gray-50 py-6">
                <div className="flex items-center gap-3 text-toyota-charcoal">
                  <Mail size={16} className="text-toyota-red" />
                  <span className="text-[11px] font-bold tracking-tight lowercase">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-toyota-charcoal">
                  <Phone size={16} className="text-toyota-red" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">{profile?.contact_number || 'No contact provided'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quick Actions</p>
                <button 
                  onClick={() => navigate('/showroom')}
                  className="w-full py-4 bg-toyota-red text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-lg shadow-toyota-red/20 hover:bg-red-700 transition-all flex items-center justify-center gap-3 group"
                >
                  Browse Showroom <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={fetchData}
                  className="w-full py-4 border border-gray-100 text-toyota-black text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-toyota-gray transition-all flex items-center justify-center gap-3"
                >
                  Refresh Data <RefreshCw size={14} />
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 border border-red-50 text-toyota-red text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-red-50 transition-all flex items-center justify-center gap-3"
                >
                  Logout Session <LogOut size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-toyota-black text-white p-8 rounded-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-toyota-red skew-x-[45deg] translate-x-8 -translate-y-8 opacity-20" />
            <h4 className="text-lg font-black uppercase tracking-tight mb-2 italic">Need <span className="text-toyota-red">Assistance?</span></h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed mb-6">
              Our sales team is available Mon-Fri, 9am - 6pm.
            </p>
            <div className="space-y-4">
              <a href="tel:+639123456789" className="flex items-center gap-3 text-xs font-black text-white hover:text-toyota-red transition-colors">
                <Phone size={16} /> +63 912 345 6789
              </a>
              <a href="mailto:support@ritomotors.com" className="flex items-center gap-3 text-xs font-black text-white hover:text-toyota-red transition-colors">
                <Mail size={16} /> support@ritomotors.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
