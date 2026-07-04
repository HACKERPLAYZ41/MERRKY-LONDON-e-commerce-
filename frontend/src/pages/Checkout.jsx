import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { MapPin, Phone, CreditCard, ChevronRight, Check } from 'lucide-react';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  
  // New address form
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSubmitLoading, setAddressSubmitLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const subtotal = getCartTotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  // Redirect if cart empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await API.get('/addresses');
        const addrArr = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
        setAddresses(addrArr);
        if (addrArr.length > 0) {
          setSelectedAddressId(addrArr[0].id);
        }
      } catch (error) {
        console.error('Error fetching addresses', error);
      }
    };
    fetchAddresses();
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!addressLine || !city || !state || !pincode || !phone) return;

    setAddressSubmitLoading(true);
    try {
      const response = await API.post('/addresses', {
        address_line: addressLine,
        city,
        state,
        pincode,
        phone
      });

      const newAddr = response.data.address;
      setAddresses((prev) => [newAddr, ...prev]);
      setSelectedAddressId(newAddr.id);
      
      // Clear form
      setAddressLine('');
      setCity('');
      setState('');
      setPincode('');
      setPhone('');
      setShowAddressForm(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save address.');
    } finally {
      setAddressSubmitLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a shipping address.');
      return;
    }

    setPaymentLoading(true);
    try {
      // 1. Create order record on backend
      // Checkout uses the new /checkout endpoint; cart is tracked server-side
      const response = await API.post('/checkout', {
        address_id: selectedAddressId,
      });

      const orderData = response.data;
      const keyId = orderData.razorpay_key_id;
      const isMockKey = keyId.includes('MOCK');

      if (isMockKey) {
        // Bypass real Razorpay library loading and simulate payment verification direct call
        const confirmPayment = window.confirm(
          `Demo Mode (Mock payment keys detected): Do you want to simulate a successful payment transaction for order ₹${orderData.total_amount}?`
        );
        if (confirmPayment) {
          await simulatePaymentSuccess(orderData.razorpay_order_id, 'pay_mock_' + Date.now());
        } else {
          setPaymentLoading(false);
        }
      } else {
        // Trigger real Razorpay checkout
        const options = {
          key: keyId,
          amount: Math.round(orderData.total_amount * 100),
          currency: 'INR',
          name: 'MERRKY LONDON',
          description: 'Fashion Checkout Payment',
          order_id: orderData.razorpay_order_id,
          handler: async function (res) {
            try {
              setPaymentLoading(true);
              await API.post('/checkout/verify', {
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature
              });
              clearCart();
              alert('Order placed successfully!');
              navigate('/account?order_success=true');
            } catch (err) {
              alert('Payment validation failed: ' + (err.response?.data?.error || err.message));
            } finally {
              setPaymentLoading(false);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: '#000000'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (error) {
      alert(error.response?.data?.error || 'Order creation failed.');
    } finally {
      if (!selectedAddressId || !cartItems.length) {
        setPaymentLoading(false);
      }
    }
  };

  const simulatePaymentSuccess = async (razorpayOrderId, razorpayPaymentId) => {
    try {
      await API.post('/checkout/verify', {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: '' // Empty signature parsed by mock check in PHP
      });
      clearCart();
      alert('Demo order placed successfully via test simulation!');
      navigate('/account');
    } catch (err) {
      alert('Mock payment simulation verification failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      
      <h1 className="text-xl font-black text-gray-900 tracking-wider uppercase mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Checkout Steps (2/3 Column) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Step 1: Shipping Addresses */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">1. Shipping Address</h2>
              <button 
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-bold text-black hover:underline"
              >
                {showAddressForm ? 'Cancel' : '+ Add Address'}
              </button>
            </div>

            {/* Save Address Form */}
            {showAddressForm && (
              <form onSubmit={handleCreateAddress} className="border border-gray-200 bg-white p-4 rounded-lg space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Address Line</label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Flat/House No, Building, Street Name"
                    className="w-full rounded border border-gray-200 px-3 py-2 text-xs outline-none focus:border-black"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. London / Delhi"
                      className="w-full rounded border border-gray-200 px-3 py-2 text-xs outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. England / Delhi"
                      className="w-full rounded border border-gray-200 px-3 py-2 text-xs outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Zip/Postal code"
                      className="w-full rounded border border-gray-200 px-3 py-2 text-xs outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contact number"
                      className="w-full rounded border border-gray-200 px-3 py-2 text-xs outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addressSubmitLoading}
                  className="bg-black text-white text-xs font-bold px-6 py-2.5 rounded uppercase hover:bg-gray-800 transition"
                >
                  {addressSubmitLoading ? 'Saving...' : 'Save & Select Address'}
                </button>
              </form>
            )}

            {/* List Saved Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`relative cursor-pointer border rounded-lg p-4 bg-white space-y-2 transition ${
                    selectedAddressId === addr.id
                      ? 'border-black ring-1 ring-black bg-neutral-50/50'
                      : 'border-gray-150 hover:border-gray-300'
                  }`}
                >
                  {selectedAddressId === addr.id && (
                    <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white">
                      <Check size={10} />
                    </span>
                  )}
                  <p className="text-xs font-semibold text-gray-800 leading-normal pr-6">
                    {addr.address_line}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  <p className="text-[10px] text-gray-500 font-semibold flex items-center space-x-1">
                    <Phone size={10} />
                    <span>{addr.phone}</span>
                  </p>
                </div>
              ))}
              
              {addresses.length === 0 && !showAddressForm && (
                <div className="col-span-full border border-dashed border-gray-200 rounded-lg p-6 text-center text-xs text-gray-400">
                  No saved addresses found. Please add a shipping address to place your order.
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Payment details header */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-3">
              2. Payment Method
            </h2>
            <div className="flex items-center space-x-3 p-4 border border-gray-200 bg-white rounded-lg">
              <CreditCard size={18} className="text-gray-400" />
              <div className="text-xs">
                <p className="font-semibold text-gray-800">Razorpay Secure Online Payments</p>
                <p className="text-gray-500 font-light">Supports Credit Cards, Debit Cards, UPI, Netbanking, Wallets</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Summary Card (1/3 Column) */}
        <div className="border border-gray-100 bg-white p-6 rounded-lg shadow-sm space-y-6">
          <h3 className="text-xs font-bold text-gray-800 tracking-wider uppercase border-b border-gray-50 pb-3">
            Review Items
          </h3>

          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const activePrice = item.discount_price !== null ? parseFloat(item.discount_price) : parseFloat(item.price);
              return (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex space-x-3 text-xs">
                  <img src={item.primary_image} alt="" className="h-12 w-9 object-cover rounded bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400">
                      Qty: {item.quantity} {item.size && `| Size: ${item.size}`}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-800">₹{activePrice * item.quantity}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Items Total</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping Fee</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between border-t border-gray-50 pt-3 text-sm font-black text-black">
              <span>Total Payable</span>
              <span>₹{total}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={paymentLoading || !selectedAddressId}
            className={`w-full inline-flex items-center justify-center space-x-2 bg-black text-white font-semibold text-xs py-3.5 tracking-widest uppercase hover:bg-neutral-900 transition duration-300 rounded shadow-md ${
              (!selectedAddressId || paymentLoading) && 'opacity-55 cursor-not-allowed'
            }`}
          >
            <span>{paymentLoading ? 'Processing Checkout...' : 'Pay & Confirm Order'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default Checkout;
