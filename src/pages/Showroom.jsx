import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Search, 
  Info, 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  Tag,
  Calendar,
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';

const CarCard = ({ car, handleOpenModal }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="card group hover:border-blue-500/50 transition-all duration-300 flex flex-col">
      <div className="aspect-[16/9] bg-slate-800/50 relative overflow-hidden">
        {car.image_url && !imgError ? (
          <img 
            src={car.image_url} 
            alt={`${car.make} ${car.model}`} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car size={80} className="text-slate-700 group-hover:text-blue-500/20 transition-colors duration-500" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge variant="success" className="px-3 py-1 text-[10px] uppercase font-black tracking-widest bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            Available
          </Badge>
        </div>
        <div className="absolute bottom-4 right-4 text-right bg-slate-950/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Price</p>
          <p className="text-xl font-black text-white">${Number(car.price).toLocaleString()}</p>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div>
          <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-1">
            <Tag size={12} />
            {car.year} Model
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">
            {car.make} {car.model}
          </h3>
          <p className="text-xs font-mono text-slate-500">VIN: {car.vin}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 min-h-[50px]">
          {car.specs?.slice(0, 4).map((spec, i) => (
            <span key={i} className="px-2 py-0.5 bg-slate-800/50 border border-slate-700/50 rounded-md text-[10px] font-bold text-slate-400">
              {spec}
            </span>
          ))}
          {car.specs?.length > 4 && (
            <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700/50 rounded-md text-[10px] font-bold text-slate-500">
              +{car.specs.length - 4} more
            </span>
          )}
        </div>

        <button 
          onClick={() => handleOpenModal(car)}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 group/btn"
        >
          <Zap size={18} className="fill-current" />
          <span className="font-black uppercase tracking-widest text-xs">Reserve / Buy Inquiry</span>
        </button>
      </div>
    </div>
  );
};

const Showroom = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    payment_method: 'Cash',
    message: ''
  });

  useEffect(() => {
    fetchAvailableCars();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        setProfile(profile);
        setFormData(prev => ({
          ...prev,
          customer_name: profile.full_name || '',
          customer_email: session.user.email || '',
          customer_contact: profile.contact_number || ''
        }));
      }
    }
  };

  const fetchAvailableCars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'Available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const inquiryData = {
        ...formData,
        car_id: selectedCar.id,
        customer_id: user?.id || null
      };

      const { error } = await supabase
        .from('customer_inquiries')
        .insert([inquiryData]);

      if (error) throw error;
      setSuccess(true);
      setFormData({
        customer_name: '',
        customer_contact: '',
        customer_email: '',
        payment_method: 'Cash',
        message: ''
      });
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCars = cars.filter(car => 
    car.make.toLowerCase().includes(search.toLowerCase()) ||
    car.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/login')}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-blue-600/20">R</div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">RitoMotors <span className="text-blue-500 not-italic tracking-normal lowercase font-bold">Showroom</span></h1>
            </div>
            <p className="text-slate-400 font-medium ml-12">Discover your next dream vehicle in our curated collection.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by make or model..."
              className="input pl-10 h-12 bg-slate-900/50 border-slate-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Inventory Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Inventory...</p>
          </div>
        ) : filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} handleOpenModal={handleOpenModal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-600">
              <Car size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-300">No Vehicles Found</h3>
            <p className="text-slate-500 mt-2">Check back later for new arrivals.</p>
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      {isModalOpen && (
// ... existing inquiry modal code

        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {success ? (
              <div className="p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Inquiry Sent!</h2>
                  <p className="text-slate-400 mt-2 font-medium">Our sales team will contact you shortly regarding the <span className="text-white font-bold">{selectedCar?.make} {selectedCar?.model}</span>.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/20">R</div>
                    <div>
                      <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Inquiry Form</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Vehicle: {selectedCar?.make} {selectedCar?.model}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                  <div className="space-y-4">
                    {!user && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3 text-blue-400 text-[11px] font-bold">
                        <Info size={16} />
                        <span>Create an account or login to track your inquiry status.</span>
                      </div>
                    )}
                    <Input 
                      label="Full Name" 
                      required 
                      value={formData.customer_name} 
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})} 
                      placeholder="e.g. John Doe"
                      disabled={!!user}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        label="Contact Number" 
                        required 
                        value={formData.customer_contact} 
                        onChange={(e) => setFormData({...formData, customer_contact: e.target.value})} 
                        placeholder="+63 9xx..."
                        disabled={!!user}
                      />
                      <Input 
                        label="Email Address" 
                        type="email"
                        required 
                        value={formData.customer_email} 
                        onChange={(e) => setFormData({...formData, customer_email: e.target.value})} 
                        placeholder="john@example.com"
                        disabled={!!user}
                      />
                    </div>
                    <Select 
                      label="Preferred Payment Method" 
                      value={formData.payment_method} 
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      options={[
                        { label: 'Cash', value: 'Cash' },
                        { label: 'Bank Transfer', value: 'Bank Transfer' },
                        { label: 'Financing', value: 'Financing' },
                      ]}
                    />
                    <div>
                      <label className="label">Message / Notes</label>
                      <textarea 
                        className="input min-h-[80px] py-3 resize-none bg-slate-950 border-slate-800"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Any specific questions or preferences?"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                    <span className="font-black uppercase tracking-widest text-xs">Submit Inquiry</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-24 pt-12 border-t border-slate-900 text-center space-y-4 pb-12">
        <div className="flex items-center justify-center gap-3 grayscale opacity-30">
          <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center font-bold text-slate-900 text-sm">R</div>
          <span className="font-black uppercase tracking-widest text-xs text-white">RitoMotors Dealership</span>
        </div>
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Tagbilaran City, Bohol, Philippines | +63 912 345 6789</p>
      </footer>
    </div>
  );
};

export default Showroom;
