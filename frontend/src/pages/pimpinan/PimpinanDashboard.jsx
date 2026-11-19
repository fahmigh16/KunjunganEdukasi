import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  FileText, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  BarChart3, 
  PieChart, 
  School, 
  Layers,
  Award,
  ArrowUpDown
} from 'lucide-react';

const CHART_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#e11d48', '#0891b2'];

const HorizontalBarChart = ({
  data = [],
  labelKey,
  valueKey,
  colorClass = 'bg-blue-600',
  valueLabel = '',
  formatValue = (value) => value,
  renderMeta
}) => {
  const maxValue = Math.max(...data.map((item) => Number(item[valueKey]) || 0), 0);

  if (!data.length) {
    return <p className="py-6 text-center text-sm text-slate-400">Data grafik belum tersedia.</p>;
  }

  return (
    <div className="space-y-4" role="list">
      {data.map((item, index) => {
        const value = Number(item[valueKey]) || 0;
        const width = maxValue > 0 ? (value / maxValue) * 100 : 0;

        return (
          <div key={`${item[labelKey]}-${index}`} className="space-y-1.5" role="listitem">
            <div className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <span className="block break-words font-semibold text-slate-700">{item[labelKey]}</span>
                {renderMeta && <span className="mt-0.5 block text-xs text-slate-500">{renderMeta(item)}</span>}
              </div>
              <span className="shrink-0 text-right font-extrabold text-slate-900">
                {formatValue(value)}{valueLabel ? ` ${valueLabel}` : ''}
              </span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label={`${item[labelKey]}: ${formatValue(value)}${valueLabel ? ` ${valueLabel}` : ''}`}
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={maxValue}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DonutChart = ({ data = [], labelKey, valueKey, centerLabel, renderValue }) => {
  const total = data.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-[minmax(120px,160px)_1fr]">
      <div className="relative mx-auto h-40 w-40">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${centerLabel}: ${total}`}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
          {total > 0 && data.map((item, index) => {
            const value = Number(item[valueKey]) || 0;
            const segmentLength = (value / total) * circumference;
            const dashOffset = offset;
            offset += segmentLength;

            if (value <= 0) return null;
            return (
              <circle
                key={`${item[labelKey]}-${index}`}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth="14"
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-dashOffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-900">{total.toLocaleString('id-ID')}</span>
          <span className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">{centerLabel}</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {data.map((item, index) => {
          const value = Number(item[valueKey]) || 0;
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

          return (
            <div key={`${item[labelKey]}-${index}`} className="flex items-start justify-between gap-3 text-sm">
              <div className="flex min-w-0 items-start gap-2">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                <span className="break-words font-medium text-slate-700">{item[labelKey]}</span>
              </div>
              <span className="shrink-0 text-right font-bold text-slate-900">
                {renderValue ? renderValue(item, value) : `${value} (${percentage}%)`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PimpinanDashboard = () => {
  const { user, logout, switchAccount } = useAuth();
  const navigate = useNavigate();

  // Filter States (Requirement C)
  const [period, setPeriod] = useState('all'); // all, today, weekly, monthly, yearly, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ period: 'all', startDate: '', endDate: '' });

  // Data States
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [rekapData, setRekapData] = useState([]);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('visitDate');
  const [sortOrder, setSortOrder] = useState('DESC');
  
  // Tab Navigation (Mengatasi tampilan bertumpuk)
  const [activeTab, setActiveTab] = useState('kegiatan'); // 'kegiatan', 'tren', 'rekapitulasi', 'semua'

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Dashboard Stats & Charts
  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = { period: appliedFilter.period };
      if (appliedFilter.period === 'custom') {
        if (appliedFilter.startDate) params.startDate = appliedFilter.startDate;
        if (appliedFilter.endDate) params.endDate = appliedFilter.endDate;
      }
      const res = await axios.get('http://localhost:5000/api/pimpinan/dashboard', { params });
      if (res.data.success) {
        setStatsData(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil statistik pimpinan:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Rekapitulasi Table
  const fetchRekap = async (page = 1) => {
    try {
      const params = {
        period: appliedFilter.period,
        page,
        limit: pagination.limit,
        search: debouncedSearch,
        sortBy,
        sortOrder
      };
      if (appliedFilter.period === 'custom') {
        if (appliedFilter.startDate) params.startDate = appliedFilter.startDate;
        if (appliedFilter.endDate) params.endDate = appliedFilter.endDate;
      }
      const res = await axios.get('http://localhost:5000/api/pimpinan/rekapitulasi', { params });
      if (res.data.success) {
        setRekapData(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Gagal mengambil rekapitulasi pimpinan:', err);
    }
  };

  // Trigger fetch when filter changes
  useEffect(() => {
    fetchStats();
    fetchRekap(1);
  }, [appliedFilter]);

  // Trigger table fetch when pagination, search, sort changes
  useEffect(() => {
    fetchRekap(pagination.currentPage);
  }, [debouncedSearch, sortBy, sortOrder]);

  const handleApplyFilter = () => {
    setAppliedFilter({ period, startDate, endDate });
  };

  const handleResetFilter = () => {
    setPeriod('all');
    setStartDate('');
    setEndDate('');
    setAppliedFilter({ period: 'all', startDate: '', endDate: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format IDR Currency
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Export to Excel (CSV with Excel-compatible BOM)
  const handleExportExcel = async () => {
    try {
      const params = { period: appliedFilter.period };
      if (appliedFilter.period === 'custom') {
        if (appliedFilter.startDate) params.startDate = appliedFilter.startDate;
        if (appliedFilter.endDate) params.endDate = appliedFilter.endDate;
      }
      const res = await axios.get('http://localhost:5000/api/pimpinan/export', { params });
      if (!res.data.success || !res.data.data) {
        alert('Data tidak tersedia untuk diekspor.');
        return;
      }

      const rows = res.data.data;
      const headers = [
        'No',
        'Kode Booking',
        'Tanggal Kunjungan',
        'Sesi Waktu',
        'Nama Sekolah / Instansi',
        'Jenjang Pendidikan',
        'Kota/Kabupaten',
        'Jumlah Siswa',
        'Jumlah Guru',
        'Total Peserta',
        'Paket Edukasi',
        'Kegiatan Dipilih',
        'Total Biaya (Rp)',
        'Status Pemesanan',
        'Status Pembayaran',
        'Catatan'
      ];

      const csvContent = [
        headers.join(';'),
        ...rows.map(r => [
          r.no,
          `"${r.bookingCode}"`,
          `"${r.visitDate}"`,
          `"${r.visitTimeSlot}"`,
          `"${(r.schoolName || '').replace(/"/g, '""')}"`,
          `"${r.educationLevel}"`,
          `"${r.city || '-'}"`,
          r.studentCount,
          r.teacherCount,
          r.totalVisitors,
          `"${(r.packageName || '').replace(/"/g, '""')}"`,
          `"${(r.selectedActivities || '').replace(/"/g, '""')}"`,
          r.totalEstimatedCost,
          `"${r.status}"`,
          `"${r.paymentStatus}"`,
          `"${(r.notes || '').replace(/"/g, '""')}"`
        ].join(';'))
      ].join('\r\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Laporan_Kunjungan_Edukasi_POLINELA_${appliedFilter.period}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Gagal mengekspor laporan Excel.');
    }
  };

  // Trigger Print to PDF
  const handlePrintPDF = () => {
    window.print();
  };

  const summary = statsData?.summary || { totalVisits: 0, totalParticipants: 0, totalBookings: 0, totalRevenue: 0 };
  const charts = statsData?.charts || {};

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-24">
      
      {/* ============================================================== */}
      {/* 1. TOP EXECUTIVE HEADER (DENGAN LOGO UPB & BLU RESMI)           */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white shadow-lg border-b border-blue-800 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo Resmi UPB dan BLU (Menggantikan Tanda Bintang / AI) */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm border border-white/30">
              <img 
                src="/logo-upb.png" 
                alt="Logo UPB Polinela" 
                className="h-8 sm:h-10 w-auto object-contain"
              />
              <div className="h-6 w-px bg-slate-300"></div>
              <img 
                src="/logo-blu-speed.png" 
                alt="Logo BLU Speed" 
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white">
                  Dashboard Pimpinan
                </h1>
                <span className="px-2 py-0.5 bg-blue-800 text-blue-200 border border-blue-700 rounded-md text-[10px] font-bold tracking-wide uppercase">
                  UPB Polinela
                </span>
              </div>
              <p className="text-xs text-blue-200 font-normal">
                Sistem Informasi Kunjungan Edukasi Politeknik Negeri Lampung
              </p>
            </div>
          </Link>

          {/* User Profile & Actions (Tanpa Emoj / Bintang / Perisai) */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-tight">{user?.name || 'Pimpinan UPB Polinela'}</span>
              <span className="text-[10px] text-blue-300">{user?.email || 'pimpinan@polinela.ac.id'}</span>
            </div>

            {/* Role Switcher Bersih & Formal */}
            <div className="hidden sm:flex items-center bg-blue-950/90 px-2 py-1 rounded-xl border border-blue-800 text-xs gap-1">
              <span className="text-[10px] text-blue-300 font-semibold px-1">Ganti:</span>
              <button
                onClick={() => { switchAccount('user'); navigate('/dashboard'); }}
                className="px-2.5 py-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 text-[11px] font-bold transition cursor-pointer"
              >
                Pengunjung
              </button>
              <button
                onClick={() => { switchAccount('admin'); navigate('/admin'); }}
                className="px-2.5 py-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 text-[11px] font-bold transition cursor-pointer"
              >
                Admin
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* KOP SURAT RESMI CETAK (PRINT ONLY FOR PDF EXPORT)              */}
      {/* ============================================================== */}
      <div className="hidden print:block max-w-5xl mx-auto p-6 bg-white border-b-2 border-slate-900 mb-6">
        <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-4 mb-4">
          <div className="text-center w-full">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</h2>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-blue-900">POLITEKNIK NEGERI LAMPUNG</h1>
            <h3 className="text-sm font-semibold tracking-wide text-slate-700">UNIT PENGELOLA BISNIS (UPB) - KUNJUNGAN EDUKASI</h3>
            <p className="text-xs text-slate-500 mt-1">Jl. Soekarno Hatta No. 10, Rajabasa, Bandar Lampung 35144 | Website: polinela.ac.id</p>
          </div>
        </div>
        <div className="text-center my-3">
          <h2 className="text-base font-black uppercase underline decoration-2 underline-offset-4">
            LAPORAN REKAPITULASI DAN STATISTIK KUNJUNGAN EDUKASI
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Periode Laporan: <strong>{appliedFilter.period.toUpperCase()}</strong> {appliedFilter.startDate && `(${appliedFilter.startDate} s.d ${appliedFilter.endDate})`} | Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN DASHBOARD CONTENT AREA (RAPI DENGAN MARGIN LEGA)          */}
      {/* ============================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* 2. FILTER PERIODE & AKSI EKSPOR */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 print:hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            
            {/* Filter Buttons */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Filter className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Filter Periode Waktu
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'Semua Periode' },
                  { id: 'today', label: 'Hari Ini' },
                  { id: 'weekly', label: 'Minggu Ini' },
                  { id: 'monthly', label: 'Bulan Ini' },
                  { id: 'yearly', label: 'Tahun Ini' },
                  { id: 'custom', label: 'Rentang Khusus' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPeriod(item.id);
                      if (item.id !== 'custom') {
                        setAppliedFilter({ period: item.id, startDate: '', endDate: '' });
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      period === item.id
                        ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Excel</span>
              </button>
              <button
                onClick={handlePrintPDF}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Unduh PDF</span>
              </button>
              <button
                onClick={() => { fetchStats(); fetchRekap(pagination.currentPage); }}
                title="Perbarui Data"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer border border-slate-200"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-700' : ''}`} />
              </button>
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {period === 'custom' && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Tanggal Mulai:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Tanggal Selesai:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
              <button
                onClick={handleApplyFilter}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-sm transition cursor-pointer"
              >
                Terapkan
              </button>
              <button
                onClick={handleResetFilter}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}

          {/* Active Period Indicator */}
          <div className="mt-4 text-xs text-slate-600 flex items-center gap-2 pt-3 border-t border-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>
              Data aktual terpilih: <strong className="text-slate-900 capitalize">{appliedFilter.period}</strong>
              {appliedFilter.startDate && appliedFilter.endDate && ` (${appliedFilter.startDate} s.d ${appliedFilter.endDate})`}
            </span>
          </div>
        </div>

        {/* 3. KARTU RINGKASAN EKSEKUTIF (DENGAN MARGIN LEGA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Total Kunjungan */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kunjungan</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{summary.totalVisits}</span>
                <span className="text-xs font-bold text-blue-700">kegiatan</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
              Kunjungan terkonfirmasi & disetujui
            </p>
          </div>

          {/* Card 2: Total Peserta */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Peserta</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {summary.totalParticipants.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-bold text-emerald-700">orang</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
              Gabungan siswa dan guru pendamping
            </p>
          </div>

          {/* Card 3: Total Pemesanan */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pemesanan</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{summary.totalBookings}</span>
                <span className="text-xs font-bold text-indigo-700">booking</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
              Semua status pengajuan reservasi
            </p>
          </div>

          {/* Card 4: Pendapatan Terverifikasi */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pendapatan Terverifikasi</span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight">
                  {formatIDR(summary.totalRevenue)}
                </span>
              </div>
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pembayaran yang telah diverifikasi
            </p>
          </div>
        </div>

        {/* 4. NAVIGASI TAB MODUL DASHBOARD (MENCEGAH PENUMPUKAN KONTEN) */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'kegiatan', label: '1. Statistik Kegiatan & Paket', icon: Award },
              { id: 'tren', label: '2. Analisis Tren & Keuangan', icon: TrendingUp },
              { id: 'rekapitulasi', label: '3. Rekapitulasi Sekolah & Tabel', icon: School },
              { id: 'semua', label: '4. Tampilkan Semua Grafik', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-900 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODUL TAB 1: KEGIATAN & PAKET                                  */}
        {/* ============================================================== */}
        {(activeTab === 'kegiatan' || activeTab === 'semua') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* GRAFIK 1: KEGIATAN PALING & KURANG DIMINATI */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-700" />
                      1. Kegiatan Paling & Kurang Diminati
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      Frekuensi Dipilih
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-5">
                    Evaluasi minat pemilih kegiatan laboratorium untuk mendukung perencanaan operasional.
                  </p>

                  <HorizontalBarChart
                    data={charts.activityStats}
                    labelKey="name"
                    valueKey="count"
                    colorClass="bg-blue-600"
                    valueLabel="kali"
                    renderMeta={(activity) => (
                      <span className={activity.isActive ? 'font-semibold text-emerald-700' : 'font-semibold text-slate-500'}>
                        {activity.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    )}
                  />
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Paling Diminati:</span>
                    <span className="font-extrabold text-emerald-950 text-sm">
                      {charts.mostPopularActivities?.[0]?.name || '-'}
                    </span>
                    <span className="text-[11px] text-emerald-700 block mt-0.5">
                      ({charts.mostPopularActivities?.[0]?.count || 0} kali dipilih)
                    </span>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-700 block">Kurang Diminati:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {charts.leastPopularActivities?.[0]?.name || '-'}
                    </span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      ({charts.leastPopularActivities?.[0]?.count || 0} kali dipilih)
                    </span>
                  </div>
                </div>
              </div>

              {/* GRAFIK 4: PERBANDINGAN PAKET EDUKASI */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-700" />
                      4. Perbandingan Paket Kunjungan Edukasi
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                      Popularitas Paket
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-5">
                    Tingkat keterpilihan paket kunjungan edukasi oleh sekolah atau instansi pemesan.
                  </p>

                  <HorizontalBarChart
                    data={charts.packageStats}
                    labelKey="name"
                    valueKey="count"
                    colorClass="bg-indigo-600"
                    valueLabel="pemesanan"
                    renderMeta={(pkg) => `Tarif ${formatIDR(pkg.price)} / siswa • ${pkg.participants} peserta`}
                  />
                </div>

                {/* GRAFIK 2: JENJANG PENDIDIKAN (TERPADU DI TAB INI) */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">
                    2. Kunjungan Berdasarkan Jenjang Pendidikan:
                  </h4>
                  <DonutChart
                    data={charts.educationStats}
                    labelKey="level"
                    valueKey="visits"
                    centerLabel="kunjungan"
                    renderValue={(education, visits) => `${visits} kunj. • ${education.participants} peserta`}
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODUL TAB 2: TREN & KEUANGAN                                   */}
        {/* ============================================================== */}
        {(activeTab === 'tren' || activeTab === 'semua') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* GRAFIK 8: TREN KUNJUNGAN */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-700" />
                    8. Tren Kunjungan (Peningkatan & Penurunan)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    Evaluasi Pertumbuhan
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Memantau arah perubahan volume kunjungan antar periode untuk proyeksi jadwal berikutnya.
                </p>

                <HorizontalBarChart
                  data={charts.trendAnalysis}
                  labelKey="period"
                  valueKey="visits"
                  colorClass="bg-blue-600"
                  valueLabel="kunjungan"
                  renderMeta={(trend) => {
                    const growth = trend.statusTrend === 'NAIK' ? `+${trend.growthPercent}%` : `${trend.growthPercent}%`;
                    const status = trend.statusTrend === 'NAIK' ? 'Meningkat' : trend.statusTrend === 'TURUN' ? 'Menurun' : 'Stabil';
                    return `${status} dibanding periode sebelumnya (${growth})`;
                  }}
                />
              </div>

              {/* GRAFIK 6: PENDAPATAN BERDASARKAN PERIODE */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-700" />
                    6. Pendapatan Berdasarkan Periode (Hanya Verified)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Kas Masuk Riil
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Hanya mengakumulasi bukti pembayaran yang telah dinyatakan sah dan diverifikasi oleh Admin UPB.
                </p>

                {charts.revenueByPeriod && charts.revenueByPeriod.length > 0 ? (
                  <HorizontalBarChart
                    data={charts.revenueByPeriod}
                    labelKey="period"
                    valueKey="revenue"
                    colorClass="bg-amber-500"
                    formatValue={formatIDR}
                  />
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Belum ada pembayaran yang berstatus terverifikasi pada periode terpilih.
                  </div>
                )}
              </div>

            </div>

            {/* BARIS TREN 2: GRAFIK 3 & GRAFIK 5 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* GRAFIK 3: KUNJUNGAN WAKTU */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-700" />
                    3. Volume Kunjungan Berdasarkan Periode
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Riwayat Waktu
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Sebaran jumlah kunjungan rombongan pada setiap rentang bulan dan hari.
                </p>

                <HorizontalBarChart
                  data={charts.monthlyVisits}
                  labelKey="period"
                  valueKey="visits"
                  colorClass="bg-emerald-600"
                  valueLabel="kunjungan"
                />
              </div>

              {/* GRAFIK 5: STATUS PEMESANAN */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-700" />
                    5. Status Pemesanan Saat Ini
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    Siklus Booking
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Komposisi status permohonan dari tahap awal review hingga terkonfirmasi.
                </p>

                <DonutChart
                  data={charts.bookingStatusStats}
                  labelKey="status"
                  valueKey="count"
                  centerLabel="pemesanan"
                  renderValue={(status) => `${status.count} (${status.percentage}%)`}
                />
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODUL TAB 3: REKAPITULASI SEKOLAH & TABEL LENGKAP              */}
        {/* ============================================================== */}
        {(activeTab === 'rekapitulasi' || activeTab === 'semua') && (
          <div className="space-y-6">
            
            {/* GRAFIK 7: PESERTA PER SEKOLAH MITRA */}
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <School className="w-5 h-5 text-purple-700" />
                  7. Jumlah Peserta Berdasarkan Sekolah / Instansi Mitra
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                  Top 10 Sekolah
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Daftar lembaga pendidikan dengan volume peserta terbanyak yang telah berkunjung ke POLINELA.
              </p>

              <HorizontalBarChart
                data={charts.schoolStats}
                labelKey="schoolName"
                valueKey="totalParticipants"
                colorClass="bg-purple-600"
                valueLabel="peserta"
                renderMeta={(school) => `${school.educationLevel} • ${school.city} • ${school.visitCount} kunjungan`}
              />
            </div>

            {/* TABEL REKAPITULASI (REQUIREMENT D) */}
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900">Tabel Rekapitulasi Kunjungan Edukasi</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data transaksional kunjungan sekolah, rincian peserta, paket, status pemesanan, dan pembayaran.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari sekolah, kode, kota..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Kode & Tanggal</th>
                      <th className="p-3.5">Nama Sekolah / Instansi</th>
                      <th className="p-3.5">Jenjang</th>
                      <th className="p-3.5 text-center">Peserta</th>
                      <th className="p-3.5">Paket Dipilih</th>
                      <th className="p-3.5">Kegiatan Dipilih</th>
                      <th className="p-3.5">Status Pemesanan</th>
                      <th className="p-3.5">Status Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rekapData && rekapData.length > 0 ? (
                      rekapData.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-blue-800 block">{row.bookingCode}</span>
                            <span className="text-[11px] text-slate-600">{row.visitDate}</span>
                            <span className="text-[10px] text-slate-400 block">{row.visitTimeSlot}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{row.schoolName}</span>
                            <span className="text-[11px] text-slate-500">{row.city}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">
                              {row.educationLevel}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-900">
                            {row.totalVisitors}
                            <span className="text-[10px] text-slate-400 block font-normal">
                              ({row.studentCount}s + {row.teacherCount}g)
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800 block">{row.packageName}</span>
                            <span className="text-[11px] text-amber-800 font-semibold">{formatIDR(row.totalEstimatedCost)}</span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {row.selectedActivities && row.selectedActivities.length > 0 ? (
                                row.selectedActivities.map((act) => (
                                  <span key={act} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 text-[10px] font-bold border border-blue-200">
                                    {act}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-[11px]">-</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-block ${
                              row.status === 'CONFIRMED' || row.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : row.status === 'APPROVED' || row.status === 'PAYMENT_SUBMITTED'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : row.status === 'REJECTED' || row.status === 'CANCELLED'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-block ${
                              row.paymentStatus === 'TERVERIFIKASI'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : row.paymentStatus === 'MENUNGGU_VERIFIKASI'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : row.paymentStatus === 'DITOLAK'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {row.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-slate-400">
                          Tidak ditemukan data rekapitulasi untuk kriteria pencarian ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-500">
                  Menampilkan {rekapData.length} dari total <strong>{pagination.totalItems}</strong> data
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={pagination.currentPage <= 1}
                    onClick={() => fetchRekap(pagination.currentPage - 1)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                  </button>
                  <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-900 rounded-xl">
                    Hal {pagination.currentPage} dari {pagination.totalPages || 1}
                  </span>
                  <button
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => fetchRekap(pagination.currentPage + 1)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 6. KOLOM TANDA TANGAN (PRINT ONLY) */}
        <div className="hidden print:block max-w-5xl mx-auto pt-10 text-xs text-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Unit Pengelola Bisnis (UPB)</p>
              <p>Politeknik Negeri Lampung</p>
            </div>
            <div className="text-right">
              <p>Bandar Lampung, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
              <p className="font-bold">Pimpinan Unit Pengelola Bisnis (UPB)</p>
              <div className="h-20"></div>
              <p className="font-black underline decoration-1 underline-offset-2">{user?.name || 'Pimpinan UPB Polinela'}</p>
              <p>NIP. 19780512 200312 1 002</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default PimpinanDashboard;
