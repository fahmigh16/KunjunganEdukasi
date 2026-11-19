import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Sprout, 
  Fish, 
  ChefHat, 
  Sparkles, 
  Clock, 
  Users, 
  Rocket, 
  Search, 
  BookOpen,
  ChevronRight
} from 'lucide-react';

const FALLBACK_PACKAGES = [
  {
    id: 1,
    name: 'Panen Sayur',
    slug: 'panen-sayur',
    category: 'Pertanian',
    shortDescription: 'Kegiatan memanen sayuran segar seperti kangkung, bayam, atau selada langsung dari kebun Polinela.',
    duration: '90 Menit',
    price: 35000,
    minParticipants: 10,
  },
  {
    id: 3,
    name: 'Menangkap Ikan',
    slug: 'menangkap-ikan',
    category: 'Perikanan',
    shortDescription: 'Belajar dan merasakan keseruan menangkap ikan di kolam budidaya menggunakan jaring.',
    duration: '90 Menit',
    price: 35000,
    minParticipants: 10,
  },
  {
    id: 4,
    name: 'Pembuatan Roti',
    slug: 'pembuatan-roti',
    category: 'Keterampilan',
    shortDescription: 'Workshop singkat pembuatan roti di laboratorium pengolahan pangan, dari adonan hingga matang.',
    duration: '120 Menit',
    price: 50000,
    minParticipants: 10,
  }
];

const Catalog = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/packages');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setPackages(response.data);
        } else {
          setPackages(FALLBACK_PACKAGES);
        }
      } catch (error) {
        console.warn('API connection failed, loading fallback data:', error);
        setPackages(FALLBACK_PACKAGES);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const getCategoryIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('tani') || cat.includes('kebun') || cat.includes('sayur')) {
      return <Sprout className="w-16 h-16 text-emerald-600" />;
    }
    if (cat.includes('ikan') || cat.includes('air') || cat.includes('perikanan')) {
      return <Fish className="w-16 h-16 text-blue-600" />;
    }
    if (cat.includes('roti') || cat.includes('masak') || cat.includes('keterampilan') || cat.includes('pangan')) {
      return <ChefHat className="w-16 h-16 text-amber-600" />;
    }
    return <Sparkles className="w-16 h-16 text-blue-700" />;
  };

  const categories = ['Semua', ...new Set(packages.map((pkg) => pkg.category).filter(Boolean))];

  const filteredPackages = packages.filter((pkg) => {
    const matchesCategory = selectedCategory === 'Semua' || pkg.category === selectedCategory;
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pkg.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-700"></div>
          <Rocket className="absolute h-6 w-6 text-blue-600 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-28 pb-20 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-900 font-extrabold text-sm mb-6">
            <BookOpen className="h-4 w-4 text-blue-700" />
            <span>Kunjungan Edukasi Interaktif</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-slate-900">
            Katalog Paket <span className="text-blue-700">Edukasi</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Pilih paket kegiatan edukasi terbaik yang dirancang khusus untuk pengalaman belajar interaktif anak-anak dan pelajar.
          </p>
        </motion.div>

        {/* Filter and Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 bg-white p-4 rounded-2xl border border-slate-200 shadow-lg"
        >
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari paket edukasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </motion.div>

        {/* Package Grid */}
        {filteredPackages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-900">Tidak ada paket ditemukan</h3>
            <p className="text-slate-500 text-sm mt-1 font-normal">Coba gunakan kata kunci atau kategori yang lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-xl hover:border-blue-400 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Visual Header Banner */}
                <div className="h-52 bg-slate-100 relative flex items-center justify-center border-b border-slate-200 overflow-hidden">
                  <div className="relative z-10 p-4 transform group-hover:scale-110 transition-transform duration-300">
                    {getCategoryIcon(pkg.category)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-grow flex flex-col">
                  {/* Category Pill */}
                  <div className="inline-block px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 border border-blue-200 rounded-full w-fit mb-3">
                    {pkg.category || 'Edukasi'}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {pkg.name}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow font-normal">
                    {pkg.shortDescription}
                  </p>
                  
                  {/* Meta Stats Badges */}
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Clock className="w-4 h-4 text-blue-700" />
                      <span>{pkg.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Users className="w-4 h-4 text-blue-700" />
                      <span>Min. {pkg.minParticipants} orang</span>
                    </div>
                  </div>

                  {/* Card Footer (Price & Action Button) */}
                  <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block font-normal">Harga / Orang</span>
                      <span className="text-xl font-black text-blue-700">
                        Rp {pkg.price ? Number(pkg.price).toLocaleString('id-ID') : '0'}
                      </span>
                    </div>

                    <Link 
                      to="/booking" 
                      className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-2xl shadow-md shadow-blue-600/30 hover:scale-105 transition-all duration-300 flex items-center justify-center group/btn"
                    >
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
