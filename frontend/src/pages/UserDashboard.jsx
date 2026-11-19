import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

import { 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Download, 
  ChevronRight, 
  Plus, 
  RefreshCw, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Printer, 
  X,
  Info,
  ArrowLeftRight,
  Settings
} from 'lucide-react';

const UserDashboard = () => {
  const { user, logout, switchAccount, isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [printModalBooking, setPrintModalBooking] = useState(null);
  const navigate = useNavigate();

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/my');
      setBookings(response.data || []);
    } catch (err) {
      console.error('Failed to fetch user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleSwitchRole = async (targetRole) => {
    const res = await switchAccount(targetRole);
    if (res?.success) {
      if (targetRole === 'admin') {
        navigate('/admin');
      } else {
        fetchMyBookings();
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-50 border border-amber-200 text-amber-800">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            Menunggu Persetujuan
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-100 border border-blue-200 text-blue-900">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Booking Disetujui — Bayar Sekarang
          </span>
        );
      case 'PAYMENT_SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-purple-50 border border-purple-200 text-purple-800">
            <CreditCard className="w-3.5 h-3.5" />
            Bukti Pembayaran Sedang Diperiksa
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 border border-emerald-200 text-emerald-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Booking Dikonfirmasi!
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-rose-50 border border-rose-200 text-rose-800">
            <AlertCircle className="w-3.5 h-3.5" />
            Booking Tidak Disetujui
          </span>
        );
      case 'REVISION_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-orange-50 border border-orange-200 text-orange-800">
            <AlertCircle className="w-3.5 h-3.5" />
            Perlu Perbaikan Data
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'PENDING_REVIEW': return 1;
      case 'REVISION_REQUESTED': return 1;
      case 'APPROVED': return 2;
      case 'PAYMENT_SUBMITTED': return 3;
      case 'CONFIRMED': return 4;
      case 'COMPLETED': return 5;
      default: return 1;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 pb-20 font-sans selection:bg-blue-600 selection:text-white">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Profile Summary */}
        <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{user?.name}</h1>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-full">
                  Pemesan
                </span>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 flex items-center justify-center md:justify-start gap-4">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.phone || '-'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-full text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Settings className="w-4 h-4" />
                <span>Panel Admin</span>
              </button>
            )}

            <button
              onClick={() => navigate('/booking')}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-full text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Booking Baru</span>
            </button>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Daftar Booking Saya</h2>
            <p className="text-slate-600 text-xs sm:text-sm font-normal mt-0.5">
              Pantau status persetujuan, tagihan, dan riwayat reservasi Anda.
            </p>
          </div>
          <button
            onClick={fetchMyBookings}
            className="p-2.5 bg-white hover:bg-slate-100 rounded-xl text-slate-700 transition-colors border border-slate-200 cursor-pointer shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Booking Cards List */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-700 mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm">Memuat daftar booking Anda...</p>
          </div>
        ) : bookings.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-16 px-6 text-center bg-white rounded-3xl border border-slate-200 shadow-xl max-w-xl mx-auto">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Belum ada booking</h3>
            <p className="text-slate-600 text-sm mb-6 font-normal">
              Anda belum membuat reservasi Paket Kunjungan Edukasi Polinela.
            </p>
            <button
              onClick={() => navigate('/booking')}
              className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-full text-sm shadow-md hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Booking Pertama</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const currentStep = getStatusStepIndex(booking.status);
              const selectedActs = booking.selectedActivities 
                ? (typeof booking.selectedActivities === 'string' 
                    ? JSON.parse(booking.selectedActivities || '[]') 
                    : booking.selectedActivities)
                : [];

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden"
                >
                  {/* Top Bar Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs uppercase tracking-wider font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded-lg font-bold border border-blue-200">
                          {booking.bookingCode}
                        </span>
                        <span className="text-xs text-slate-500 font-normal">
                          Dibuat: {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {booking.schoolName}
                      </h3>
                    </div>

                    <div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Booking Status Timeline Progress */}
                  <div className="py-6 border-b border-slate-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                      Progress Workflow Booking:
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      
                      {/* Step 1 */}
                      <div className={`p-2.5 rounded-xl border ${currentStep >= 1 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        <div className="font-extrabold mb-0.5">1. Review Admin</div>
                        <span className="text-[10px] block opacity-80">Pemeriksaan Jadwal</span>
                      </div>

                      {/* Step 2 */}
                      <div className={`p-2.5 rounded-xl border ${currentStep >= 2 ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        <div className="font-extrabold mb-0.5">2. Disetujui</div>
                        <span className="text-[10px] block opacity-80">Akses Pembayaran</span>
                      </div>

                      {/* Step 3 */}
                      <div className={`p-2.5 rounded-xl border ${currentStep >= 3 ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        <div className="font-extrabold mb-0.5">3. Verifikasi Bayar</div>
                        <span className="text-[10px] block opacity-80">Cek Bukti Transfer</span>
                      </div>

                      {/* Step 4 */}
                      <div className={`p-2.5 rounded-xl border ${currentStep >= 4 ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        <div className="font-extrabold mb-0.5">4. Konfirmasi</div>
                        <span className="text-[10px] block opacity-80">Tiket Kunjungan Valid</span>
                      </div>

                    </div>
                  </div>

                  {/* Detail Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-slate-200 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-500 block mb-1">Tanggal & Waktu:</span>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-700" />
                        {booking.visitDate} ({booking.visitTimeSlot})
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1">Jumlah Peserta:</span>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        {booking.studentCount} Siswa ({booking.teacherCount || 0} Pendamping)
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1">Estimasi Total Biaya:</span>
                      <p className="font-black text-blue-700 text-base">
                        Rp {Number(booking.totalEstimatedCost || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Rejection / Revision Alert Box */}
                  {booking.status === 'REJECTED' && (
                    <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
                      <p className="font-bold text-rose-900 mb-1 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Alasan Penolakan Admin:
                      </p>
                      <p className="font-normal">{booking.rejectionReason || 'Jadwal kunjungan pada tanggal tersebut sudah penuh.'}</p>
                    </div>
                  )}

                  {booking.status === 'REVISION_REQUESTED' && (
                    <div className="mt-4 p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-800 text-xs sm:text-sm">
                      <p className="font-bold text-orange-900 mb-1 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Catatan Perbaikan Admin:
                      </p>
                      <p className="font-normal">{booking.revisionNote || 'Mohon sesuaikan jumlah peserta atau tanggal kunjungan.'}</p>
                    </div>
                  )}

                  {/* Bottom Action Footer */}
                  <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
                    
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-blue-700" />
                      <span>Lihat Rincian Lengkap</span>
                    </button>

                    <div className="flex items-center gap-3">
                      
                      {/* ACTION: PAYMENT BUTTON (ONLY WHEN APPROVED) */}
                      {booking.status === 'APPROVED' && (
                        <button
                          onClick={() => navigate(`/booking/${booking.id}/payment`)}
                          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Lanjutkan ke Pembayaran</span>
                        </button>
                      )}

                      {/* ACTION: RE-UPLOAD PAYMENT PROOF */}
                      {booking.status === 'PAYMENT_SUBMITTED' && (
                        <button
                          onClick={() => navigate(`/booking/${booking.id}/payment`)}
                          className="px-5 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold transition-all border border-purple-200 flex items-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 text-purple-700" />
                          <span>Lihat / Upload Ulang Bukti</span>
                        </button>
                      )}

                      {/* ACTION: DOWNLOAD / PRINT TICKET PASS (WHEN CONFIRMED) */}
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => setPrintModalBooking(booking)}
                          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Cetak / Download Bukti Booking</span>
                        </button>
                      )}

                    </div>

                  </div>

                </motion.div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL 1: RINCIAN BOOKING DETAIL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-slate-900 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded-lg font-bold border border-blue-200">
                {selectedBooking.bookingCode}
              </span>
              {getStatusBadge(selectedBooking.status)}
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Detail Permintaan Booking</h3>

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
                  <p><strong className="text-slate-900">Paket:</strong> {selectedBooking.packageName} (Rp 35.000 / anak)</p>
                  <p><strong className="text-slate-900">Estimasi Total:</strong> <span className="text-blue-700 font-extrabold">Rp {Number(selectedBooking.totalEstimatedCost).toLocaleString('id-ID')}</span></p>
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

      {/* MODAL 2: PRINTABLE BOOKING PASS CONFIRMATION TICKET */}
      {printModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:bg-white print:text-black">
          <div className="bg-white border-2 border-blue-600 rounded-3xl p-8 max-w-xl w-full text-slate-900 shadow-2xl relative print:border-none print:shadow-none">
            
            <button
              onClick={() => setPrintModalBooking(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 print:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Ticket Header */}
            <div className="text-center pb-6 border-b border-dashed border-slate-300 mb-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-900 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                BUKTI KONFIRMASI KUNJUNGAN
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-3">Polinela Edukasi</h2>
              <p className="text-xs text-slate-600 mt-0.5">Unit Pengelola Bisnis Politeknik Negeri Lampung</p>
            </div>

            {/* Ticket Info */}
            <div className="space-y-4 text-xs sm:text-sm mb-6">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block mb-1 font-bold text-xs">KODE BOOKING:</span>
                  <span className="font-mono font-black text-blue-700 text-xl sm:text-2xl">{printModalBooking.bookingCode}</span>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[11px]">NAMA PEMESAN / PIC:</span>
                  <span className="font-bold text-slate-900">{printModalBooking.visitorName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">SEKOLAH / INSTANSI:</span>
                  <span className="font-bold text-slate-900">{printModalBooking.schoolName}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[11px]">KEMANA (TUJUAN):</span>
                  <span className="font-bold text-slate-900">Politeknik Negeri Lampung</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[11px]">DIMANA (ALAMAT):</span>
                  <span className="font-bold text-slate-900 text-xs">Jl. Soekarno Hatta No. 10, Rajabasa Raya, Bandar Lampung 35141</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[11px]">PAKET KUNJUNGAN:</span>
                  <span className="font-bold text-slate-900">{printModalBooking.packageName || 'Paket Edukasi Polinela'}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[11px] mb-1">2 AKTIVITAS KUNJUNGAN:</span>
                  <ol className="list-decimal pl-4 font-bold text-slate-900 text-xs leading-tight">
                    {printModalBooking.selectedActivities ? JSON.parse(printModalBooking.selectedActivities).map((act, i) => (
                      <li key={i}>{act}</li>
                    )) : <li>Belum memilih</li>}
                  </ol>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">TANGGAL KUNJUNGAN:</span>
                  <span className="font-bold text-blue-700">{printModalBooking.visitDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">WAKTU / JAM:</span>
                  <span className="font-bold text-slate-900">{printModalBooking.visitTimeSlot}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">JUMLAH PESERTA:</span>
                  <span className="font-bold text-slate-900">{printModalBooking.studentCount} Anak (+{printModalBooking.teacherCount} Guru)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">STATUS PEMBAYARAN:</span>
                  <span className="font-bold text-emerald-600">LUNAS / VERIFIED</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-900 text-xs font-extrabold">
                ✓ Tiket Kunjungan Resmi Dikonfirmasi
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 print:hidden">
              <button
                onClick={() => setPrintModalBooking(null)}
                className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-200"
              >
                Tutup
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Download PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
