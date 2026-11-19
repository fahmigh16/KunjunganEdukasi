import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Building, 

  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  FileText, 
  ShieldCheck,
  Info,
  Clock
} from 'lucide-react';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Payment Form Fields
  const [senderName, setSenderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bRes = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`);
        setBooking(bRes.data);
        setSenderName(bRes.data.visitorName || '');
        setAmount(bRes.data.totalEstimatedCost || '');

        const pRes = await axios.get('http://localhost:5000/api/payments/settings');
        setPaymentSettings(pRes.data);
        if (pRes.data && pRes.data.length > 0) {
          setBankName(pRes.data[0].bankName);
        }
      } catch (err) {
        setErrorMsg('Gagal mengambil data booking atau pembayaran.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  // File Upload Preview & Validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal adalah 5MB.');
      return;
    }

    // Validate extension
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Format file harus berupa JPG, PNG, atau PDF.');
      return;
    }

    setErrorMsg('');
    setProofFile(file);

    // FileReader preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProofPreview(''); // PDF or non-image
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!proofPreview && !proofFile) {
      setErrorMsg('Mohon pilih file bukti pembayaran.');
      return;
    }

    setUploading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/payments/upload', {
        bookingId: booking.id,
        amount: parseFloat(amount),
        paymentDate,
        senderName,
        bankName,
        proofUrl: proofPreview || 'file_uploaded'
      });

      setSuccessMsg('Bukti pembayaran berhasil dikirim dan sedang diperiksa oleh admin.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengirim bukti pembayaran.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-700"></div>
      </div>
    );
  }

  // Security Check: Payment is locked if NOT APPROVED
  if (booking && booking.status === 'PENDING_REVIEW') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pt-32 pb-20 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md text-center shadow-xl">
          <Clock className="w-16 h-16 text-blue-700 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Booking Belum Disetujui</h2>
          <p className="text-slate-600 text-sm mb-6 font-normal leading-relaxed">
            Permintaan booking <strong className="text-blue-700">#{booking.bookingCode}</strong> masih dalam peninjauan admin. Pembayaran baru dapat dilakukan setelah booking disetujui.
          </p>
          <Link
            to="/dashboard"
            className="w-full block py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-2xl shadow-md transition-all text-sm"
          >
            Kembali ke Dashboard Saya
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 pb-20 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 text-xs font-bold mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100 border border-blue-200 px-4 py-1.5 rounded-full">
            PEMBAYARAN BOOKING
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">
            Instruksi & Upload Bukti Pembayaran
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Kode Booking: <span className="font-mono font-extrabold text-blue-700">{booking?.bookingCode}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Admin Payment Options Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-700" />
                Pilih Opsi Pembayaran
              </h3>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 mb-5">
                <span className="text-[11px] uppercase font-bold text-blue-800 block mb-1">TOTAL TAGIHAN LUNAS:</span>
                <span className="text-3xl font-black text-blue-700">
                  Rp {Number(booking?.totalEstimatedCost || 0).toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-slate-600 block mt-1">({booking?.studentCount} Siswa × Rp 35.000)</span>
              </div>

              {/* Payment Method Tabs */}
              <div className="flex flex-wrap gap-2 mb-5">
                {paymentSettings.map((setting) => (
                  <button
                    key={setting.id}
                    type="button"
                    onClick={() => { setBankName(setting.bankName); }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border text-center flex items-center gap-2 ${
                      bankName === setting.bankName
                        ? 'bg-blue-700 border-blue-700 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>{setting.bankName}</span>
                  </button>
                ))}
                <button
                  type="button"
                  disabled
                  className="py-2.5 px-4 rounded-xl text-xs font-bold transition-all border text-center flex items-center gap-2 bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                  title="E-Wallet Belum Aktif"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>E-Wallet (Segera Hadir)</span>
                </button>
              </div>

              {/* Details based on selected payment method */}
              {(() => {
                const setting = paymentSettings.find(s => s.bankName === bankName) || paymentSettings[0];
                if (!setting) return null;
                
                return (
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">NAMA BANK:</span>
                      <span className="font-extrabold text-slate-900 text-base">{setting.bankName}</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">NOMOR REKENING:</span>
                      <span className="font-mono font-extrabold text-blue-700 text-lg">{setting.accountNumber}</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">PEMILIK REKENING:</span>
                      <span className="font-bold text-slate-900">{setting.accountName}</span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600 font-normal leading-relaxed">
                      {setting.instructions || 'Transfer sesuai total nominal ke rekening/e-wallet resmi di atas, lalu unggah buktinya di sebelah kanan.'}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Right Column: Upload Proof Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-700" />
                Upload Bukti Pembayaran
              </h3>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Pengirim / Pemilik Rekening *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama pengirim transfer"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nominal Transfer (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tanggal Transfer *
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-4 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* File Upload & Preview */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    File Bukti Pembayaran (JPG, PNG, PDF max 5MB) *
                  </label>
                  
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer bg-slate-50 p-2 rounded-2xl border border-slate-300"
                  />

                  {/* Image Preview */}
                  {proofPreview && (
                    <div className="mt-4 p-2 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <p className="text-xs text-slate-600 mb-2 font-bold">Preview Bukti Transfer:</p>
                      <img src={proofPreview} alt="Preview Bukti" className="max-h-56 mx-auto rounded-xl object-contain border border-slate-200" />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-2xl text-base shadow-md shadow-blue-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Kirim Bukti Pembayaran</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PaymentPage;
