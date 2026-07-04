import React, { useEffect, useState } from 'react';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { Calendar, Eye, EyeOff, Search, Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders');
      // API returns { data: [...] } or { data: { data: [...] } } — extract the array
      const raw = response.data;
      const arr = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : []);
      setOrders(arr);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/control-panel-x7k/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      alert('Order status updated successfully.');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update order status.');
    }
  };

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle size={14} className="text-blue-500" />;
      case 'Shipped': return <Truck size={14} className="text-purple-500" />;
      case 'Delivered': return <Package size={14} className="text-green-500" />;
      case 'Cancelled': return <XCircle size={14} className="text-red-500" />;
      default: return <Clock size={14} className="text-amber-500" />;
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50 pl-64 pb-12">
      <AdminSidebar />

      {/* Header */}
      <header className="bg-white border-b border-gray-150 py-5 px-8 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-sm font-bold text-gray-800 tracking-wider uppercase">Order Administration</h1>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
            Overview client purchases, modify delivery states, and trace transaction values.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Filter Toolbar */}
        <div className="bg-white border border-gray-150 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="relative w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={14} /></span>
            <input
              type="text"
              placeholder="Search by customer name or Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-200 py-1.5 pr-4 pl-9 text-xs outline-none focus:border-black transition"
            />
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Total Orders: {filteredOrders.length} records
          </span>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-400">Loading order records...</div>
        ) : (
          <div className="bg-white border border-gray-150 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 border-b border-gray-150 uppercase text-[9px] font-bold">
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Customer details</th>
                  <th className="px-6 py-3.5">Total Payable</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5">Status Check</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredOrders.map((ord) => (
                  <React.Fragment key={ord.id}>
                    {/* Primary Row */}
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-6 py-3.5 font-bold text-black">#MKY-{ord.id}</td>
                      <td className="px-6 py-3.5">
                        <p className="font-bold text-gray-900 leading-normal">{ord.customer_name}</p>
                        <p className="text-[9px] text-gray-400 font-semibold">{ord.customer_email}</p>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-black">₹{ord.total_amount}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          ord.payment_status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {ord.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center space-x-2">
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 outline-none hover:bg-gray-50 transition"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => toggleExpandOrder(ord.id)}
                          className="p-2 border border-gray-200 rounded-md text-gray-500 hover:text-black hover:border-black transition inline-flex items-center space-x-1"
                        >
                          {expandedOrderId === ord.id ? (
                            <>
                              <EyeOff size={12} />
                              <span className="text-[9px] font-bold uppercase tracking-wider">Hide</span>
                            </>
                          ) : (
                            <>
                              <Eye size={12} />
                              <span className="text-[9px] font-bold uppercase tracking-wider">Details</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Collapsible Details Row */}
                    {expandedOrderId === ord.id && (
                      <tr className="bg-neutral-50/50">
                        <td colSpan={6} className="px-8 py-5 border-t border-b border-gray-150">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                            
                            {/* Shipping Details */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shipping address</h4>
                              <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-1.5 shadow-sm">
                                <p className="font-bold text-gray-800">{ord.customer_name}</p>
                                <p className="text-gray-600 font-light leading-relaxed">{ord.address_line}</p>
                                <p className="text-gray-500">{ord.city}, {ord.state} — {ord.pincode}</p>
                                <p className="text-gray-500 font-bold">Contact: {ord.phone}</p>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ordered Items</h4>
                              <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100 overflow-hidden">
                                {ord.items?.map((item) => (
                                  <div key={item.id} className="p-3.5 flex items-center space-x-3">
                                    <img src={item.product_image} alt="" className="h-12 w-9 object-cover rounded bg-gray-50" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-gray-800 truncate">{item.product_name}</p>
                                      <p className="text-[9px] text-gray-400 font-semibold space-x-2">
                                        {item.size && <span>Size: {item.size}</span>}
                                        {item.color && <span>Color: {item.color}</span>}
                                        <span>Qty: {item.quantity}</span>
                                      </p>
                                    </div>
                                    <span className="font-bold text-gray-800">₹{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">No matching orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </main>

    </div>
  );
};

export default AdminOrders;
