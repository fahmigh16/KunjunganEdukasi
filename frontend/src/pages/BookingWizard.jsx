import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  BookOpen, 
  Sparkles, 
  Send,
  FileCheck,
  Check,
  Image as ImageIcon
} from 'lucide-react';

const BookingWizard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Step state (1 to 6)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedBooking, setSubmittedBooking] = useState(null);

  // Available package & activities
  const [packages, setPackages] = useState([]);
  const [activities, setActivities] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Pemesan
    visitorName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    whatsapp: user?.phone || '',
    picPosition: 'Guru',

    // Step 2: Sekolah/Instansi
    schoolName: user?.institutionName || '',
    schoolOrigin: '',
    educationLevel: 'SD',
    schoolAddress: '',
    city: '',
    province: 'Lampung',
    teacherName: '',
    teacherPhone: '',

    // Step 3: Kunjungan
    visitDate: '',
    visitTimeSlot: 'Pagi (08:30 - 11:30 WIB)',
    studentCount: 30,
    teacherCount: 2,

    // Step 4: Paket & Aktivitas
    packageId: '',
    alternativePackage1Id: '',
    alternativePackage2Id: '',
    selectedActivities: [],
    notes: '',

    // Step 5: Confirmation
    confirmCorrect: false
  });

  // Fetch initial packages and activities from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, actRes] = await Promise.all([
          axios.get('http://localhost:5000/api/packages'),
          axios.get('http://localhost:5000/api/activities')
        ]);

        const pkgs = pkgRes.data || [];
        setPackages(pkgs);
        setActivities(actRes.data || []);

        if (pkgs.length > 0) {
          setFormData(prev => ({ ...prev, packageId: pkgs[0].id }));
        }
      } catch (err) {
        console.error('Error fetching wizard data:', err);
      }
    };

    fetchData();
  }, []);

  // Update defaults when user object updates
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        visitorName: prev.visitorName || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || '',
        whatsapp: prev.whatsapp || user.phone || '',
        schoolName: prev.schoolName || user.institutionName || ''
      }));
    }
  }, [user]);

  // Today string for min date picker
  const todayStr = new Date().toISOString().slice(0, 10);

  const selectedPackage = packages.find(p => p.id === parseInt(formData.packageId)) || {
    name: 'PAKET KUNJUNGAN',
    price: 35000,
    visitCount: 2
  };

  const studentCountNum = parseInt(formData.studentCount, 10) || 0;
  const teacherCountNum = parseInt(formData.teacherCount, 10) || 0;
  const totalVisitors = studentCountNum + teacherCountNum;
  const totalEstimatedCost = studentCountNum * parseFloat(selectedPackage.price || 35000);

  const handleActivityToggle = (act) => {
    const actName = act.name;
    let current = [...formData.selectedActivities];
    
    // Always allow unselecting
    if (current.includes(actName)) {
      current = current.filter(a => a !== actName);
    } else {
      // Prevent selection if activity is unavailable or inactive
      if (act.isAvailable === false || act.isActive === false) {
        setErrorMsg(`Kegiatan ${act.name} sedang dinonaktifkan oleh pengelola dan tidak dapat dipilih untuk pemesanan baru. Silakan pilih kegiatan lain yang aktif.`);
        return;
      }
      if (current.length >= 2) {
        setErrorMsg('Anda hanya dapat memilih tepat 2 kegiatan. Silakan batalkan salah satu pilihan Anda terlebih dahulu.');
        return;
      }
      setErrorMsg('');
      current.push(actName);
    }
    setFormData({ ...formData, selectedActivities: current });
  };

  // Step Validation
  const validateStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!formData.visitorName || !formData.email || !formData.phone) {
        setErrorMsg('Mohon isi nama lengkap, email, dan nomor telepon pemesan.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.schoolName || !formData.city) {
        setErrorMsg('Mohon isi nama sekolah/instansi dan kota/kabupaten.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.visitDate) {
        setErrorMsg('Mohon pilih tanggal kunjungan.');
        return false;
      }
      if (studentCountNum < 20) {
        setErrorMsg('Jumlah siswa minimal adalah 20 anak.');
        return false;
      }
    } else if (step === 4) {
      if (formData.selectedActivities.length !== 2) {
        setErrorMsg('Anda WAJIB memilih tepat 2 aktivitas kunjungan edukasi.');
        return false;
      }
      if (formData.alternativePackage1Id || formData.alternativePackage2Id) {
        if (formData.alternativePackage1Id === formData.packageId || formData.alternativePackage2Id === formData.packageId) {
          setErrorMsg('Paket alternatif tidak boleh sama dengan paket utama.');
          return false;
        }
        if (formData.alternativePackage1Id && formData.alternativePackage1Id === formData.alternativePackage2Id) {
          setErrorMsg('Paket alternatif 1 dan 2 tidak boleh sama.');
          return false;
        }
      }
    } else if (step === 5) {
      if (!formData.confirmCorrect) {
        setErrorMsg('Anda wajib mencentang persetujuan data booking.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitBooking = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await axios.post('http://localhost:5000/api/bookings', {
        visitorName: formData.visitorName,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        picPosition: formData.picPosition,
        schoolName: formData.schoolName,
        schoolOrigin: formData.schoolOrigin,
        educationLevel: formData.educationLevel,
        schoolAddress: formData.schoolAddress,
        city: formData.city,
        province: formData.province,
        teacherName: formData.teacherName,
        teacherPhone: formData.teacherPhone,
        visitDate: formData.visitDate,
        visitTimeSlot: formData.visitTimeSlot,
        studentCount: studentCountNum,
        teacherCount: teacherCountNum,
        packageId: formData.packageId,
        alternativePackage1Id: formData.alternativePackage1Id || null,
        alternativePackage2Id: formData.alternativePackage2Id || null,
        selectedActivities: formData.selectedActivities,
        notes: formData.notes
      });

      setSubmittedBooking(response.data.booking);
      setStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengirim reservasi booking.';
      setErrorMsg(msg);
      if (msg.toLowerCase().includes('tidak tersedia')) {
        setStep(4);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="booking-wizard-page min-h-screen text-slate-900 pt-32 pb-20 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <video src="/vidio-bg.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/45"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/35"></div>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 max-w-md text-center shadow-2xl text-white">
          <AlertCircle className="w-16 h-16 text-blue-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Login Diperlukan</h2>
          <p className="text-white/75 text-sm mb-6 font-normal">
            Anda harus masuk ke akun terlebih dahulu untuk melakukan reservasi kunjungan edukasi.
          </p>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl shadow-lg transition-all text-sm"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/25 transition-all text-sm"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-wizard-page min-h-screen text-slate-900 pt-28 pb-20 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video src="/vidio-bg.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-slate-950/45"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/35"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Wizard Header Progress Bar */}
        <div className="mb-10">
          <div className="text-center mb-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100 border border-blue-200 px-4 py-1.5 rounded-full">
              RESERVASI RESMI
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">
              Form Booking Kunjungan Edukasi
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Politeknik Negeri Lampung
            </p>
          </div>

          {/* Progress Step Circles (Steps 1 to 5) */}
          {step < 6 && (
            <div className="relative mb-12">
              {/* Progress Line */}
              <div className="absolute top-4 left-[10%] right-[10%] h-1 bg-slate-200 rounded-full z-0 hidden sm:block"></div>
              <div 
                className="absolute top-4 left-[10%] h-1 bg-blue-600 rounded-full z-0 hidden sm:block transition-all duration-700 ease-in-out"
                style={{ width: `${((step - 1) / 4) * 80}%` }}
              ></div>
              
              {/* Animated Vehicle */}
              <motion.div 
                className="absolute top-0 z-10 drop-shadow-md hidden sm:flex items-center justify-center bg-white border-2 border-blue-600 rounded-full w-9 h-9"
                animate={{ left: `calc(10% + ${((step - 1) / 4) * 80}% - 18px)` }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
              >
                <span className="text-xl">🚍</span>
              </motion.div>

              <div className="relative z-10 grid grid-cols-5 gap-2 text-center text-xs pt-1 sm:pt-0">
                {['Pemesan', 'Sekolah', 'Kunjungan', 'Paket', 'Review'].map((label, idx) => {
                  const stepNum = idx + 1;
                  const isDone = step > stepNum;
                  const isCurrent = step === stepNum;
                  return (
                    <div key={label} className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                        isDone ? 'bg-blue-700 text-white font-black' : isCurrent ? 'bg-blue-700 text-white font-extrabold shadow-md shadow-blue-600/30 scale-110' : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}>
                        {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : stepNum}
                      </div>
                      <span className={`text-[10px] sm:text-[11px] ${isCurrent ? 'text-blue-700 font-bold' : isDone ? 'text-blue-900 font-semibold' : 'text-slate-400'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STEP 1: DATA PEMESAN */}
        {/* ----------------------------------------------------------- */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-700" />
              Langkah 1: Data Pemesan (PIC)
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-6 font-normal">
              Informasi kontak penanggung jawab rombongan kunjungan.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Pemesan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.visitorName}
                  onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Akun (Otomatis)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 px-4 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status / Jabatan Pemesan *
                  </label>
                  <select
                    value={formData.picPosition}
                    onChange={(e) => setFormData({ ...formData, picPosition: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Guru">Guru</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Staff Sekolah">Staff / Panitia</option>
                    <option value="Orang Tua">Orang Tua Siswa</option>
                    <option value="Umum">Umum / Komunitas</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor Telepon Seluler *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp (Opsional jika sama)
                  </label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={nextStep}
                className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Data Sekolah</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STEP 2: DATA SEKOLAH / INSTANSI */}
        {/* ----------------------------------------------------------- */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-700" />
              Langkah 2: Data Sekolah / Instansi
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-6 font-normal">
              Identitas asal sekolah atau lembaga peserta kunjungan.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Sekolah / Instansi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SD Negeri 1 Bandar Lampung"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jenjang Pendidikan *
                  </label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                  >
                    <option value="PAUD">PAUD</option>
                    <option value="TK">TK / Raudhatul Athfal</option>
                    <option value="SD">SD / MI</option>
                    <option value="SMP">SMP / MTs</option>
                    <option value="SMA">SMA / MA</option>
                    <option value="SMK">SMK</option>
                    <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                    <option value="Umum">Umum / Komunitas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kota / Kabupaten *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kota Bandar Lampung"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat Sekolah / Instansi
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Pemuda No. 123..."
                  value={formData.schoolAddress}
                  onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Guru Pendamping
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Guru Utama"
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    No Telepon Guru Pendamping
                  </label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={formData.teacherPhone}
                    onChange={(e) => setFormData({ ...formData, teacherPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Data Kunjungan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STEP 3: DATA KUNJUNGAN */}
        {/* ----------------------------------------------------------- */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-700" />
              Langkah 3: Tanggal & Jumlah Peserta Kunjungan
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-6 font-normal">
              Tentukan jadwal dan perkiraan jumlah pengunjung rombongan Anda.
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tanggal Kunjungan (Min. Hari Ini) *
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Waktu / Sesi Kunjungan *
                  </label>
                  <select
                    value={formData.visitTimeSlot}
                    onChange={(e) => setFormData({ ...formData, visitTimeSlot: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Pagi (08:30 - 11:30 WIB)">Pagi (08:30 - 11:30 WIB)</option>
                    <option value="Siang (13:00 - 15:30 WIB)">Siang (13:00 - 15:30 WIB)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jumlah Siswa / Peserta (Min. 20 Anak) *
                  </label>
                  <input
                    type="number"
                    min={20}
                    value={formData.studentCount}
                    onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jumlah Guru / Pendamping
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.teacherCount}
                    onChange={(e) => setFormData({ ...formData, teacherCount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Summary Callout */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-800 block font-bold">Total Seluruh Pengunjung:</span>
                  <span className="text-lg font-black text-blue-900">{totalVisitors} Orang ({studentCountNum} Siswa + {teacherCountNum} Pendamping)</span>
                </div>
                <Users className="w-8 h-8 text-blue-700" />
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Pilih Paket & Aktivitas</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STEP 4: PILIH PAKET & AKTIVITAS */}
        {/* ----------------------------------------------------------- */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
              Langkah 4: Pilih Paket & Aktivitas Edukasi
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-6 font-normal">
              Pilih jenis aktivitas edukasi yang ingin diikuti oleh peserta (bisa pilih 1 atau lebih).
            </p>

            {/* Package Box */}
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-blue-800 tracking-wider">Paket Resmi Poster</span>
                <h3 className="text-xl font-black text-blue-950">PAKET KUNJUNGAN EDUKASI</h3>
                <p className="text-xs text-slate-600">Pengalaman belajar aktivitas pilihan di Politeknik Negeri Lampung.</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-700">Rp 35.000</span>
                <span className="text-xs text-slate-500 block font-normal">/ anak</span>
              </div>
            </div>

            {/* Select Activities Selection Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Aktivitas ({formData.selectedActivities.length} Dipilih):
                </label>
                <span className={`text-xs font-extrabold ${formData.selectedActivities.length === 2 ? 'text-blue-700' : 'text-red-600'}`}>
                  {formData.selectedActivities.length === 2 ? `✓ 2 Aktivitas Dipilih` : 'Pilih tepat 2 aktivitas'}
                </span>
              </div>

              {errorMsg && step === 4 && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-xs font-bold text-red-800">{errorMsg}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {activities.map((act) => {
                  const isSelected = formData.selectedActivities.includes(act.name);
                  const isUnavailable = act.isAvailable === false || act.isActive === false;
                  
                  return (
                    <div
                      key={act.name}
                      onClick={() => handleActivityToggle(act)}
                      className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-300 flex flex-col ${
                        isUnavailable
                          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                          : isSelected
                            ? 'bg-blue-50 border-blue-600 shadow-md cursor-pointer ring-4 ring-blue-100'
                            : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-lg cursor-pointer'
                      }`}
                    >
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className={`text-base font-bold mb-1 ${isUnavailable ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {act.name}
                        </h3>
                        <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                          {act.description || 'Deskripsi kegiatan edukasi.'}
                        </p>

                        <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between">
                          {isUnavailable ? (
                            <span className="text-[10px] font-extrabold px-3 py-1 bg-red-100 text-red-700 rounded-full">NONAKTIF</span>
                          ) : (
                            <span className="text-[10px] font-extrabold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">AKTIF</span>
                          )}

                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isSelected ? 'bg-blue-700 border-blue-700 text-white' : 'border-slate-300 text-slate-400'}`}>
                            {isSelected ? <Check className="w-5 h-5 stroke-[3]" /> : <div className="w-3 h-3 rounded-full bg-slate-200"></div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preferensi Alternatif Aktivitas */}
            <div className="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-200">
              <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                CATATAN / PREFERENSI ALTERNATIF AKTIVITAS
              </h3>
              <p className="text-xs text-amber-800 mb-4">
                Jika aktivitas utama yang dipilih tidak tersedia pada tanggal kunjungan, silakan pilih 2 aktivitas alternatif yang dapat digunakan sebagai pengganti oleh admin.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5">
                    Alternatif Aktivitas 1 (Opsional)
                  </label>
                  <select
                    value={formData.alternativePackage1Id}
                    onChange={(e) => setFormData({ ...formData, alternativePackage1Id: e.target.value })}
                    className="w-full bg-white border border-amber-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Alternatif 1 --</option>
                    {activities.filter(a => !formData.selectedActivities.includes(a.name)).map(a => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5">
                    Alternatif Aktivitas 2 (Opsional)
                  </label>
                  <select
                    value={formData.alternativePackage2Id}
                    onChange={(e) => setFormData({ ...formData, alternativePackage2Id: e.target.value })}
                    className="w-full bg-white border border-amber-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Alternatif 2 --</option>
                    {activities.filter(a => !formData.selectedActivities.includes(a.name)).map(a => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Special Notes Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan / Kebutuhan Khusus
              </label>
              <textarea
                rows={2}
                placeholder="Sampaikan kebutuhan khusus terkait kunjungan Anda..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
              ></textarea>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Review Pesanan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STEP 5: REVIEW SEBELUM SUBMIT */}
        {/* ----------------------------------------------------------- */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-700" />
              Langkah 5: Periksa Kembali Permintaan Booking
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-6 font-normal">
              Pastikan seluruh data yang Anda masukkan sudah sesuai sebelum dikirim ke admin.
            </p>

            <div className="space-y-6 text-xs sm:text-sm">
              
              {/* Summary Cards */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="font-extrabold text-blue-800 uppercase tracking-wider text-[11px] mb-2">DATA PEMESAN</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <p><strong className="text-slate-900">Nama:</strong> {formData.visitorName}</p>
                  <p><strong className="text-slate-900">Jabatan:</strong> {formData.picPosition}</p>
                  <p><strong className="text-slate-900">Email:</strong> {formData.email}</p>
                  <p><strong className="text-slate-900">Telepon/WA:</strong> {formData.phone}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="font-extrabold text-blue-800 uppercase tracking-wider text-[11px] mb-2">DATA SEKOLAH / INSTANSI</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <p><strong className="text-slate-900">Sekolah:</strong> {formData.schoolName}</p>
                  <p><strong className="text-slate-900">Jenjang:</strong> {formData.educationLevel}</p>
                  <p><strong className="text-slate-900">Kota:</strong> {formData.city}</p>
                  <p><strong className="text-slate-900">Guru Utama:</strong> {formData.teacherName || '-'}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="font-extrabold text-blue-800 uppercase tracking-wider text-[11px] mb-2">DATA KUNJUNGAN & AKTIVITAS</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700 mb-3">
                  <p><strong className="text-slate-900">Tanggal:</strong> {formData.visitDate}</p>
                  <p><strong className="text-slate-900">Sesi Waktu:</strong> {formData.visitTimeSlot}</p>
                  <p><strong className="text-slate-900">Siswa:</strong> {studentCountNum} Anak</p>
                  <p><strong className="text-slate-900">Pendamping:</strong> {teacherCountNum} Orang</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] mb-1">Aktivitas Terpilih:</span>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedActivities.map(a => (
                      <span key={a} className="px-3 py-1 bg-blue-100 border border-blue-200 text-blue-900 rounded-full font-bold text-xs">
                        ✓ {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ESTIMATION BOX */}
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-blue-800 tracking-wider">ESTIMASI TOTAL BIAYA</span>
                    <p className="text-xs text-slate-600">{studentCountNum} Siswa × Rp 35.000 / anak</p>
                  </div>
                  <span className="text-3xl font-black text-blue-700">
                    Rp {totalEstimatedCost.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 text-blue-900 text-[11px] font-bold">
                  ⚠️ Estimasi biaya — menunggu persetujuan admin. (Pembayaran baru dilakukan setelah booking APPROVED).
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="confirmCorrect"
                  checked={formData.confirmCorrect}
                  onChange={(e) => setFormData({ ...formData, confirmCorrect: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-600 cursor-pointer"
                />
                <label htmlFor="confirmCorrect" className="text-xs text-slate-700 cursor-pointer leading-relaxed">
                  Saya memastikan data booking yang saya masukkan sudah benar dan siap dikirimkan untuk peninjauan admin.
                </label>
              </div>

            </div>

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" /> UBAH PESANAN
              </button>
              <button
                onClick={handleSubmitBooking}
                disabled={loading || !formData.confirmCorrect}
                className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>LANJUT PEMBAYARAN</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STEP 6: BOOKING SUBMITTED SUCCESS PAGE */}
        {/* ----------------------------------------------------------- */}
        {step === 6 && submittedBooking && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-blue-600 shadow-2xl text-center">
            
            <div className="w-20 h-20 rounded-full bg-blue-700 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/30">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-900 bg-blue-100 px-4 py-1.5 rounded-full border border-blue-200">
              STATUS: MENUNGGU PERSETUJUAN (PENDING REVIEW)
            </span>

            <h2 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">
              Booking Anda Berhasil Dikirim!
            </h2>
            
            <p className="text-slate-600 text-sm max-w-md mx-auto font-normal leading-relaxed mb-6">
              Permintaan Anda sedang diperiksa oleh admin Polinela. <strong className="text-blue-700">Pembayaran baru dapat dilakukan setelah booking disetujui.</strong>
            </p>

            {/* Booking Code Display */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto mb-8">
              <span className="text-xs uppercase font-bold text-slate-500 block mb-1">KODE BOOKING UNIK ANDA:</span>
              <span className="text-3xl font-mono font-black text-blue-700 tracking-wider">
                {submittedBooking.bookingCode}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate(`/payment/${submittedBooking.id}`)}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-blue-600/20 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Pembayaran</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
};

export default BookingWizard;
