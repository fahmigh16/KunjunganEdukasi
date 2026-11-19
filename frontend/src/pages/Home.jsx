import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sprout, 
  Wheat, 
  Apple, 
  Fish, 
  ChefHat, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Users, 
  PhoneCall, 
  MapPin, 
  Calendar, 
  HelpCircle, 
  ChevronDown, 
  Award, 
  BookOpen, 
  Rocket, 
  Sun, 
  Compass, 
  Package, 
  HeartHandshake
} from 'lucide-react';

const Home = () => {
  const [activeTab, setActiveTab] = useState('Semua');
  const [openFaq, setOpenFaq] = useState(null);

  // 14 Activities strictly from the poster grouped in 4 Categories
  const activities = [
    // PERTANIAN
    {
      name: 'Menanam Sayur',
      category: 'Pertanian',
      desc: 'Belajar cara menanam bibit sayuran segar di lahan pertanian terbuka.',
      icon: <Sprout className="w-7 h-7 text-emerald-600" />,
      badge: 'Pertanian'
    },
    {
      name: 'Panen Sayur',
      category: 'Pertanian',
      desc: 'Memanen hasil tanaman sayuran segar secara langsung dari kebun Polinela.',
      icon: <Sprout className="w-7 h-7 text-green-600" />,
      badge: 'Pertanian'
    },
    {
      name: 'Menyemai Tanaman Hias',
      category: 'Pertanian',
      desc: 'Mengenal proses menyemai benih tanaman hias unggul hingga siap tanam.',
      icon: <Sun className="w-7 h-7 text-blue-600" />,
      badge: 'Pertanian'
    },
    // PANGAN & KREATIVITAS
    {
      name: 'Membuat Roti',
      category: 'Pangan & Kreativitas',
      desc: 'Praktik langsung membuat adonan roti di laboratorium pengolahan pangan.',
      icon: <ChefHat className="w-7 h-7 text-rose-600" />,
      badge: 'Pengolahan Pangan'
    },
    {
      name: 'Membuat Produk Olahan',
      category: 'Pangan & Kreativitas',
      desc: 'Edukasi dan pembuatan produk olahan pangan yang sehat dan bergizi.',
      icon: <Apple className="w-7 h-7 text-indigo-600" />,
      badge: 'Pengolahan Pangan'
    },
    {
      name: 'Membuat Minuman Kopi',
      category: 'Pangan & Kreativitas',
      desc: 'Mengenal pengolahan biji kopi dan menyajikan minuman kopi khas.',
      icon: <Sparkles className="w-7 h-7 text-amber-700" />,
      badge: 'Pengolahan Pangan'
    },
    {
      name: 'Membuat Sabun',
      category: 'Pangan & Kreativitas',
      desc: 'Praktik membuat sabun ramah lingkungan dari bahan olahan alami.',
      icon: <Sparkles className="w-7 h-7 text-cyan-600" />,
      badge: 'Kreativitas Alami'
    },
    // PERKEBUNAN & HIDROPONIK
    {
      name: 'Mengemas Sayuran',
      category: 'Perkebunan & Hidroponik',
      desc: 'Mempelajari proses penanganan pascapanen, sortir, dan pengemasan standar industri.',
      icon: <Package className="w-7 h-7 text-slate-700" />,
      badge: 'Pasca Panen'
    },
    {
      name: 'Panen Sayur Hidroponik',
      category: 'Perkebunan & Hidroponik',
      desc: 'Mengenal teknologi bercocok tanam modern tanpa tanah dan memanen hasilnya.',
      icon: <Sprout className="w-7 h-7 text-blue-600" />,
      badge: 'Hidroponik'
    },
    {
      name: 'Edukasi Tanaman Perkebunan',
      category: 'Perkebunan & Hidroponik',
      desc: 'Eksplorasi kebun edukasi dan mempelajari berbagai jenis komoditas perkebunan.',
      icon: <Compass className="w-7 h-7 text-teal-600" />,
      badge: 'Perkebunan'
    },
    // HEWAN & PERAIRAN
    {
      name: 'Menangkap Ikan',
      category: 'Hewan & Perairan',
      desc: 'Sensasi seru belajar menangkap ikan di kolam budidaya perikanan.',
      icon: <Fish className="w-7 h-7 text-blue-600" />,
      badge: 'Perikanan'
    },
    {
      name: 'Memberi Makan Hewan',
      category: 'Hewan & Perairan',
      desc: 'Interaksi langsung memberi pakan hewan ternak dan mengenal cara perawatannya.',
      icon: <HeartHandshake className="w-7 h-7 text-amber-600" />,
      badge: 'Peternakan'
    },
    {
      name: 'Panen Telur Ayam',
      category: 'Hewan & Perairan',
      desc: 'Belajar tentang ayam petelur dan merasakan pengalaman panen telur langsung.',
      icon: <Apple className="w-7 h-7 text-amber-600" />,
      badge: 'Peternakan'
    }
  ];

  const categories = ['Semua', 'Pertanian', 'Pangan & Kreativitas', 'Perkebunan & Hidroponik', 'Hewan & Perairan'];

  const filteredActivities = activeTab === 'Semua' 
    ? activities 
    : activities.filter(a => a.category === activeTab);

  // FAQs strictly derived from the poster content
  const faqs = [
    {
      q: "Berapa biaya Paket Kunjungan Edukasi Polinela?",
      a: "Hanya Rp 35.000 / anak. Biaya ini sudah mencakup kunjungan pilihan aktivitas edukasi di Politeknik Negeri Lampung."
    },
    {
      q: "Berapa aktivitas yang bisa dipilih dalam 1 paket?",
      a: "Pengunjung bebas memilih 1 atau lebih aktivitas sesuai keinginan dari total 14 aktivitas edukatif yang tersedia."
    },
    {
      q: "Aktivitas apa saja yang tersedia?",
      a: "Terdapat 13 aktivitas seru: Menanam Sayur, Panen Sayur, Panen Sayur Hidroponik, Menyemai Tanaman Hias, Membuat Roti, Mengemas Sayuran, Menangkap Ikan, Membuat Produk Olahan, Membuat Sabun, Membuat Minuman Kopi, Edukasi Tanaman Perkebunan, Memberi Makan Hewan, dan Panen Telur Ayam."
    },
    {
      q: "Bagaimana cara melakukan reservasi atau booking?",
      a: "Booking dan informasi resmi dapat dilakukan melalui web ini atau via Unit Pengelola Bisnis Polinela WhatsApp 0852-6732-6913."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: HERO SECTION (Light Professional White & Blue) */}
      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: HERO SECTION WITH VIDEO BACKGROUND & OVERLAY */}
      {/* ------------------------------------------------------------- */}
      <section id="beranda" className="relative min-h-screen flex flex-col justify-center pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 overflow-hidden bg-slate-950 border-b border-slate-800">
        
        {/* Full-width Video Background (HD & Jelas) */}
        <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden pointer-events-none">
          <video
            src="/vidio-bg.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-center"
            ref={(el) => { if (el) el.muted = true; }}
          />
          {/* Subtle Transparent Tint to let the HD video show vividly and clearly */}
          <div className="absolute inset-0 bg-slate-950/35"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto py-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 text-center lg:text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/40 border border-blue-400/50 backdrop-blur-md text-blue-100 font-extrabold text-xs mb-4 shadow-lg">
                <Rocket className="h-3.5 w-3.5 text-cyan-300" />
                <span>PAKET KUNJUNGAN EDUKASI POLINELA</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] mb-3.5 text-white drop-shadow-md">
                Explore, Learn <br className="hidden sm:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-300">
                  & Grow!
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-200 mb-5 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed drop-shadow">
                Pengalaman belajar langsung melalui aktivitas pertanian, perkebunan, pangan, dan lingkungan di Politeknik Negeri Lampung.
              </p>

              {/* Price Highlight Banner */}
              <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-2xl max-w-md mx-auto lg:mx-0 flex items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                    Harga Paket Kunjungan
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-cyan-400">35K</span>
                    <span className="text-xs font-semibold text-slate-300">/ anak</span>
                  </div>
                </div>
                <div className="px-3.5 py-1.5 bg-blue-600/40 border border-blue-400/50 rounded-xl text-cyan-200 text-xs font-extrabold text-center">
                  Bebas Pilih Aktivitas
                </div>
              </div>

              {/* CTAs (Berjarak Rapi & Tidak Mepet) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5">
                <a 
                  href="/booking"
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-full font-extrabold text-sm sm:text-base shadow-xl shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Booking Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a 
                  href="#aktivitas" 
                  className="w-full sm:w-auto px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white border border-white/40 backdrop-blur-md rounded-full font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center shadow-lg cursor-pointer"
                >
                  Lihat Aktivitas
                </a>
              </div>
            </motion.div>

            {/* Right Visual Collage */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                
                {/* Main Hero Photo (Poster Crop) */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl bg-slate-900 group">
                  <img 
                    src="/assets/poster_full.jpg" 
                    alt="Poster Kunjungan Edukasi Polinela" 
                    className="w-full h-[320px] sm:h-[380px] object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  
                  {/* Photo Tag Overlay */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 flex items-center justify-between shadow-xl">
                    <div>
                      <p className="font-extrabold text-white text-xs sm:text-sm">Siswa Kunjungan Edukasi</p>
                      <p className="text-[11px] text-cyan-400 font-bold">Politeknik Negeri Lampung</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>

                {/* Floating Price Tag Badge */}
                <motion.div 
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-4 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl border border-blue-400/50 backdrop-blur-md flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-lg">
                    35K
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-100">HANYA 35K</p>
                    <p className="text-[11px] text-cyan-200">Bebas Pilihan Aktivitas</p>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: TRUST / BRANDING BAR */}
      {/* ------------------------------------------------------------- */}
      <section className="py-8 bg-white border-b border-slate-200 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3 text-center md:text-left">
              <Award className="w-6 h-6 text-blue-700 shrink-0" />
              <p className="text-sm sm:text-base font-bold text-slate-800 tracking-wide">
                Program Edukasi Berbasis Pengalaman Langsung di Polinela
              </p>
            </div>

            {/* Official Logos */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-2">
                <span className="font-extrabold text-xs tracking-wider text-blue-900">POLITEKNIK NEGERI LAMPUNG</span>
              </div>
              <div className="px-3 py-1.5 bg-sky-50 rounded-lg border border-sky-200 text-xs font-black text-sky-800">
                BLU Speed
              </div>
              <div className="px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-200 text-xs font-black text-rose-700">
                Kampus Merdeka
              </div>
              <div className="px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-xs font-black text-amber-800">
                VOKASI
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: TENTANG PROGRAM */}
      {/* ------------------------------------------------------------- */}
      <section id="tentang" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full">
              TENTANG PROGRAM
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 mb-6">
              Belajar Tidak Harus di Dalam Kelas
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              Melalui Paket Kunjungan Edukasi Polinela, peserta diajak belajar langsung melalui berbagai aktivitas yang menyenangkan dan edukatif.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-6 text-blue-700 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Learn by Doing</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Belajar melalui pengalaman langsung secara interaktif dan aplikatif.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6 text-emerald-700 group-hover:scale-110 transition-transform">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Explore</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Mengenal dunia lingkungan, pertanian, pangan, dan perkebunan.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mb-6 text-cyan-700 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fun Activity</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Aktivitas seru yang menyenangkan untuk menumbuhkan minat belajar peserta.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-6 text-amber-700 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Real Experience</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Merasakan langsung proses dari menanam, mengolah, hingga panen.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: AKTIVITAS / EXPERIENCE */}
      {/* ------------------------------------------------------------- */}
      <section id="aktivitas" className="py-24 bg-white relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full">
              14 AKTIVITAS EDUKATIF
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 mb-4">
              Ada Apa Saja di Dalam Paket?
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Setiap paket kunjungan seharga <span className="text-blue-700 font-extrabold">35K / anak</span> bebas memilih aktivitas dari 13 pilihan di bawah ini:
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  activeTab === cat 
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-600/30 scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of Activities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                      {act.icon}
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 border border-blue-200 px-3 py-1 rounded-full">
                      {act.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {act.name}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed font-light mb-6">
                    {act.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-bold text-blue-700">
                    <CheckCircle2 className="w-4 h-4" /> Termasuk Pilihan Paket
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 6: PHOTO GALLERY */}
      {/* ------------------------------------------------------------- */}
      <section id="galeri" className="py-24 bg-slate-50 relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full">
              DOKUMENTASI FOTO
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 mb-4">
              Galeri Kunjungan Edukasi
            </h2>
            <p className="text-slate-600 text-base">
              Momen keceriaan dan pengalaman belajar anak-anak di fasilitas Polinela.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white h-64">
              <img src="/assets/galeri1.jpeg" alt="Aktivitas Lapangan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-blue-200">Kegiatan Outdoor</span>
                <p className="text-sm font-bold">Eksplorasi Lapangan Bersama</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white h-64">
              <img src="/assets/membuat roti.jpeg" alt="Membuat Roti" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-rose-200">Pangan & Olahan</span>
                <p className="text-sm font-bold">Membuat Roti</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white h-64">
              <img src="/assets/memanen sayur pakcoy.jpeg" alt="Sayur Hidroponik" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-emerald-200">Teknologi Pertanian</span>
                <p className="text-sm font-bold">Panen Sayur Hidroponik</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white h-64">
              <img src="/assets/menangkap ikan di kolam.jpeg" alt="Tangkap Ikan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-cyan-200">Perikanan</span>
                <p className="text-sm font-bold">Menangkap Ikan</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white h-64">
              <img src="/assets/membuat sabun.jpeg" alt="Membuat Sabun" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-amber-200">Kreativitas</span>
                <p className="text-sm font-bold">Membuat Sabun</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white h-64">
              <img src="/assets/galeri2.jpeg" alt="Kelompok Siswa" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-blue-200">Kebersamaan</span>
                <p className="text-sm font-bold">Siswa Kunjungan Polinela</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white h-64">
              <img src="/assets/panen sayur.jpeg" alt="Panen Sayur" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-green-200">Pertanian</span>
                <p className="text-sm font-bold">Panen Sayur</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white h-64">
              <img src="/assets/galeri3.jpeg" alt="Galeri 3" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-purple-200">Edukasi</span>
                <p className="text-sm font-bold">Pembelajaran Lapangan</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white h-64">
              <img src="/assets/menangkap ikan.jpeg" alt="Menangkap Ikan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-blue-200">Aktivitas Air</span>
                <p className="text-sm font-bold">Menangkap Ikan di Kolam</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white h-64">
              <img src="/assets/outdoor_students.jpg" alt="Outdoor Students" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-teal-200">Kunjungan</span>
                <p className="text-sm font-bold">Keceriaan Siswa</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white h-64">
              <img src="/assets/greenhouse_melon.jpg" alt="Greenhouse Melon" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-green-200">Pertanian</span>
                <p className="text-sm font-bold">Greenhouse Melon</p>
              </div>
            </div>

            <div className="group relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white h-64">
              <img src="/assets/koi_fish.jpg" alt="Koi Fish" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-orange-200">Perikanan</span>
                <p className="text-sm font-bold">Ikan Koi</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 7: HARGA / PAKET */}
      {/* ------------------------------------------------------------- */}
      <section id="harga" className="py-24 bg-white relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full">
              HARGA TRANSPARAN
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 mb-4">
              Paket Kunjungan Edukasi
            </h2>
            <p className="text-slate-600 text-base">
              Satu harga hemat untuk pengalaman belajar tak terlupakan.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border-2 border-blue-600 shadow-xl relative overflow-hidden">
              
              {/* Top Banner Tag */}
              <div className="absolute top-0 right-0 bg-blue-700 text-white font-extrabold text-xs px-6 py-2 rounded-bl-2xl shadow-md uppercase tracking-wider">
                PAKET PILIHAN
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2">PAKET KUNJUNGAN</h3>
              <p className="text-slate-600 text-sm mb-6 font-semibold">Politeknik Negeri Lampung</p>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl sm:text-6xl font-black text-blue-700">35K</span>
                <span className="text-xl font-bold text-slate-700">/ anak</span>
              </div>
              
              <div className="inline-block px-3.5 py-1.5 bg-blue-100 border border-blue-200 rounded-xl text-blue-900 text-xs sm:text-sm font-extrabold mb-8">
                Bebas Pilihan Aktivitas
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
                  <span>Bebas memilih aktivitas dari 14 pilihan edukatif</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
                  <span>Pengalaman belajar & praktik langsung di lapangan/lab</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
                  <span>Didampingi oleh pembimbing profesional dari Polinela</span>
                </div>
              </div>

              <a 
                href="/booking"
                className="w-full block text-center py-4 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-2xl text-base shadow-md shadow-blue-600/30 hover:scale-[1.02] transition-all"
              >
                Booking Sekarang
              </a>

            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 8: FAQ SECTION */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700 bg-blue-100 border border-blue-200 px-4 py-1.5 rounded-full">
              PERTANYAAN POPULER
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-blue-700 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer className="py-12 bg-slate-900 text-slate-300 border-t border-slate-800 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="text-center md:text-left">
              <p className="font-extrabold text-white text-base mb-1">Paket Kunjungan Edukasi Polinela</p>
              <p className="text-slate-400 font-normal">Unit Pengelola Bisnis Badan Layanan Umum</p>
              <p className="text-slate-400 font-normal mb-2">Politeknik Negeri Lampung</p>
              <p className="text-slate-500 text-xs">
                Jl. Soekarno Hatta No. 10,<br/>
                Rajabasa Raya,<br/>
                Bandar Lampung 35141
              </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6">
              <a href="#beranda" className="hover:text-white transition-colors">Beranda</a>
              <a href="#tentang" className="hover:text-white transition-colors">Tentang</a>
              <a href="#aktivitas" className="hover:text-white transition-colors">Aktivitas</a>
              <a href="#harga" className="hover:text-white transition-colors">Harga</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>

            <div className="text-center md:text-right">
              <p className="text-slate-400">
                © {new Date().getFullYear()} Unit Pengelola Bisnis Polinela. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
