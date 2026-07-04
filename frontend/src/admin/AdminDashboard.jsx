import React, { useEffect, useState } from 'react';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer 
} from 'recharts';
import { 
  IndianRupee, ShoppingBag, ShieldAlert, Users, Calendar, ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/control-panel-x7k/dashboard-stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching admin statistics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 pl-64">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Compiling statistics...</p>
      </div>
    );
  }

  const revenueTrend = stats?.monthly_revenue || [];
  const lowStock = stats?.low_stock_products || [];
  const recentOrders = stats?.recent_orders || [];

  return (
    <div className="min-h-screen bg-gray-50 pl-64 pb-12">
      <AdminSidebar />
      
      {/* Top Header */}
      <header className="bg-white border-b border-gray-150 py-5 px-8 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-sm font-bold text-gray-800 tracking-wider uppercase">DASHBOARD OVERVIEW</h1>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5 flex items-center space-x-1">
            <Calendar size={10} />
            <span>Store stats updated just now</span>
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-8 space-y-8 max-w-7xl mx-auto">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Revenue */}
          <div className="bg-white border border-gray-150 p-6 rounded-xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Revenue</span>
              <h3 className="text-xl font-black text-black">₹{stats?.total_revenue || '0.00'}</h3>
            </div>
            <div className="p-3.5 bg-green-50 rounded-xl text-green-600 border border-green-100">
              <IndianRupee size={20} />
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="bg-white border border-gray-150 p-6 rounded-xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Orders Placed</span>
              <h3 className="text-xl font-black text-black">{stats?.orders_count || 0}</h3>
            </div>
            <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
              <ShoppingBag size={20} />
            </div>
          </div>

          {/* Card 3: Customers */}
          <div className="bg-white border border-gray-150 p-6 rounded-xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registered Users</span>
              <h3 className="text-xl font-black text-black">{stats?.customers_count || 0}</h3>
            </div>
            <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
              <Users size={20} />
            </div>
          </div>

          {/* Card 4: Low Stock Alert */}
          <div className="bg-white border border-gray-150 p-6 rounded-xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Low Stock Items</span>
              <h3 className={`text-xl font-black ${stats?.low_stock_count > 0 ? 'text-red-600' : 'text-black'}`}>
                {stats?.low_stock_count || 0}
              </h3>
            </div>
            <div className={`p-3.5 rounded-xl border ${
              stats?.low_stock_count > 0 
                ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' 
                : 'bg-zinc-50 text-zinc-500 border-zinc-150'
            }`}>
              <ShieldAlert size={20} />
            </div>
          </div>

        </div>

        {/* Revenue Charts Area */}
        <div className="bg-white border border-gray-150 p-6 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-gray-800 tracking-wider uppercase mb-6">REVENUE ANALYTICS TREND</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f3f3" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 500 }} stroke="#999" />
                <YAxis tick={{ fontSize: 10, fontWeight: 500 }} stroke="#999" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid #eee' }} />
                <Area type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Double Column Tables (Recent Orders vs Low Stock Warnings) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Orders Card */}
          <div className="bg-white border border-gray-150 p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <h3 className="text-xs font-bold text-gray-800 tracking-wider uppercase">Recent Orders</h3>
              <Link to="/admin/orders" className="text-[10px] font-bold text-gray-500 hover:text-black transition flex items-center space-x-1">
                <span>Manage Orders</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-50 uppercase text-[9px] font-bold">
                    <th className="py-2.5">Order</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Amount</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-y-gray-50">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="text-gray-700">
                      <td className="py-3 font-semibold text-black">#MKY-{ord.id}</td>
                      <td className="py-3 truncate max-w-[120px]">{ord.customer_name}</td>
                      <td className="py-3 font-semibold">₹{ord.total_amount}</td>
                      <td className="py-3">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          ord.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                          ord.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400">No orders placed yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts Card */}
          <div className="bg-white border border-gray-150 p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <h3 className="text-xs font-bold text-gray-800 tracking-wider uppercase">Low Stock Alerts</h3>
              <Link to="/admin/products?low_stock=true" className="text-[10px] font-bold text-gray-500 hover:text-black transition flex items-center space-x-1">
                <span>Manage Products</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {lowStock.map((prod) => (
                <div key={prod.id} className="flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-800 truncate max-w-[200px]">{prod.name}</p>
                    <p className="text-[10px] text-gray-400">Price: ₹{prod.price}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${
                    prod.stock === 0 
                      ? 'bg-red-50 border-red-100 text-red-600 font-extrabold' 
                      : 'bg-amber-50 border-amber-100 text-amber-700 font-semibold'
                  }`}>
                    {prod.stock === 0 ? 'SOLD OUT' : `${prod.stock} LEFT`}
                  </span>
                </div>
              ))}
              {lowStock.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-xs">All products have healthy inventory counts.</div>
              )}
            </div>
          </div>

        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;
