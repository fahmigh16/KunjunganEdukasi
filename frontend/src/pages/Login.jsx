import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const performLogin = async (targetEmail, targetPassword) => {
    setErrorMsg('');
    setLoading(true);
    const result = await login(targetEmail, targetPassword);
    setLoading(false);

    if (result.success) {
      if (from) {
        navigate(from, { replace: true });
      } else if (result.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (result.user?.role === 'pimpinan') {
        navigate('/pimpinan', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Mohon isi email dan kata sandi Anda.');
      return;
    }
    performLogin(email, password);
  };

  return (
    <div className="h-screen max-h-screen w-full relative flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Video Background (Jelas, Terang, HD Tanpa Blur Buram) */}
      <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden pointer-events-none">
        <video
          src="/vidio-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle Transparent Tint - Video tetap tajam dan terlihat jelas */}
        <div className="absolute inset-0 bg-slate-950/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40"></div>
      </div>

      {/* Tombol Kembali - Ikon Saja */}
      <div className="absolute top-5 left-5 z-20">
        <Link 
          to="/" 
          title="Kembali ke Beranda"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md transition-all shadow-lg hover:scale-110"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md my-auto">
        
        {/* Header Branding with Official UPB & BLU Logos */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-4"
        >
          <Link to="/" className="inline-flex items-center justify-center gap-2.5 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 mb-3 hover:bg-white/25 transition-all shadow-lg">
            <img 
              src="/logo-upb.png" 
              alt="Logo UPB Polinela" 
              className="h-8 w-auto object-contain drop-shadow"
            />
            <div className="h-6 w-px bg-white/40"></div>
            <img 
              src="/logo-blu-speed.png" 
              alt="Logo BLU Speed" 
              className="h-8 w-auto object-contain drop-shadow"
            />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-lg">
            Masuk ke Akun
          </h1>
          <p className="text-white/70 text-xs font-medium mt-0.5">
            Sistem Informasi Kunjungan Edukasi POLINELA
          </p>
        </motion.div>

        {/* Glass Card Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white/10 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-white/20 shadow-2xl"
        >
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-100 text-xs flex items-start gap-2 backdrop-blur-sm"
            >
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/25 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-400/80 focus:bg-white/20 focus:ring-2 focus:ring-blue-400/20 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/25 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-400/80 focus:bg-white/20 focus:ring-2 focus:ring-blue-400/20 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-blue-700/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Akun</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-3.5 text-center text-xs text-white/60">
            Belum memiliki akun?{' '}
            <Link to="/register" className="font-extrabold text-cyan-300 hover:text-cyan-200 hover:underline">
              Daftar Sekarang
            </Link>
          </div>

          {/* Akses Cepat Pilihan Hak Akses */}
          <div className="mt-4 pt-3.5 border-t border-white/15">
            <p className="text-[10px] font-bold text-center text-white/40 uppercase tracking-wider mb-2.5">
              Akun Uji Coba:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => performLogin('user@gmail.com', 'user123')}
                className="py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg text-[11px] font-bold border border-white/20 transition text-center cursor-pointer"
              >
                Pengunjung
              </button>
              <button
                type="button"
                onClick={() => performLogin('admin@polinela.ac.id', 'admin123')}
                className="py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg text-[11px] font-bold border border-white/20 transition text-center cursor-pointer"
              >
                Admin UPB
              </button>
              <button
                type="button"
                onClick={() => performLogin('pimpinan@polinela.ac.id', 'pimpinan123')}
                className="py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg text-[11px] font-bold border border-white/20 transition text-center cursor-pointer"
              >
                Pimpinan
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;
