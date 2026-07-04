import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, ShoppingBag, FolderTree, ClipboardList, LogOut, ArrowLeft, MessageSquare } from 'lucide-react';

const AdminSidebar = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-zinc-950 text-gray-400 flex flex-col border-r border-zinc-900 z-30">
      
      {/* Header logo */}
      <div className="p-6 border-b border-zinc-900 flex flex-col space-y-1">
        <span className="text-sm font-bold tracking-[0.2em] text-white">MERRKY ADMIN</span>
        <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest truncate">{user?.email}</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 text-xs font-semibold uppercase tracking-wider">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-3 rounded-md px-4.5 py-3.5 transition-colors ${
              isActive ? 'bg-zinc-850 text-white' : 'hover:bg-zinc-900 hover:text-white'
            }`
          }
        >
          <LayoutDashboard size={14} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `flex items-center space-x-3 rounded-md px-4.5 py-3.5 transition-colors ${
              isActive ? 'bg-zinc-850 text-white' : 'hover:bg-zinc-900 hover:text-white'
            }`
          }
        >
          <ShoppingBag size={14} />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            `flex items-center space-x-3 rounded-md px-4.5 py-3.5 transition-colors ${
              isActive ? 'bg-zinc-850 text-white' : 'hover:bg-zinc-900 hover:text-white'
            }`
          }
        >
          <FolderTree size={14} />
          <span>Categories</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `flex items-center space-x-3 rounded-md px-4.5 py-3.5 transition-colors ${
              isActive ? 'bg-zinc-850 text-white' : 'hover:bg-zinc-900 hover:text-white'
            }`
          }
        >
          <ClipboardList size={14} />
          <span>Orders</span>
        </NavLink>

        <NavLink
          to="/admin/tickets"
          className={({ isActive }) =>
            `flex items-center space-x-3 rounded-md px-4.5 py-3.5 transition-colors ${
              isActive ? 'bg-zinc-850 text-white' : 'hover:bg-zinc-900 hover:text-white'
            }`
          }
        >
          <MessageSquare size={14} className="flex-shrink-0" />
          <span>Support Tickets</span>
        </NavLink>
      </nav>

      {/* Footer / Exit actions */}
      <div className="p-4 border-t border-zinc-900 space-y-1.5 text-xs">
        <button
          onClick={() => navigate('/')}
          className="flex w-full items-center space-x-3 rounded-md px-4.5 py-3 hover:bg-zinc-900 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>View Store</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 rounded-md px-4.5 py-3 text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
};

export default AdminSidebar;
