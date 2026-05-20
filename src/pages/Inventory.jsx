import React, { useState, useEffect } from 'react';
import { 
  Car,
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';

const Inventory = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    price: '',
    status: 'Available',
    specs: '',
    image_url: ''
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (car = null) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        make: car.make,
        model: car.model,
        year: car.year,
        vin: car.vin,
        price: car.price,
        status: car.status,
        specs: car.specs?.join(', ') || '',
        image_url: car.image_url || ''
      });
    } else {
      setEditingCar(null);
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        price: '',
        status: 'Available',
        specs: '',
        image_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const carData = {
      ...formData,
      price: parseFloat(formData.price),
      specs: formData.specs.split(',').map(s => s.trim()).filter(s => s !== '')
    };

    try {
      if (editingCar) {
        const { error } = await supabase
          .from('cars')
          .update(carData)
          .eq('id', editingCar.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cars')
          .insert([carData]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchCars();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchCars();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filteredCars = cars.filter(car => 
    car.make.toLowerCase().includes(search.toLowerCase()) ||
    car.model.toLowerCase().includes(search.toLowerCase()) ||
    car.vin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Inventory Management</h1>
          <p className="text-[10px] font-black text-toyota-charcoal uppercase tracking-[0.2em] mt-2">Manage your vehicle stock and details.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-toyota-charcoal" size={18} />
          <input
            type="text"
            placeholder="Search by make, model, or VIN..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50/50 border border-toyota-red/20 rounded-sm flex items-center gap-3 text-toyota-red text-xs font-bold uppercase tracking-wider">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="table-container">
        <table className="w-full text-left">
          <thead>
            <tr className="table-header">
              <th className="table-cell">Vehicle</th>
              <th className="table-cell">VIN</th>
              <th className="table-cell">Price</th>
              <th className="table-cell">Status</th>
              <th className="table-cell text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !cars.length ? (
              <tr>
                <td colSpan="5" className="table-cell text-center py-12">
                  <Loader2 className="animate-spin mx-auto text-toyota-red" size={32} />
                </td>
              </tr>
            ) : filteredCars.length > 0 ? (
              filteredCars.map((car) => (
                <tr key={car.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-sm bg-toyota-gray flex-shrink-0 overflow-hidden border border-gray-100">
                        {car.image_url ? (
                          <img src={car.image_url} alt={car.model} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Car size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-black text-toyota-black uppercase text-xs tracking-tight">{car.make} {car.model}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{car.year}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-[10px] font-black font-mono text-toyota-charcoal tracking-widest">{car.vin}</td>
                  <td className="table-cell font-black text-toyota-red">${Number(car.price).toLocaleString()}</td>
                  <td className="table-cell">
                    <Badge variant={
                      car.status === 'Available' ? 'success' : 
                      car.status === 'Reserved' ? 'warning' : 'danger'
                    }>
                      {car.status}
                    </Badge>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(car)}
                        className="p-2 text-gray-400 hover:text-toyota-red hover:bg-toyota-red/5 rounded-sm transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(car.id)}
                        className="p-2 text-gray-400 hover:text-toyota-red hover:bg-toyota-red/5 rounded-sm transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="table-cell text-center py-12 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                  No vehicles found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Car Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-toyota-black/80 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between z-10">
              <h2 className="text-xl font-black uppercase tracking-tight text-toyota-black">{editingCar ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-toyota-red transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Make" 
                  required 
                  value={formData.make} 
                  onChange={(e) => setFormData({...formData, make: e.target.value})} 
                  placeholder="e.g. Toyota"
                />
                <Input 
                  label="Model" 
                  required 
                  value={formData.model} 
                  onChange={(e) => setFormData({...formData, model: e.target.value})} 
                  placeholder="e.g. Camry"
                />
                <Input 
                  label="Year" 
                  type="number" 
                  required 
                  value={formData.year} 
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})} 
                />
                <Input 
                  label="VIN" 
                  required 
                  value={formData.vin} 
                  onChange={(e) => setFormData({...formData, vin: e.target.value.toUpperCase()})} 
                  placeholder="17-character VIN"
                />
                <Input 
                  label="Price ($)" 
                  type="number" 
                  step="0.01" 
                  required 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  placeholder="0.00"
                />
                <Select 
                  label="Status" 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  options={[
                    { label: 'Available', value: 'Available' },
                    { label: 'Reserved', value: 'Reserved' },
                    { label: 'Sold', value: 'Sold' },
                  ]}
                />
                <div className="md:col-span-2">
                  <Input 
                    label="Image URL" 
                    value={formData.image_url} 
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                    placeholder="https://your-supabase-url.com/storage/v1/object/public/cars/..."
                  />
                  <p className="mt-1 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                    Upload the correct car photo to Supabase Storage, then paste the public URL here.
                  </p>
                  {formData.image_url && (
                    <div className="mt-2 w-full h-32 rounded-sm bg-toyota-gray overflow-hidden border border-gray-100">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="label">Specifications (comma separated)</label>
                <textarea 
                  className="input min-h-[100px] resize-none"
                  value={formData.specs}
                  onChange={(e) => setFormData({...formData, specs: e.target.value})}
                  placeholder="Leather Seats, Sunroof, Navigation..."
                />
              </div>

              <div className="pt-6 flex flex-col md:flex-row gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {editingCar ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
