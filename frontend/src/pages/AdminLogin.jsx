import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const { adminLogin, adminVerify2fa } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSentTo, setOtpSentTo] = useState('');
  const [devOtp, setDevOtp] = useState(null); // Only populated in local dev mode

  // Step 1 — send credentials
  const handleCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await adminLogin(email, password);
    setLoading(false);

    if (result.success && result.requires2fa) {
      setOtpSentTo(email);
      if (result.devOtp) setDevOtp(result.devOtp); // show OTP on screen in dev mode
      setStep(2);
    } else if (!result.success) {
      setError(result.error);
    }
  };

  // Step 2 — verify 6-digit OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await adminVerify2fa(email, otp);
    setLoading(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-150">

        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <ShieldCheck size={28} />
          </div>
          <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">
            {step === 1 ? 'Control Panel' : '2-Factor Authentication'}
          </span>
          <h2 className="text-xl font-black text-gray-900 tracking-wide">MERRKY LONDON ADMIN</h2>
          <p className="text-xs text-gray-500 font-light">
            {step === 1
              ? 'Authorized administrative credential authentication.'
              : `Enter the 6-digit code sent to ${otpSentTo}`}
          </p>
        </div>

        {/* ── Dev-mode OTP banner ── */}
        {devOtp && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-3 text-center space-y-1">
            <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">🔧 Dev Mode — OTP Code</p>
            <p className="text-2xl font-black text-amber-800 tracking-[0.3em]">{devOtp}</p>
            <p className="text-[9px] text-amber-600">This appears only in local development. Not shown in production.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-2.5 rounded text-center font-medium">
            {error}
          </div>
        )}

        {/* ── Step 1: Email + Password ── */}
        {step === 1 && (
          <form className="space-y-5" onSubmit={handleCredentials}>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Admin Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={14} /></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@merrky.com"
                  className="w-full rounded-md border border-gray-200 py-2.5 pr-4 pl-10 text-xs outline-none focus:border-amber-500 transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Security Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={14} /></span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-gray-200 py-2.5 pr-4 pl-10 text-xs outline-none focus:border-amber-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-zinc-950 text-white text-xs font-bold py-3.5 uppercase tracking-widest hover:bg-neutral-900 transition rounded shadow-md disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : <>Send Verification Code <ArrowRight size={14} /></>}
            </button>
          </form>
        )}

        {/* ── Step 2: 6-digit OTP ── */}
        {step === 2 && (
          <form className="space-y-5" onSubmit={handleVerify}>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">6-Digit OTP Code</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><KeyRound size={14} /></span>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full rounded-md border border-gray-200 py-2.5 pr-4 pl-10 text-xs outline-none focus:border-amber-500 transition tracking-widest text-center text-base font-bold"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-400 text-center pt-1">
                The OTP is valid for 5 minutes. Check your email inbox.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-zinc-950 text-white text-xs font-bold py-3.5 uppercase tracking-widest hover:bg-neutral-900 transition rounded shadow-md disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setOtp(''); setError(''); }}
              className="w-full text-xs text-gray-500 hover:text-black transition underline text-center"
            >
              ← Back to credentials
            </button>
          </form>
        )}

        <div className="text-center text-[10px] text-gray-400 pt-2 border-t border-gray-50">
          <Link to="/" className="font-semibold text-gray-600 hover:underline">
            ← Return to Main Storefront
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
