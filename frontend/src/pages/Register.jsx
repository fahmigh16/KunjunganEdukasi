import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, UserPlus, AlertCircle, Building2, ArrowLeft } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !phone || !password || !confirmPassword) {
      setErrorMsg('Mohon lengkapi seluruh field pendaftaran.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal terdiri dari 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Anda harus menyetujui syarat & ketentuan layanan.');
      return;
    }

    setLoading(true);
    const result = await register({
      name,
      email,
      phone,
      institutionName,
      password
    });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full relative flex flex-col items-center justify-center px-4 overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Video Background */}
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
        <div className="absolute inset-0 bg-slate-950/35"></div>
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

      <div className="relative z-10 w-full max-w-md my-auto">
        
        {/* Header Branding - Kompak */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-3"
        >
          <Link to="/" className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 mb-2 hover:bg-white/25 transition-all shadow-lg">
            <img src="/logo-upb.png" alt="Logo UPB Polinela" className="h-7 w-auto object-contain drop-shadow" />
            <div className="h-5 w-px bg-white/40"></div>
            <img src="/logo-blu-speed.png" alt="Logo BLU Speed" className="h-7 w-auto object-contain drop-shadow" />
          </Link>
          <h1 className="text-lg font-black tracking-tight text-white drop-shadow-lg">Buat Akun Baru</h1>
          <p className="text-white/60 text-[11px] font-medium mt-0.5">Daftar Pemesanan Kunjungan Edukasi POLINELA</p>
        </motion.div>

        {/* Glass Card Form - Kompak 1 Layar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl"
        >
          {errorMsg && (
            <div className="mb-2.5 p-2 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-100 text-xs flex items-start gap-2 backdrop-blur-sm">
              <AlertCircle className="w-3.5 h-3.5 text-rose-300 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Nama */}
            <div>
              <label className="block text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Nama Lengkap PIC</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" />
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Penanggung Jawab"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/10 border border-white/25 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400/80 focus:bg-white/20 transition-all"
                />
              </div>
            </div>

            {/* Email & Telepon */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/25 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400/80 focus:bg-white/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">No. WA / HP</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" />
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/10 border border-white/25 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400/80 focus:bg-white/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Instansi */}
            <div>
              <label className="block text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Sekolah / Instansi</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" />
                <input
                  type="text"
                  placeholder="Contoh: SD Negeri 1 Bandar Lampung"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full bg-white/10 border border-white/25 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400/80 focus:bg-white/20 transition-all"
                />
              </div>
            </div>

            {/* Kata Sandi & Konfirmasi */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" />
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/25 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400/80 focus:bg-white/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1">Konfirmasi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" />
                  <input
                    type="password"
                    required
                    placeholder="Ulangi sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/25 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400/80 focus:bg-white/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox Syarat */}
            <div className="flex items-start gap-2 pt-0.5">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-3 h-3 rounded text-blue-500 bg-white/10 border-white/30 focus:ring-blue-500 cursor-pointer shrink-0"
              />
              <label htmlFor="terms" className="text-[10px] text-white/60 cursor-pointer leading-tight">
                Saya menyetujui <span className="text-cyan-300 font-bold">Syarat &amp; Ketentuan</span> layanan Kunjungan Edukasi POLINELA.
              </label>
            </div>

            {/* Tombol Daftar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-blue-700/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun Baru</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-3 text-center text-[11px] text-white/50">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-extrabold text-cyan-300 hover:text-cyan-200 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Register;
