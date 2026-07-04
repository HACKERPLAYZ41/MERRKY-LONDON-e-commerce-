import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, Mail } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/account');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 border border-gray-100 bg-white p-8 rounded-xl shadow-sm">
        
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">Welcome Back</span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-wide">SIGN IN</h2>
          <p className="text-xs text-gray-500 font-light">
            Sign in to check out quickly and trace your orders.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-2.5 rounded text-center font-medium">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={16} /></span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full rounded-md border border-gray-200 py-2.5 pr-4 pl-10 text-xs outline-none focus:border-black transition"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Password</label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={16} /></span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-gray-200 py-2.5 pr-4 pl-10 text-xs outline-none focus:border-black transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs font-bold py-3.5 uppercase tracking-widest hover:bg-neutral-900 transition duration-300 rounded shadow-md"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs space-y-2 pt-2">
          <p className="text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-black hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="text-gray-400 text-[10px]">
            Are you an administrator?{' '}
            <Link to="/admin/login" className="font-semibold text-gray-600 hover:underline">
              Admin Portal
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
