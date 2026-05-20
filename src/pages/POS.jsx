import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Search, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Receipt,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  X,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import Select from '../components/Select';
import SummaryRow from '../components/SummaryRow';

const POS = ({ user, profile }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [error, setError] = useState(null);
  
  const [customer, setCustomer] = useState({
    name: '',
    contact: '',
    email: ''
  });

  const [fees, setFees] = useState({
    taxRate: 12,
    dealershipFee: 500,
    discount: 0,
    paymentMethod: 'Cash'
  });

  useEffect(() => {
    fetchAvailableCars();
  }, []);

  const fetchAvailableCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'Available')
        .order('make', { ascending: true });
      
      if (error) throw error;
      setCars(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCarSelect = (carId) => {
    const car = cars.find(c => c.id === carId);
    setSelectedCar(car);
  };

  // Calculations
  const carPrice = selectedCar ? Number(selectedCar.price) : 0;
  const taxAmount = (carPrice * (fees.taxRate / 100));
  const subtotal = carPrice + taxAmount + Number(fees.dealershipFee);
  const grandTotal = subtotal - Number(fees.discount);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedCar) return;

    setLoading(true);
    setError(null);

    try {
      const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;
      
      const saleData = {
        invoice_no: invoiceNo,
        customer_name: customer.name,
        customer_contact: customer.contact,
        customer_email: customer.email,
        car_id: selectedCar.id,
        agent_id: user.id,
        payment_method: fees.paymentMethod,
        subtotal: carPrice,
        tax_rate: fees.taxRate,
        tax: taxAmount,
        dealership_fee: Number(fees.dealershipFee),
        discount: Number(fees.discount),
        grand_total: grandTotal,
      };

      // 1. Insert sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([saleData])
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Update car status
      const { error: carError } = await supabase
        .from('cars')
        .update({ status: 'Sold' })
        .eq('id', selectedCar.id);

      if (carError) throw carError;

      // 3. Navigate to invoice
      navigate(`/invoice/${sale.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">POS Checkout</h1>
        <p className="text-slate-400">Complete a vehicle sale and generate an invoice.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="card p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-500" />
              Vehicle Selection
            </h2>
            <Select 
              label="Select Available Car"
              value={selectedCar?.id || ''}
              onChange={(e) => handleCarSelect(e.target.value)}
              options={[
                { label: '-- Select a Vehicle --', value: '' },
                ...cars.map(car => ({
                  label: `${car.make} ${car.model} (${car.year}) - $${Number(car.price).toLocaleString()}`,
                  value: car.id
                }))
              ]}
            />
            {selectedCar && (
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-16 rounded-lg bg-slate-900 overflow-hidden border border-slate-700 flex-shrink-0">
                    {selectedCar.image_url ? (
                      <img 
                        src={selectedCar.image_url} 
                        alt={selectedCar.model} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center text-slate-700 ${selectedCar.image_url ? 'hidden' : 'flex'}`}>
                      <Car size={24} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 uppercase font-bold tracking-wider">Selected Vehicle</p>
                    <h3 className="text-xl font-bold">{selectedCar.make} {selectedCar.model}</h3>
                    <p className="text-slate-300 text-xs">VIN: {selectedCar.vin}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Base Price</p>
                  <p className="text-2xl font-bold text-blue-500">${Number(selectedCar.price).toLocaleString()}</p>
                </div>
              </div>
            )}
          </section>

          <section className="card p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <User size={20} className="text-blue-500" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Customer Name" 
                required 
                value={customer.name}
                onChange={(e) => setCustomer({...customer, name: e.target.value})}
                placeholder="Full Name"
              />
              <Input 
                label="Contact Number" 
                required 
                value={customer.contact}
                onChange={(e) => setCustomer({...customer, contact: e.target.value})}
                placeholder="+63 9xx xxx xxxx"
              />
              <div className="md:col-span-2">
                <Input 
                  label="Email Address" 
                  type="email"
                  required 
                  value={customer.email}
                  onChange={(e) => setCustomer({...customer, email: e.target.value})}
                  placeholder="customer@example.com"
                />
              </div>
            </div>
          </section>

          <section className="card p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CreditCard size={20} className="text-blue-500" />
              Payment & Fees
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select 
                label="Payment Method"
                value={fees.paymentMethod}
                onChange={(e) => setFees({...fees, paymentMethod: e.target.value})}
                options={[
                  { label: 'Cash', value: 'Cash' },
                  { label: 'Bank Transfer', value: 'Bank Transfer' },
                  { label: 'Financing', value: 'Financing' },
                ]}
              />
              <Input 
                label="Tax Rate (%)"
                type="number"
                value={fees.taxRate}
                onChange={(e) => setFees({...fees, taxRate: parseFloat(e.target.value) || 0})}
              />
              <Input 
                label="Dealership Fee ($)"
                type="number"
                value={fees.dealershipFee}
                onChange={(e) => setFees({...fees, dealershipFee: parseFloat(e.target.value) || 0})}
              />
              <Input 
                label="Discount ($)"
                type="number"
                value={fees.discount}
                onChange={(e) => setFees({...fees, discount: parseFloat(e.target.value) || 0})}
              />
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <section className="card p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Receipt size={24} className="text-blue-500" />
              Sale Summary
            </h2>
            
            <div className="space-y-2">
              <SummaryRow label="Vehicle Price" value={`$${carPrice.toLocaleString()}`} />
              <SummaryRow label={`Tax (${fees.taxRate}%)`} value={`$${taxAmount.toLocaleString()}`} />
              <SummaryRow label="Dealership Fee" value={`$${Number(fees.dealershipFee).toLocaleString()}`} />
              <SummaryRow label="Discount" value={`-$${Number(fees.discount).toLocaleString()}`} />
              <SummaryRow label="Grand Total" value={`$${grandTotal.toLocaleString()}`} isTotal />
            </div>

            {error && (
              <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading || !selectedCar || !customer.name || !customer.email}
              className="btn-primary w-full mt-8 py-4 text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  <span>Finalize Sale</span>
                </>
              )}
            </button>
            
            <p className="text-[10px] text-slate-500 text-center mt-4 uppercase tracking-widest">
              By finalizing, the vehicle status will be updated to Sold
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default POS;
