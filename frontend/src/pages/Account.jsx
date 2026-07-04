import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  ShoppingBag, MapPin, User, LogOut, Package, CheckCircle, 
  Truck, Clock, MessageSquare, Plus, ArrowRight, Download, 
  AlertCircle, ShieldAlert 
} from 'lucide-react';

const Account = () => {
  const { user, logout } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [addressSubmitLoading, setAddressSubmitLoading] = useState(false);

  // Support tickets states
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [ticketSubmitLoading, setTicketSubmitLoading] = useState(false);
  
  // Ticket chat reply state
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubmitLoading, setReplySubmitLoading] = useState(false);

  // Check query params for success message
  const isSuccess = searchParams.get('order_success') === 'true';

  const fetchAddresses = async () => {
    try {
      const addrRes = await API.get('/addresses');
      setAddresses(Array.isArray(addrRes.data.data) ? addrRes.data.data : (Array.isArray(addrRes.data) ? addrRes.data : []));
    } catch (error) {
      console.error('Error fetching addresses', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const ticketRes = await API.get('/tickets');
      setTickets(Array.isArray(ticketRes.data.data) ? ticketRes.data.data : []);
    } catch (error) {
      console.error('Error fetching support tickets', error);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const orderRes = await API.get('/orders');
      const rawOrders = orderRes.data;
      setOrders(Array.isArray(rawOrders) ? rawOrders : (Array.isArray(rawOrders.data) ? rawOrders.data : []));

      await fetchAddresses();
      await fetchTickets();
    } catch (error) {
      console.error('Error fetching account data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Status mapping to steps
  const getStatusStep = (status) => {
    const steps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
    return steps.indexOf(status);
  };

  // Address creation
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressLine || !city || !state || !pincode || !phone) return;

    setAddressSubmitLoading(true);
    try {
      await API.post('/addresses', {
        address_line: addressLine,
        city,
        state,
        pincode,
        phone
      });
      setAddressLine('');
      setCity('');
      setState('');
      setPincode('');
      setPhone('');
      setShowAddressForm(false);
      await fetchAddresses();
      alert('Address added successfully.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save address.');
    } finally {
      setAddressSubmitLoading(false);
    }
  };

  // Ticket creation
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    setTicketSubmitLoading(true);
    try {
      await API.post('/tickets', {
        subject: ticketSubject,
        message: ticketMessage,
        priority: ticketPriority
      });
      setTicketSubject('');
      setTicketMessage('');
      setTicketPriority('Medium');
      setShowTicketModal(false);
      await fetchTickets();
      alert('Support ticket created successfully. Our team will look into it shortly.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit support ticket.');
    } finally {
      setTicketSubmitLoading(false);
    }
  };

  // Ticket detail view loading
  const handleViewTicket = async (ticketId) => {
    try {
      const res = await API.get(`/tickets/${ticketId}`);
      setSelectedTicket(res.data.data);
    } catch (error) {
      alert('Failed to load support ticket details.');
    }
  };

  // Add message reply inside ticket conversation
  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setReplySubmitLoading(true);
    try {
      const res = await API.post(`/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage
      });
      setReplyMessage('');
      // Update ticket thread details dynamically
      await handleViewTicket(selectedTicket.id);
      // Refresh general tickets state list
      fetchTickets();
    } catch (error) {
      alert('Failed to submit message reply.');
    } finally {
      setReplySubmitLoading(false);
    }
  };

  // Securely retrieve and open HTML printable invoice
  const handleViewInvoice = async (orderId) => {
    try {
      const response = await API.get(`/orders/${orderId}/invoice`, { responseType: 'text' });
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error fetching invoice', error);
      alert('Failed to retrieve invoice. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      
      {isSuccess && (
        <div className="mb-8 border border-green-200 bg-green-50 p-4 rounded-lg flex items-center space-x-3 text-green-800">
          <CheckCircle className="flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Thank you for your order!</p>
            <p className="font-medium text-green-700">Payment verified and order successfully confirmed. We will ship your package soon.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Navigation Tabs (Sidebar) */}
        <aside className="w-full md:w-64 space-y-4">
          
          {/* Profile Card */}
          <div className="border border-gray-100 bg-white p-4 rounded-lg text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 border border-gray-100">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800 truncate">{user?.name}</h2>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
            <span className="inline-block text-[9px] font-bold bg-black text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {user?.role}
            </span>
          </div>

          <div className="border border-gray-100 bg-white p-2 rounded-lg flex flex-col">
            <button
              onClick={() => { setActiveTab('orders'); setSelectedTicket(null); }}
              className={`flex items-center space-x-3 rounded-md px-3 py-2 text-xs font-semibold text-left transition ${
                activeTab === 'orders' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag size={14} />
              <span>Order History</span>
            </button>

            <button
              onClick={() => { setActiveTab('addresses'); setSelectedTicket(null); }}
              className={`flex items-center space-x-3 rounded-md px-3 py-2 text-xs font-semibold text-left transition ${
                activeTab === 'addresses' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MapPin size={14} />
              <span>Saved Addresses</span>
            </button>

            <button
              onClick={() => { setActiveTab('tickets'); setSelectedTicket(null); }}
              className={`flex items-center space-x-3 rounded-md px-3 py-2 text-xs font-semibold text-left transition ${
                activeTab === 'tickets' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare size={14} />
              <span>Support & Help Tickets</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 rounded-md px-3 py-2 text-xs font-semibold text-left text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>

        </aside>

        {/* Details Section */}
        <div className="flex-1 w-full border border-gray-100 bg-white rounded-lg p-6 shadow-sm min-h-[400px]">
          
          {loading ? (
            <div className="flex items-center justify-center h-48 text-xs text-gray-400">Loading details...</div>
          ) : activeTab === 'orders' ? (
            <div className="space-y-6">
              <h2 className="text-sm font-bold tracking-wider text-gray-800 uppercase border-b border-gray-50 pb-3">
                Order History ({orders.length})
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400">
                  You haven't placed any orders yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-150 rounded-lg overflow-hidden">
                      {/* Header details */}
                      <div className="bg-gray-50 border-b border-gray-150 px-4 py-3 flex flex-wrap justify-between items-center text-xs gap-3">
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 uppercase font-bold">Order ID</span>
                          <p className="font-bold text-gray-800">#MKY-{order.id}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 uppercase font-bold">Placed On</span>
                          <p className="font-semibold text-gray-700">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 uppercase font-bold">Total Payable</span>
                          <p className="font-bold text-black">₹{order.total_amount}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 uppercase font-bold">Payment Status</span>
                          <p className={`font-bold ${order.payment_status === 'Paid' ? 'text-green-600' : 'text-amber-500'}`}>
                            {order.payment_status}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewInvoice(order.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-white border border-gray-250 rounded text-gray-750 hover:bg-gray-50 transition text-[9px] font-bold uppercase tracking-wider shadow-sm"
                          >
                            <Download size={10} />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>

                      {/* Order items listing */}
                      <div className="p-4 space-y-4">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex space-x-3 text-xs">
                            <img src={item.product_image} alt="" className="h-14 w-10 object-cover rounded bg-gray-50" />
                            <div className="flex-grow space-y-0.5">
                              <p className="font-bold text-gray-800">{item.product_name}</p>
                              <p className="text-[10px] text-gray-500 font-semibold space-x-2">
                                {item.size && <span>Size: {item.size}</span>}
                                {item.color && <span>Color: {item.color}</span>}
                                <span>Qty: {item.quantity}</span>
                              </p>
                            </div>
                            <span className="font-bold text-gray-800">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Visual tracking timeline */}
                      {order.status !== 'Cancelled' && (
                        <div className="bg-gray-50 border-t border-gray-150 px-4 py-4">
                          <div className="relative flex justify-between items-center max-w-lg mx-auto">
                            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 -translate-y-1/2 z-0" />
                            <div 
                              className="absolute top-1/2 left-0 h-[2px] bg-black -translate-y-1/2 z-0 transition-all duration-500" 
                              style={{ width: `${(getStatusStep(order.status) / 3) * 100}%` }}
                            />
                            
                            {[
                              { label: 'Placed', icon: Clock },
                              { label: 'Confirmed', icon: CheckCircle },
                              { label: 'Shipped', icon: Truck },
                              { label: 'Delivered', icon: Package }
                            ].map((step, stepIdx) => {
                              const StepIcon = step.icon;
                              const isActive = getStatusStep(order.status) >= stepIdx;
                              return (
                                <div key={stepIdx} className="relative z-10 flex flex-col items-center">
                                  <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${
                                    isActive ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-400'
                                  }`}>
                                    <StepIcon size={12} />
                                  </div>
                                  <span className="text-[9px] font-bold uppercase mt-1 tracking-wider text-gray-500">
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {order.status === 'Cancelled' && (
                        <div className="bg-red-50 border-t border-gray-150 px-4 py-3 text-center text-xs font-bold text-red-600">
                          This order was Cancelled.
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'addresses' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h2 className="text-sm font-bold tracking-wider text-gray-800 uppercase">
                  Saved Shipping Addresses
                </h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider hover:bg-neutral-800 transition flex items-center space-x-1"
                >
                  <Plus size={12} />
                  <span>Add New</span>
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="border border-gray-150 rounded-xl p-4 space-y-4 bg-gray-50/50">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Add Shipping Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Street Address</label>
                      <input 
                        type="text" 
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="Flat, House no., Building, Company, Apartment, Street"
                        className="w-full rounded border border-gray-250 px-3 py-1.5 text-xs outline-none focus:border-black bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">City</label>
                      <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. New Delhi"
                        className="w-full rounded border border-gray-250 px-3 py-1.5 text-xs outline-none focus:border-black bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">State</label>
                      <input 
                        type="text" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Delhi"
                        className="w-full rounded border border-gray-250 px-3 py-1.5 text-xs outline-none focus:border-black bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Pincode</label>
                      <input 
                        type="text" 
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="e.g. 110001"
                        className="w-full rounded border border-gray-250 px-3 py-1.5 text-xs outline-none focus:border-black bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase">Mobile Phone</label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 99999 88888"
                        className="w-full rounded border border-gray-250 px-3 py-1.5 text-xs outline-none focus:border-black bg-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="border border-gray-200 text-gray-500 text-[10px] font-bold px-4 py-1.5 rounded uppercase hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addressSubmitLoading}
                      className="bg-black text-white text-[10px] font-bold px-4 py-1.5 rounded uppercase hover:bg-neutral-800 transition"
                    >
                      {addressSubmitLoading ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="border border-gray-150 rounded-lg p-4 space-y-2 bg-white hover:shadow-sm transition">
                    <p className="text-xs font-bold text-gray-800">{addr.address_line}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{addr.city}, {addr.state} — {addr.pincode}</p>
                    <p className="text-[10px] text-gray-500 font-bold">Phone: {addr.phone}</p>
                  </div>
                ))}

                {addresses.length === 0 && !showAddressForm && (
                  <div className="col-span-full py-8 text-center text-xs text-gray-400">
                    No shipping addresses saved yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            // activeTab === 'tickets'
            <div className="space-y-6">
              {!selectedTicket ? (
                <>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <h2 className="text-sm font-bold tracking-wider text-gray-800 uppercase">
                      Support Help Tickets
                    </h2>
                    <button
                      onClick={() => setShowTicketModal(true)}
                      className="bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider hover:bg-neutral-800 transition flex items-center space-x-1"
                    >
                      <Plus size={12} />
                      <span>Create Ticket</span>
                    </button>
                  </div>

                  {/* Create Ticket Modal */}
                  {showTicketModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-250 space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-150 pb-2">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">New Support Ticket</h3>
                          <button onClick={() => setShowTicketModal(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase">Ticket Subject</label>
                            <input 
                              type="text" 
                              value={ticketSubject}
                              onChange={(e) => setTicketSubject(e.target.value)}
                              placeholder="e.g. Missing items in order #12"
                              className="w-full rounded border border-gray-250 px-3 py-2 text-xs outline-none focus:border-black"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase">Priority Status</label>
                            <select 
                              value={ticketPriority}
                              onChange={(e) => setTicketPriority(e.target.value)}
                              className="w-full rounded border border-gray-250 px-3 py-2 text-xs outline-none bg-white"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase">Message details</label>
                            <textarea 
                              rows={4}
                              value={ticketMessage}
                              onChange={(e) => setTicketMessage(e.target.value)}
                              placeholder="Please describe your issue or concern in details..."
                              className="w-full rounded border border-gray-250 p-3 text-xs outline-none focus:border-black resize-none"
                              required
                            />
                          </div>
                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowTicketModal(false)}
                              className="border border-gray-200 text-gray-500 text-[10px] font-bold px-4 py-1.5 rounded uppercase hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={ticketSubmitLoading}
                              className="bg-black text-white text-[10px] font-bold px-4 py-1.5 rounded uppercase hover:bg-neutral-800 transition"
                            >
                              {ticketSubmitLoading ? 'Submitting...' : 'Submit'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 border-b border-gray-150 uppercase text-[9px] font-bold">
                          <th className="px-6 py-3">ID</th>
                          <th className="px-6 py-3">Subject</th>
                          <th className="px-6 py-3">Priority</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {tickets.map((t) => (
                          <tr key={t.id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4 font-mono text-[10px]">#TK-{t.id}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">{t.subject}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                t.priority === 'High' ? 'bg-red-50 text-red-600' : t.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'
                              }`}>
                                {t.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                t.status === 'Resolved' || t.status === 'Closed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleViewTicket(t.id)}
                                className="text-[10px] font-bold text-black uppercase tracking-wider hover:underline"
                              >
                                View Chat
                              </button>
                            </td>
                          </tr>
                        ))}
                        {tickets.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-400">
                              No support tickets created.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                // Selected Ticket detailed message thread view
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="text-xs text-gray-400 hover:text-black font-bold"
                    >
                      ← Back to list
                    </button>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 uppercase font-bold mr-2">Status:</span>
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                        selectedTicket.status === 'Resolved' || selectedTicket.status === 'Closed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                  </div>

                  <div className="border border-gray-150 rounded-xl p-4 bg-gray-50/50">
                    <span className="text-[9px] font-black text-gray-400 uppercase">Support Ticket Topic</span>
                    <h3 className="text-sm font-bold text-gray-800 mt-1">{selectedTicket.subject}</h3>
                    <p className="text-[9px] text-gray-400 mt-0.5 uppercase">ID Reference: #TK-{selectedTicket.id}</p>
                  </div>

                  {/* Chat messages thread */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto border border-gray-100 rounded-xl p-4 bg-white">
                    {selectedTicket.messages?.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[80%] rounded-lg p-3 space-y-1 ${
                          msg.user?.role === 'admin' 
                            ? 'bg-zinc-150 text-zinc-900 mr-auto rounded-tl-none border border-zinc-200' 
                            : 'bg-black text-white ml-auto rounded-tr-none'
                        }`}
                      >
                        <div className="flex justify-between items-center space-x-4">
                          <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                            {msg.user?.role === 'admin' ? 'Support Representative' : msg.user?.name}
                          </span>
                          <span className="text-[8px] opacity-60">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed break-words">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  {selectedTicket.status !== 'Closed' ? (
                    <form onSubmit={handlePostReply} className="flex space-x-2">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type reply message to representative..."
                        className="flex-1 rounded-lg border border-gray-250 px-4 py-2 text-xs outline-none focus:border-black"
                        required
                      />
                      <button
                        type="submit"
                        disabled={replySubmitLoading}
                        className="bg-black text-white text-[10px] font-bold px-6 py-2 rounded-lg uppercase tracking-widest hover:bg-neutral-800 transition"
                      >
                        {replySubmitLoading ? '...' : 'Send'}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-red-50 p-3 rounded-lg text-center text-xs font-bold text-red-600">
                      This ticket has been marked Closed and resolved. If you need further help, please create a new support ticket.
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Account;
