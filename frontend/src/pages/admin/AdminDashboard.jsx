import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar as CalendarIcon, 
  CreditCard, 
  Users, 
  Settings, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Search, 
  Filter, 
  X, 
  ThumbsUp, 
  ThumbsDown, 
  Edit3, 
  LogOut, 
  Package, 
  Building,
  RefreshCw,
  Plus,
  Globe,
  ArrowLeftRight
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, switchAccount } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, bookings, calendar, payments, packages, users, settings

  const handleSwitchToUser = async () => {
    const res = await switchAccount('user');
    if (res?.success) {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [bookings, setBookings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [packages, setPackages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [paymentSetting, setPaymentSetting] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Selected State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Action Modals State
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionModal, setRevisionModal] = useState(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [rejectPaymentModal, setRejectPaymentModal] = useState(null);
  const [paymentRejectionReason, setPaymentRejectionReason] = useState('');
  const [paymentActionNotice, setPaymentActionNotice] = useState(null);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  // Settings Form
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    instructions: ''
  });

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [bRes, uRes, pRes, aRes, sRes] = await Promise.all([
        axios.get('http://localhost:5000/api/bookings/admin/all'),
        axios.get('http://localhost:5000/api/auth/users'),
        axios.get('http://localhost:5000/api/packages'),
        axios.get('http://localhost:5000/api/activities'),
        axios.get('http://localhost:5000/api/payments/settings')
      ]);

      setBookings(bRes.data || []);
      setUsersList(uRes.data || []);
      setPackages(pRes.data || []);
      setActivities(aRes.data || []);
      setPaymentSetting(sRes.data);
      if (sRes.data && !silent) {
        setBankForm({
          bankName: sRes.data.bankName || '',
          accountName: sRes.data.accountName || '',
          accountNumber: sRes.data.accountNumber || '',
          instructions: sRes.data.instructions || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Stats calculation
  const totalBookings = bookings.length;
  const waitingPaymentCount = bookings.filter(b => b.status === 'APPROVED').length;
  const waitingVerificationCount = bookings.filter(b => b.status === 'PAYMENT_SUBMITTED' || b.status === 'PENDING_REVIEW').length;
  const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const totalAnak = bookings.reduce((sum, b) => sum + (b.studentCount || 0), 0);
  const totalGuru = bookings.reduce((sum, b) => sum + (b.teacherCount || 0), 0);
  const aktivitasTersedia = activities.filter(a => a.isAvailable !== false).length;
  const aktivitasTidakTersedia = activities.filter(a => a.isAvailable === false).length;
  const pendingCount = bookings.filter(b => b.status === 'PENDING_REVIEW').length;
  const paymentSubmittedCount = bookings.filter(b => b.status === 'PAYMENT_SUBMITTED').length;

  // Filtered Bookings list
  const schoolsList = Object.values(bookings.reduce((acc, b) => {
    if (!acc[b.schoolName]) {
      acc[b.schoolName] = {
        schoolName: b.schoolName,
        visitorName: b.visitorName,
        phone: b.phone,
        city: b.city,
        province: b.province,
        totalBookings: 0,
        totalAnak: 0,
        totalGuru: 0,
        waitingPayment: 0,
        waitingVerification: 0,
        approved: 0,
        rejected: 0,
        bookings: []
      };
    }
    const s = acc[b.schoolName];
    s.totalBookings += 1;
    s.totalAnak += (b.studentCount || 0);
    s.totalGuru += (b.teacherCount || 0);
    if (b.status === 'APPROVED') s.waitingPayment += 1;
    if (b.status === 'PAYMENT_SUBMITTED') s.waitingVerification += 1;
    if (b.status === 'CONFIRMED') s.approved += 1;
    if (b.status === 'REJECTED') s.rejected += 1;
    s.bookings.push(b);
    return acc;
  }, {}));

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesQuery = 
      b.bookingCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.schoolName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.visitorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  // Action: Approve Booking
  const handleApprove = async () => {
    if (!approveModal) return;
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${approveModal.id}/status`, {
        status: 'APPROVED',
        adminNotes: 'Booking disetujui admin. Silakan lakukan pembayaran.'
      });
      setApproveModal(null);
      fetchData();
    } catch (err) {
      alert('Gagal menyetujui booking.');
    }
  };

  // Action: Reject Booking with Mandatory Reason
  const handleReject = async () => {
    if (!rejectModal || !rejectionReason.trim()) {
      alert('Alasan penolakan wajib diisi!');
      return;
    }
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${rejectModal.id}/status`, {
        status: 'REJECTED',
        rejectionReason
      });
      setRejectModal(null);
      setRejectionReason('');
      fetchData();
    } catch (err) {
      alert('Gagal menolak booking.');
    }
  };

  // Action: Request Revision with Mandatory Note
  const handleRequestRevision = async () => {
    if (!revisionModal || !revisionNote.trim()) {
      alert('Catatan perbaikan wajib diisi!');
      return;
    }
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${revisionModal.id}/status`, {
        status: 'REVISION_REQUESTED',
        revisionNote
      });
      setRevisionModal(null);
      setRevisionNote('');
      fetchData();
    } catch (err) {
      alert('Gagal meminta perbaikan booking.');
    }
  };

  // Action: Verify Payment
  const handleVerifyPayment = async (bookingId) => {
    setProcessingPaymentId(bookingId);
    setPaymentActionNotice(null);
    try {
      const res = await axios.post(`http://localhost:5000/api/payments/${bookingId}/verify`);
      setBookings((currentBookings) => currentBookings.map((booking) => (
        booking.id === bookingId
          ? {
              ...booking,
              status: res.data.booking?.status || 'CONFIRMED',
              payment: { ...booking.payment, ...res.data.payment, status: 'VERIFIED' }
            }
          : booking
      )));
      setPaymentActionNotice({
        type: 'success',
        message: res.data.message || `Pembayaran ${bookings.find((booking) => booking.id === bookingId)?.bookingCode || ''} berhasil diverifikasi dan ditandai lunas.`
      });
      await fetchData(true);
    } catch (err) {
      setPaymentActionNotice({
        type: 'error',
        message: err.response?.data?.message || 'Gagal memverifikasi pembayaran. Silakan coba lagi.'
      });
    } finally {
      setProcessingPaymentId(null);
    }
  };

  // Action: Reject Payment Proof
  const handleRejectPayment = async () => {
    if (!rejectPaymentModal || !paymentRejectionReason.trim()) {
      alert('Alasan penolakan bukti pembayaran wajib diisi!');
      return;
    }
    const bookingId = rejectPaymentModal.id;
    setProcessingPaymentId(bookingId);
    setPaymentActionNotice(null);
    try {
      const res = await axios.post(`http://localhost:5000/api/payments/${bookingId}/reject`, {
        rejectionReason: paymentRejectionReason
      });
      setBookings((currentBookings) => currentBookings.map((booking) => (
        booking.id === bookingId
          ? {
              ...booking,
              status: res.data.booking?.status || 'APPROVED',
              payment: { ...booking.payment, ...res.data.payment, status: 'REJECTED', rejectionReason: paymentRejectionReason.trim() }
            }
          : booking
      )));
      setRejectPaymentModal(null);
      setPaymentRejectionReason('');
      setPaymentActionNotice({
        type: 'success',
        message: res.data.message || `Bukti pembayaran ${rejectPaymentModal.bookingCode} ditolak. Alasan penolakan ditampilkan pada kartu pembayaran.`
      });
      await fetchData(true);
    } catch (err) {
      setPaymentActionNotice({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menolak bukti pembayaran. Silakan coba lagi.'
      });
    } finally {
      setProcessingPaymentId(null);
    }
  };

  // Action: Save Payment Settings
  const handleSaveBankSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/payments/settings', bankForm);
      alert('Pengaturan rekening pembayaran berhasil diperbarui.');
      fetchData();
    } catch (err) {
      alert('Gagal memperbarui pengaturan pembayaran.');
    }
  };

  // Action: Toggle User Active Status
  const handleToggleUser = async (userId) => {
    try {
      await axios.patch(`http://localhost:5000/api/auth/users/${userId}/status`);
      fetchData();
    } catch (err) {
      alert('Gagal mengubah status pengguna.');
    }
  };

  // Action: Toggle Activity Availability
  const handleToggleActivity = async (activityId) => {
    try {
      await axios.patch(`http://localhost:5000/api/activities/${activityId}/toggle`);
      fetchData();
    } catch (err) {
      alert('Gagal mengubah ketersediaan aktivitas.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col lg:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0 text-white">
        <div>
          {/* Admin Header Branding */}
          <Link to="/" className="flex items-center gap-3 mb-8 group">
            <div className="flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/95 px-2 py-1.5 shadow-sm">
              <img src="/logo-upb.png" alt="Logo UPB Polinela" className="h-8 w-auto object-contain" />
              <div className="h-6 w-px bg-slate-300" />
              <img src="/logo-blu-speed.png" alt="Logo BLU Speed" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <h2 className="font-black text-sm text-white leading-tight">Admin Polinela</h2>
              <p className="text-[10px] text-blue-300 font-extrabold uppercase tracking-wider">Dashboard Control</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'overview' ? 'bg-blue-700 text-white shadow-md font-extrabold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ringkasan Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('schools')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'schools' ? 'bg-blue-700 text-white shadow-md font-extrabold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Rekap Sekolah</span>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'bookings' ? 'bg-blue-700 text-white shadow-md font-extrabold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span>Manajemen Booking</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-extrabold animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'payments' ? 'bg-blue-700 text-white shadow-md font-extrabold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4" />
                <span>Verifikasi Pembayaran</span>
              </div>
              {paymentSubmittedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-600 text-white font-extrabold">
                  {paymentSubmittedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'calendar' ? 'bg-blue-700 text-white shadow-md font-extrabold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Jadwal & Kalender</span>
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'packages' ? 'bg-blue-700 text-white shadow-md font-extrabold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Paket & Aktivitas</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'users' ? 'bg-blue-700 text-white shadow-md font-extrabold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Pengguna Terdaftar</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'settings' ? 'bg-blue-700 text-white shadow-md font-extrabold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan Pembayaran</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="pt-6 border-t border-slate-800 mt-6">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700"
            >
              <Globe className="w-4 h-4 text-blue-400" /> Lihat Web Utama
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {activeTab === 'overview' && 'Ringkasan Dashboard'}
              {activeTab === 'bookings' && 'Manajemen Booking Kunjungan'}
              {activeTab === 'schools' && 'Rekap Booking Per Sekolah'}
              {activeTab === 'payments' && 'Verifikasi Pembayaran'}
              {activeTab === 'calendar' && 'Kalender & Ketersediaan Slot'}
              {activeTab === 'packages' && 'Kelola Paket & Aktivitas'}
              {activeTab === 'users' && 'Kelola Pengguna Terdaftar'}
              {activeTab === 'settings' && 'Pengaturan Rekening Pembayaran'}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm font-normal mt-0.5">
              Unit Pengelola Bisnis Politeknik Negeri Lampung
            </p>
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* TAB 1: OVERVIEW STATS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-md">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">TOTAL PESANAN</span>
                <span className="text-2xl font-black text-slate-900">{totalBookings}</span>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-md">
                <span className="text-[10px] uppercase tracking-wider text-amber-800 font-bold block mb-1">MENUNGGU PEMBAYARAN</span>
                <span className="text-2xl font-black text-amber-700">{waitingPaymentCount}</span>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-purple-200 shadow-md">
                <span className="text-[10px] uppercase tracking-wider text-purple-800 font-bold block mb-1">MENUNGGU VERIFIKASI</span>
                <span className="text-2xl font-black text-purple-700">{waitingVerificationCount}</span>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-emerald-200 shadow-md">
                <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold block mb-1">PESANAN DIKONFIRMASI</span>
                <span className="text-2xl font-black text-emerald-700">{confirmedCount}</span>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-blue-200 shadow-md">
                <span className="text-[10px] uppercase tracking-wider text-blue-800 font-bold block mb-1">TOTAL ANAK</span>
                <span className="text-2xl font-black text-blue-700">{totalAnak}</span>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-indigo-200 shadow-md">
                <span className="text-[10px] uppercase tracking-wider text-indigo-800 font-bold block mb-1">TOTAL GURU PENDAMPING</span>
                <span className="text-2xl font-black text-indigo-700">{totalGuru}</span>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-teal-200 shadow-md">
                <span className="text-[10px] uppercase tracking-wider text-teal-800 font-bold block mb-1">AKTIVITAS TERSEDIA</span>
                <span className="text-2xl font-black text-teal-700">{aktivitasTersedia}</span>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-rose-200 shadow-md">
                <span className="text-[10px] uppercase tracking-wider text-rose-800 font-bold block mb-1">AKTIVITAS TIDAK TERSEDIA</span>
                <span className="text-2xl font-black text-rose-700">{aktivitasTidakTersedia}</span>
              </div>
            </div>

            {/* Quick Pending Review Table */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Booking Menunggu Persetujuan ({pendingCount})</span>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs text-blue-700 hover:underline font-extrabold"
                >
                  Lihat Semua →
                </button>
              </h3>

              {pendingCount === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8 font-normal">Tidak ada booking yang menunggu persetujuan saat ini.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3">Kode Booking</th>
                        <th className="p-3">Pemesan & Sekolah</th>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Peserta</th>
                        <th className="p-3">Estimasi</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {bookings.filter(b => b.status === 'PENDING_REVIEW').slice(0, 5).map(b => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-black text-blue-700">{b.bookingCode}</td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{b.schoolName}</p>
                            <p className="text-[10px] text-slate-500">{b.visitorName}</p>
                          </td>
                          <td className="p-3 font-medium">{b.visitDate}</td>
                          <td className="p-3 font-medium">{b.studentCount} Siswa</td>
                          <td className="p-3 font-extrabold text-blue-700">Rp {Number(b.totalEstimatedCost).toLocaleString('id-ID')}</td>
                          <td className="p-3">
                            <button
                              onClick={() => { setSelectedBooking(b); setActiveTab('bookings'); }}
                              className="px-3 py-1 bg-blue-700 text-white font-extrabold rounded-lg hover:bg-blue-800 transition-all cursor-pointer shadow-sm"
                            >
                              Periksa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: MANAJEMEN BOOKING */}
        {(activeTab === 'bookings' || activeTab === 'overview') && (
          <div className="space-y-6">
            
            {/* Filter Pills */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-md">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {['ALL', 'PENDING_REVIEW', 'APPROVED', 'PAYMENT_SUBMITTED', 'CONFIRMED', 'REJECTED', 'REVISION_REQUESTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === st
                        ? 'bg-blue-700 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'ALL' && 'Semua'}
                    {st === 'PENDING_REVIEW' && 'Menunggu Review'}
                    {st === 'APPROVED' && 'Disetujui'}
                    {st === 'PAYMENT_SUBMITTED' && 'Bukti Masuk'}
                    {st === 'CONFIRMED' && 'Dikonfirmasi'}
                    {st === 'REJECTED' && 'Ditolak'}
                    {st === 'REVISION_REQUESTED' && 'Revisi'}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode/sekolah/nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Bookings Data Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Kode Booking</th>
                      <th className="p-4">Pemesan & Sekolah</th>
                      <th className="p-4">Tanggal & Sesi</th>
                      <th className="p-4">Jumlah Peserta</th>
                      <th className="p-4">Total Biaya</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-normal">
                          Tidak ada data booking yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono font-black text-blue-700">{b.bookingCode}</td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900 text-sm">{b.schoolName}</p>
                            <p className="text-[11px] text-slate-500">{b.visitorName} ({b.phone})</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{b.visitDate}</p>
                            <p className="text-[10px] text-slate-500">{b.visitTimeSlot}</p>
                          </td>
                          <td className="p-4 font-medium">{b.studentCount} Siswa ({b.teacherCount || 0} Guru)</td>
                          <td className="p-4 font-extrabold text-blue-700">Rp {Number(b.totalEstimatedCost).toLocaleString('id-ID')}</td>
                          <td className="p-4 font-extrabold">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] ${
                              b.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                              b.status === 'APPROVED' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                              b.status === 'PAYMENT_SUBMITTED' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                              b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                              'bg-rose-100 text-rose-900'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer border border-slate-300 shadow-sm"
                            >
                              Detail
                            </button>

                            {/* APPROVE ACTION BUTTON */}
                            {b.status === 'PENDING_REVIEW' && (
                              <>
                                <button
                                  onClick={() => setApproveModal(b)}
                                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-lg shadow transition-all cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setRevisionModal(b)}
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-lg shadow transition-all cursor-pointer"
                                >
                                  Revisi
                                </button>
                                <button
                                  onClick={() => setRejectModal(b)}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg shadow transition-all cursor-pointer"
                                >
                                  Tolak
                                </button>
                              </>
                            )}

                            {/* VERIFY PAYMENT BUTTON */}
                            {b.status === 'PAYMENT_SUBMITTED' && (
                              <>
                                <button
                                  onClick={() => handleVerifyPayment(b.id)}
                                  disabled={processingPaymentId === b.id}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60 text-white font-extrabold rounded-lg shadow transition-all cursor-pointer"
                                >
                                  {processingPaymentId === b.id ? 'Memproses...' : 'Verifikasi Bayar'}
                                </button>
                                <button
                                  onClick={() => setRejectPaymentModal(b)}
                                  disabled={processingPaymentId === b.id}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60 text-white font-extrabold rounded-lg shadow transition-all cursor-pointer"
                                >
                                  Tolak Bukti
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: VERIFIKASI PEMBAYARAN */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Daftar Bukti Pembayaran Masuk</h3>

              {paymentActionNotice && (
                <div
                  role="status"
                  className={`mb-5 rounded-xl border p-4 text-sm font-semibold ${
                    paymentActionNotice.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-rose-200 bg-rose-50 text-rose-900'
                  }`}
                >
                  {paymentActionNotice.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.filter(b => b.payment || b.status === 'PAYMENT_SUBMITTED').length === 0 ? (
                  <p className="text-slate-500 text-xs text-center col-span-2 py-8 font-normal">Belum ada bukti pembayaran yang perlu diverifikasi.</p>
                ) : (
                  bookings.filter(b => b.payment || b.status === 'PAYMENT_SUBMITTED').map(b => {
                    const paymentStatus = b.payment?.status || (b.status === 'PAYMENT_SUBMITTED' ? 'SUBMITTED' : '');
                    const isWaitingVerification = b.status === 'PAYMENT_SUBMITTED' && paymentStatus === 'SUBMITTED';
                    const statusLabel = paymentStatus === 'VERIFIED'
                      ? 'LUNAS · TERVERIFIKASI'
                      : paymentStatus === 'REJECTED'
                        ? 'BUKTI DITOLAK'
                        : isWaitingVerification
                          ? 'MENUNGGU VERIFIKASI'
                          : b.status;

                    return (
                    <div key={b.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-black text-blue-700">{b.bookingCode}</span>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${
                          paymentStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : paymentStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}>
                          {statusLabel}
                        </span>
                      </div>
                      
                      <p className="font-bold text-slate-900 text-base">{b.schoolName}</p>
                      <p className="text-xs text-slate-600">Pengirim: {b.payment?.senderName || b.visitorName}</p>
                      <p className="text-xs text-slate-600">Nominal: <strong className="text-blue-700 font-extrabold">Rp {Number(b.payment?.amount || b.totalEstimatedCost).toLocaleString('id-ID')}</strong></p>

                      {paymentStatus === 'VERIFIED' && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                          <p className="font-extrabold">Pembayaran sudah diverifikasi dan dinyatakan lunas.</p>
                          <p className="mt-1">Status booking telah dikonfirmasi oleh admin.</p>
                        </div>
                      )}

                      {paymentStatus === 'REJECTED' && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                          <p className="font-extrabold">Bukti pembayaran ditolak. Pengguna perlu mengunggah ulang bukti.</p>
                          <p className="mt-1"><strong>Alasan:</strong> {b.payment?.rejectionReason || 'Alasan penolakan tidak tersedia.'}</p>
                        </div>
                      )}

                      {isWaitingVerification && (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
                          Bukti pembayaran sudah diterima dan menunggu pemeriksaan admin.
                        </p>
                      )}

                      {b.payment?.proofUrl && b.payment.proofUrl.startsWith('data:image') && (
                        <div className="p-2 bg-white rounded-xl border border-slate-200">
                          <img src={b.payment.proofUrl} alt="Bukti Payment" className="max-h-48 mx-auto rounded-lg object-contain" />
                        </div>
                      )}

                      {isWaitingVerification && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleVerifyPayment(b.id)}
                            disabled={processingPaymentId === b.id}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            {processingPaymentId === b.id ? 'Memproses...' : '✓ Verifikasi Lunas'}
                          </button>
                          <button
                            onClick={() => setRejectPaymentModal(b)}
                            disabled={processingPaymentId === b.id}
                            className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            ✕ Tolak Bukti
                          </button>
                        </div>
                      )}
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KALENDER & JADWAL */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Jadwal Kunjungan per Tanggal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bookings.map(b => (
                  <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-blue-700">{b.visitDate}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">{b.visitTimeSlot}</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{b.schoolName}</p>
                    <p className="text-xs text-slate-600 mt-1">{b.studentCount} Siswa ({b.teacherCount} Guru)</p>
                    <span className="inline-block mt-2 text-[10px] font-extrabold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Status: {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: KELOLA PAKET & AKTIVITAS */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Daftar Paket Edukasi</h3>
              <div className="space-y-4">
                {packages.map(p => (
                  <div key={p.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{p.name}</h4>
                      <p className="text-xs text-slate-600 font-normal">{p.shortDescription}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-2xl font-black text-blue-700">Rp {Number(p.price).toLocaleString('id-ID')}</span>
                      <span className="text-xs text-slate-500 block font-normal">/ anak</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-xl font-bold text-slate-900">Kelola Status Aktivitas Edukasi</h3>
                <span className="text-xs text-slate-500">
                  Total: <strong className="text-blue-700">{activities.length}</strong> Aktivitas ({aktivitasTersedia} Aktif, {aktivitasTidakTersedia} Nonaktif)
                </span>
              </div>

              {/* Informative Note regarding Requirement F */}
              <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
                <span className="text-base">💡</span>
                <p className="leading-relaxed">
                  <strong>Pengaturan Status Kegiatan:</strong> Kegiatan berstatus <span className="font-bold text-emerald-700">Aktif</span> dapat dipilih oleh pengunjung pada form pemesanan baru. Kegiatan berstatus <span className="font-bold text-rose-700">Nonaktif</span> tidak dapat dipilih untuk pemesanan baru, namun riwayat transaksi dan data historisnya <strong>tetap tersimpan utuh</strong> untuk pelaporan pimpinan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activities.map(a => {
                  const isActive = a.isAvailable !== false && a.isActive !== false;
                  return (
                    <div key={a.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center transition hover:border-slate-300">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`font-bold text-sm ${!isActive ? 'line-through text-slate-400' : 'text-slate-900'}`}>{a.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {isActive ? 'AKTIF' : 'NONAKTIF'}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 font-bold">{a.category}</p>
                      </div>
                      <button
                        onClick={() => handleToggleActivity(a.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm ${
                          isActive
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                        }`}
                      >
                        {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: KELOLA PENGGUNA TERDAFTAR */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Pengguna Terdaftar</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nama</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Telepon</th>
                    <th className="p-3">Instansi</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {usersList.map(u => (
                    <tr key={u.id}>
                      <td className="p-3 font-bold text-slate-900">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.phone || '-'}</td>
                      <td className="p-3">{u.institutionName || '-'}</td>
                      <td className="p-3 font-extrabold uppercase text-blue-700">{u.role}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleUser(u.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${u.isActive ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}
                        >
                          {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: PENGATURAN PEMBAYARAN */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl max-w-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Pengaturan Rekening Pembayaran</h3>
            
            <form onSubmit={handleSaveBankSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Bank</label>
                <input
                  type="text"
                  required
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  required
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  required
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instruksi Pembayaran</label>
                <textarea
                  rows={3}
                  value={bankForm.instructions}
                  onChange={(e) => setBankForm({ ...bankForm, instructions: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-slate-900 text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-2xl text-sm shadow-md cursor-pointer"
              >
                Simpan Pengaturan Rekening
              </button>
            </form>
          </div>
        )}

        {/* TAB: REKAP SEKOLAH */}
        {activeTab === 'schools' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Rekap Booking Per Sekolah</h3>
              <p className="text-xs text-slate-500 mt-1">Daftar semua sekolah dan riwayat booking mereka.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Nama Sekolah</th>
                    <th className="p-4">Kota/Provinsi</th>
                    <th className="p-4">Total Booking</th>
                    <th className="p-4">Total Siswa</th>
                    <th className="p-4">Total Guru</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {schoolsList.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{s.schoolName}</td>
                      <td className="p-4">{s.city}, {s.province}</td>
                      <td className="p-4 font-bold text-blue-700">{s.totalBookings} Booking</td>
                      <td className="p-4">{s.totalAnak}</td>
                      <td className="p-4">{s.totalGuru}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedSchool(s)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer border border-slate-300 shadow-sm"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                  {schoolsList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-normal">Belum ada data sekolah.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>


      {/* MODAL 1: RINCIAN BOOKING DETAIL (ADMIN) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-slate-900 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs uppercase tracking-wider font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded-lg font-bold border border-blue-200">
                    {selectedBooking.bookingCode}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                    {selectedBooking.status}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Detail Booking</h3>
              </div>

            </div>

            <div className="space-y-6 text-xs sm:text-sm">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="font-extrabold text-blue-800 uppercase tracking-wider text-[11px] mb-2">1. Data Pemesan & Sekolah</p>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <p><strong className="text-slate-900">Pemesan:</strong> {selectedBooking.visitorName} ({selectedBooking.picPosition})</p>
                  <p><strong className="text-slate-900">Sekolah/Instansi:</strong> {selectedBooking.schoolName}</p>
                  <p><strong className="text-slate-900">Jenjang:</strong> {selectedBooking.educationLevel}</p>
                  <p><strong className="text-slate-900">Kota/Prov:</strong> {selectedBooking.city}, {selectedBooking.province}</p>
                  <p><strong className="text-slate-900">Alamat:</strong> {selectedBooking.schoolAddress || '-'}</p>
                  <p><strong className="text-slate-900">No Telepon/WA:</strong> {selectedBooking.phone}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="font-extrabold text-blue-800 uppercase tracking-wider text-[11px] mb-2">2. Data Kunjungan & Paket</p>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <p><strong className="text-slate-900">Tanggal Kunjungan:</strong> {selectedBooking.visitDate}</p>
                  <p><strong className="text-slate-900">Waktu:</strong> {selectedBooking.visitTimeSlot}</p>
                  <p><strong className="text-slate-900">Jumlah Siswa:</strong> {selectedBooking.studentCount} anak</p>
                  <p><strong className="text-slate-900">Jumlah Guru/Pendamping:</strong> {selectedBooking.teacherCount} orang</p>
                  <p><strong className="text-slate-900">Paket Utama:</strong> {selectedBooking.packageName} (Rp 35.000 / anak)</p>
                  <p><strong className="text-slate-900">Estimasi Total:</strong> <span className="text-blue-700 font-extrabold">Rp {Number(selectedBooking.totalEstimatedCost).toLocaleString('id-ID')}</span></p>
                  
                  {selectedBooking.alternativePackage1Name && (
                    <p><strong className="text-amber-700">Alternatif 1:</strong> <span className="text-amber-900 font-semibold">{selectedBooking.alternativePackage1Name}</span></p>
                  )}
                  {selectedBooking.alternativePackage2Name && (
                    <p><strong className="text-amber-700">Alternatif 2:</strong> <span className="text-amber-900 font-semibold">{selectedBooking.alternativePackage2Name}</span></p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="font-extrabold text-blue-800 uppercase tracking-wider text-[11px] mb-2">3. Pilihan Aktivitas</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedBooking.selectedActivities ? (
                    JSON.parse(selectedBooking.selectedActivities || '[]').map((act, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 border border-blue-200 text-blue-900 rounded-full font-bold text-xs">
                        ✓ {act}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 font-normal">Belum memilih aktivitas</span>
                  )}
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Catatan Pemesan:</p>
                  <p className="text-slate-600 font-normal">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* MODAL: REKAP SEKOLAH */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-5xl w-full text-slate-900 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSchool(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-extrabold text-slate-900">Rekap Booking Per Sekolah</h3>
              <p className="text-sm text-slate-500 mt-1">Riwayat Booking dan Kunjungan Sekolah: <span className="font-bold text-slate-800">{selectedSchool.schoolName}</span></p>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Total Booking</span>
                <span className="text-xl font-black text-slate-900">{selectedSchool.totalBookings}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-blue-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-blue-800 font-bold block mb-1">Total Anak</span>
                <span className="text-xl font-black text-blue-700">{selectedSchool.totalAnak}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-indigo-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-indigo-800 font-bold block mb-1">Total Guru</span>
                <span className="text-xl font-black text-indigo-700">{selectedSchool.totalGuru}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-teal-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-teal-800 font-bold block mb-1">Aktivitas Tersedia</span>
                <span className="text-xl font-black text-teal-700">{aktivitasTersedia}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-rose-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-rose-800 font-bold block mb-1">Aktv Tidak Tersedia</span>
                <span className="text-xl font-black text-rose-700">{aktivitasTidakTersedia}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-amber-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-amber-800 font-bold block mb-1">Mnggu Pembayaran</span>
                <span className="text-xl font-black text-amber-700">{selectedSchool.waitingPayment}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-purple-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-purple-800 font-bold block mb-1">Mnggu Verifikasi</span>
                <span className="text-xl font-black text-purple-700">{selectedSchool.waitingVerification}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold block mb-1">Disetujui/Lunas</span>
                <span className="text-xl font-black text-emerald-700">{selectedSchool.approved}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-red-200 shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-red-800 font-bold block mb-1">Ditolak</span>
                <span className="text-xl font-black text-red-700">{selectedSchool.rejected}</span>
              </div>
            </div>

            {/* Riwayat Booking */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Kode Booking</th>
                      <th className="p-3">Tgl Daftar</th>
                      <th className="p-3">Tgl Kunjungan</th>
                      <th className="p-3">Pemesan</th>
                      <th className="p-3">Anak</th>
                      <th className="p-3">Guru</th>
                      <th className="p-3">Paket & Aktivitas</th>
                      <th className="p-3">Total Biaya</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedSchool.bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700">{b.bookingCode}</td>
                        <td className="p-3">{new Date(b.createdAt).toLocaleDateString('id-ID')}</td>
                        <td className="p-3 font-bold">{b.visitDate}</td>
                        <td className="p-3">{b.visitorName}</td>
                        <td className="p-3">{b.studentCount}</td>
                        <td className="p-3">{b.teacherCount}</td>
                        <td className="p-3">
                          <p className="font-bold">{b.packageName}</p>
                          <p className="text-[10px] text-slate-500 max-w-[150px] truncate">
                            {b.selectedActivities ? JSON.parse(b.selectedActivities).join(', ') : '-'}
                          </p>
                        </td>
                        <td className="p-3 font-bold text-blue-700">Rp {Number(b.totalEstimatedCost).toLocaleString('id-ID')}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200 block text-center">{b.status}</span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold transition-colors cursor-pointer"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* APPROVAL MODAL */}
      {approveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl text-center">
            <ThumbsUp className="w-12 h-12 text-blue-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Setujui Booking Ini?</h3>
            <p className="text-xs text-slate-600 mb-6 font-normal">
              Booking <strong className="text-blue-700">#{approveModal.bookingCode}</strong> ({approveModal.schoolName}) akan disetujui. Pengguna akan diberikan akses pembayaran.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setApproveModal(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Approve Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl">
            <ThumbsDown className="w-12 h-12 text-rose-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-center mb-2">Tolak Booking Ini</h3>
            <p className="text-xs text-slate-600 mb-4 font-normal text-center">
              Mohon masukkan alasan penolakan untuk booking <strong className="text-blue-700">#{rejectModal.bookingCode}</strong>.
            </p>

            <textarea
              rows={3}
              required
              placeholder="Alasan penolakan..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-slate-900 text-xs mb-6 focus:border-rose-600 focus:outline-none"
            ></textarea>

            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Tolak Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST REVISION MODAL */}
      {revisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl">
            <Edit3 className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-center mb-2">Minta Perbaikan Data</h3>
            <p className="text-xs text-slate-600 mb-4 font-normal text-center">
              Sampaikan data yang perlu diperbaiki oleh pemesan <strong className="text-blue-700">#{revisionModal.bookingCode}</strong>.
            </p>

            <textarea
              rows={3}
              required
              placeholder="Catatan perbaikan yang dibutuhkan..."
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-slate-900 text-xs mb-6 focus:border-amber-600 focus:outline-none"
            ></textarea>

            <div className="flex gap-3">
              <button
                onClick={() => setRevisionModal(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleRequestRevision}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Minta Perbaikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT PAYMENT PROOF MODAL */}
      {rejectPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-center mb-2">Tolak Bukti Pembayaran</h3>
            <p className="text-xs text-slate-600 mb-4 font-normal text-center">
              Masukkan alasan penolakan bukti pembayaran untuk <strong className="text-blue-700">#{rejectPaymentModal.bookingCode}</strong>.
            </p>

            <textarea
              rows={3}
              required
              placeholder="Contoh: Nominal pembayaran belum sesuai atau bukti transfer buram..."
              value={paymentRejectionReason}
              onChange={(e) => setPaymentRejectionReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-slate-900 text-xs mb-6 focus:border-rose-600 focus:outline-none"
            ></textarea>

            <div className="flex gap-3">
              <button
                onClick={() => setRejectPaymentModal(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleRejectPayment}
                disabled={processingPaymentId === rejectPaymentModal.id}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
              >
                {processingPaymentId === rejectPaymentModal.id ? 'Memproses...' : 'Tolak Bukti Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
