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
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Palette,
  Disc,
  Layers,
  Wind
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';

const CarCard = ({ car, handleOpenModal }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white border border-gray-100 group transition-all duration-500 flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-1 rounded-sm overflow-hidden">
      <div className="aspect-[16/10] bg-gray-50 relative overflow-hidden">
        {car.image_url && !imgError ? (
          <img 
            src={car.image_url} 
            alt={`${car.make} ${car.model}`} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Car size={60} className="text-gray-200 group-hover:text-toyota-red/20 transition-colors duration-700" />
          </div>
        )}
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-toyota-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge variant="success" className="px-3 py-1 bg-emerald-500 text-white border-none shadow-lg shadow-emerald-500/20 font-black">
            Available
          </Badge>
          <div className="px-2 py-1 bg-toyota-black text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-sm w-fit shadow-lg">
            Certified
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="bg-white/90 backdrop-blur-sm p-2 rounded-sm border border-white/20 shadow-xl">
            <p className="text-[8px] font-black text-toyota-red uppercase tracking-widest leading-none">Starting from</p>
            <p className="text-sm font-black text-toyota-black tracking-tighter">${Number(car.price).toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black text-toyota-red uppercase tracking-widest bg-red-50 px-1.5 py-0.5 rounded-sm">{car.year}</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <h3 className="text-xl font-black text-toyota-black uppercase tracking-tight leading-none group-hover:text-toyota-red transition-colors">
            {car.make} {car.model}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-y-3 mb-6 py-4 border-y border-gray-50">
  <div className="space-y-0.5">
    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
      Category
    </p>
    <p className="text-[10px] font-bold text-toyota-charcoal uppercase italic">
      {car.category || 'Vehicle'}
    </p>
  </div>

  <div className="space-y-0.5 text-right">
    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
      Drive
    </p>
    <p className="text-[10px] font-bold text-toyota-charcoal uppercase italic">
      {car.drive_type || 'Not specified'}
    </p>
  </div>
</div>

        <div className="flex flex-wrap gap-1.5 mb-8">
          {car.specs?.slice(0, 4).map((spec, i) => (
            <span key={i} className="px-2 py-1 bg-toyota-gray border border-gray-100 rounded-sm text-[8px] font-black uppercase tracking-widest text-gray-500 hover:border-toyota-red/30 transition-colors">
              {spec}
            </span>
          ))}
        </div>

        <div className="mt-auto">
          <button 
            onClick={() => handleOpenModal(car)}
            className="btn-primary w-full py-4 flex items-center justify-center gap-3 group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
            <span className="font-black uppercase tracking-[0.25em] text-[10px] relative z-10">Request Pricing</span>
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform relative z-10" />
          </button>
        </div>
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
  const [showCustomizer, setShowCustomizer] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    payment_method: 'Cash',
    message: ''
  });

  const [customization, setCustomization] = useState({
    exteriorColor: 'White',
    wheelStyle: 'Standard',
    interiorColor: 'Black',
    stitchingColor: 'Black',
    tint: 'None',
    addons: []
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
        customer_id: user?.id || null,
        customization: customization
      };

      const { error } = await supabase
        .from('customer_inquiries')
        .insert([inquiryData]);

      if (error) throw error;
      setSuccess(true);
      setFormData({
        customer_name: profile?.full_name || '',
        customer_contact: profile?.contact_number || '',
        customer_email: user?.email || '',
        payment_method: 'Cash',
        message: ''
      });
      setCustomization({
        exteriorColor: 'White',
        wheelStyle: 'Standard',
        interiorColor: 'Black',
        stitchingColor: 'Black',
        tint: 'None',
        addons: []
      });
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setShowCustomizer(false);
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
    <div className="min-h-screen bg-toyota-gray text-toyota-black font-sans pb-20">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-toyota-red rounded-sm flex items-center justify-center font-black text-2xl text-white italic rotate-3 shadow-lg shadow-toyota-red/20">R</div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">RitoMotors</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-toyota-red transition-colors">Staff Login</button>
            <button 
              onClick={() => navigate(user ? '/customer' : '/login')}
              className="btn-primary"
            >
              {user ? 'My Portal' : 'Sign In'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-toyota-black text-white py-20 md:py-32 overflow-hidden relative border-b-8 border-toyota-red">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-toyota-red skew-x-[25deg] translate-x-1/3 opacity-20" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-toyota-red/10 border border-toyota-red/20 rounded-sm">
                <Zap size={14} className="text-toyota-red" />
                <span className="text-toyota-red font-black uppercase tracking-[0.4em] text-[10px]">New Arrivals 2026</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-[0.8] mb-4">
                Discover<br />
                <span className="text-toyota-red">Perfection</span>
              </h1>
              <p className="text-gray-400 max-w-lg font-medium text-sm md:text-base leading-relaxed uppercase tracking-wide">
                Experience automotive excellence through our meticulously curated collection of world-class vehicles.
              </p>
            </div>
            
            <div className="hidden lg:block bg-white/5 backdrop-blur-md p-8 rounded-sm border border-white/10 max-w-xs shadow-2xl">
              <div className="flex items-center gap-3 mb-4 text-toyota-red">
                <CheckCircle2 size={24} />
                <p className="text-xs font-black uppercase tracking-widest text-white">Toyota Certified</p>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-bold uppercase tracking-widest">
                Every vehicle in our showroom undergoes a rigorous 160-point inspection to ensure absolute reliability and performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-20">
        {/* Search Bar */}
        <div className="bg-white p-2 rounded-sm shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-2 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
            <input
              type="text"
              placeholder="Filter by Make, Model, or Series..."
              className="w-full pl-16 pr-4 py-6 bg-transparent outline-none font-black text-xs uppercase tracking-[0.2em] text-toyota-black placeholder:text-gray-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary py-6 px-12 text-xs font-black uppercase tracking-[0.3em] group relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10">Search Inventory</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-24 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
          <div>
            <h2 className="section-title">Current Inventory</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-4">Showing {filteredCars.length} Available Units</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>Sort by:</span>
            <select className="bg-transparent border-none outline-none text-toyota-black cursor-pointer hover:text-toyota-red transition-colors">
              <option>Newest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Inventory Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-toyota-red" size={48} />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Inventory...</p>
          </div>
        ) : filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} handleOpenModal={handleOpenModal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white border border-dashed border-gray-300 rounded-sm">
            <Car size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-black uppercase text-gray-400">No Matching Vehicles</h3>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-toyota-black/95 backdrop-blur-md">
          <div className="bg-white border border-gray-100 rounded-sm w-full max-w-xl shadow-[0_0_100px_rgba(235,10,30,0.2)] animate-in zoom-in-95 duration-300 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-toyota-red" />
            
            {success ? (
              <div className="p-16 text-center space-y-8">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 size={56} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-toyota-black uppercase tracking-tight">Request Confirmed</h2>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] leading-relaxed">
                    A RitoMotors representative will contact you shortly regarding the <span className="text-toyota-red">{selectedCar?.year} {selectedCar?.make} {selectedCar?.model}</span>.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-8 bg-toyota-gray border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-toyota-red rounded-full animate-pulse" />
                      <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] leading-none">Vehicle Inquiry & Customization</h2>
                    </div>
                    <p className="text-xl font-black text-toyota-black uppercase tracking-tight">{selectedCar?.make} {selectedCar?.model}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-300 hover:text-toyota-red transition-colors">
                    <X size={32} strokeWidth={3} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto max-h-[70vh] no-scrollbar">
                  {/* Customization Toggle */}
                  <div className="space-y-4">
                    <button 
                      type="button"
                      onClick={() => setShowCustomizer(!showCustomizer)}
                      className="w-full flex items-center justify-between p-4 bg-white border border-toyota-red/20 rounded-sm group hover:border-toyota-red transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="text-toyota-red group-hover:rotate-90 transition-transform duration-500" size={20} />
                        <span className="font-black uppercase tracking-[0.2em] text-[10px] text-toyota-black">Configure Your Vehicle</span>
                      </div>
                      {showCustomizer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showCustomizer && (
                      <div className="p-6 bg-toyota-gray rounded-sm space-y-8 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <Select 
                            label="Exterior Color"
                            icon={<Palette size={14} className="text-toyota-red" />}
                            value={customization.exteriorColor}
                            onChange={(e) => setCustomization({...customization, exteriorColor: e.target.value})}
                            options={['White', 'Black', 'Red', 'Blue', 'Silver', 'Gray'].map(c => ({ label: c, value: c }))}
                          />
                          <Select 
                            label="Wheel Style"
                            icon={<Disc size={14} className="text-toyota-red" />}
                            value={customization.wheelStyle}
                            onChange={(e) => setCustomization({...customization, wheelStyle: e.target.value})}
                            options={['Standard', 'Sport', 'Premium Black', 'Chrome'].map(c => ({ label: c, value: c }))}
                          />
                          <Select 
                            label="Interior Color"
                            icon={<Layers size={14} className="text-toyota-red" />}
                            value={customization.interiorColor}
                            onChange={(e) => setCustomization({...customization, interiorColor: e.target.value})}
                            options={['Black', 'Beige', 'Red', 'Brown'].map(c => ({ label: c, value: c }))}
                          />
                          <Select 
                            label="Stitching Color"
                            value={customization.stitchingColor}
                            onChange={(e) => setCustomization({...customization, stitchingColor: e.target.value})}
                            options={['Black', 'Red', 'White', 'Blue'].map(c => ({ label: c, value: c }))}
                          />
                          <Select 
                            label="Window Tint"
                            icon={<Wind size={14} className="text-toyota-red" />}
                            value={customization.tint}
                            onChange={(e) => setCustomization({...customization, tint: e.target.value})}
                            options={['None', 'Light', 'Medium', 'Dark'].map(c => ({ label: c, value: c }))}
                          />
                        </div>

                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Premium Add-ons</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['Spoiler', 'Body Kit', 'Dashcam', 'Ceramic Coating', 'Premium Sound', 'Leather Seats'].map(addon => (
                              <label key={addon} className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-sm cursor-pointer hover:border-toyota-red/30 transition-all">
                                <input 
                                  type="checkbox"
                                  className="accent-toyota-red w-3 h-3"
                                  checked={customization.addons.includes(addon)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCustomization({...customization, addons: [...customization.addons, addon]});
                                    } else {
                                      setCustomization({...customization, addons: customization.addons.filter(a => a !== addon)});
                                    }
                                  }}
                                />
                                <span className="text-[9px] font-black uppercase tracking-widest text-toyota-charcoal">{addon}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Summary Panel */}
                        <div className="mt-8 p-6 bg-toyota-black text-white rounded-sm space-y-4 shadow-xl border-l-4 border-toyota-red">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-toyota-red">Live Configuration</p>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest italic">Update Instant</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Exterior</p>
                              <p className="text-[10px] font-black uppercase tracking-wider">{customization.exteriorColor}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Wheels</p>
                              <p className="text-[10px] font-black uppercase tracking-wider">{customization.wheelStyle}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Interior</p>
                              <p className="text-[10px] font-black uppercase tracking-wider">{customization.interiorColor} / {customization.stitchingColor}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Glass</p>
                              <p className="text-[10px] font-black uppercase tracking-wider">{customization.tint} Tint</p>
                            </div>
                          </div>
                          {customization.addons.length > 0 && (
                            <div className="pt-3 border-t border-white/10">
                              <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1">Extras</p>
                              <p className="text-[9px] font-medium text-gray-300 italic truncate">
                                {customization.addons.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8 pt-6 border-t border-gray-100">
                    {!user && (
                      <div className="p-4 bg-toyota-red/5 border border-toyota-red/10 rounded-sm flex items-start gap-4">
                        <Info size={20} className="text-toyota-red shrink-0" />
                        <div>
                          <p className="text-[10px] font-black text-toyota-charcoal leading-relaxed uppercase tracking-widest">
                            Exclusive Customer Access
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            <button type="button" onClick={() => navigate('/login')} className="text-toyota-red hover:underline">Sign in</button> to unlock priority service and inquiry tracking.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-toyota-red" />
                      <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-toyota-black">Customer Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <Input 
                        label="Full Legal Name" 
                        required 
                        value={formData.customer_name} 
                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})} 
                        placeholder="John Doe"
                        disabled={!!user}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                          label="Mobile Number" 
                          required 
                          value={formData.customer_contact} 
                          onChange={(e) => setFormData({...formData, customer_contact: e.target.value})} 
                          placeholder="+63 9xx xxx xxxx"
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
                    </div>

                    <Select 
                      label="Payment Option" 
                      value={formData.payment_method} 
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      options={[
                        { label: 'Full Cash Payment', value: 'Cash' },
                        { label: 'Bank Transfer / Wire', value: 'Bank Transfer' },
                        { label: 'Financing / Installment', value: 'Financing' },
                      ]}
                    />
                    
                    <div className="space-y-2">
                      <label className="label">Special Requirements / Notes</label>
                      <textarea 
                        className="input min-h-[120px] resize-none text-xs font-bold uppercase tracking-widest"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="e.g. Preferred test drive schedule, trade-in options..."
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-primary w-full py-5 flex items-center justify-center gap-4 shadow-2xl shadow-toyota-red/30 group/btn"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span className="font-black uppercase tracking-[0.4em] text-xs">Submit Request</span>
                        <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 mt-24 pt-12 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-toyota-black rounded-sm flex items-center justify-center font-black text-xl text-white italic">R</div>
            <span className="text-xl font-black tracking-tighter uppercase italic">RitoMotors</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-toyota-red">Privacy</a>
            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-toyota-red">Terms</a>
            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-toyota-red">Contact</a>
          </div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">© 2026 RitoMotors Dealership</p>
        </div>
      </footer>
    </div>
  );
};

export default Showroom;
