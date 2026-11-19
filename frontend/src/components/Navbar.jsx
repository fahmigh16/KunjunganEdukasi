import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  X, 
  BarChart3, 
  ChevronRight, 
  LogOut, 
  LayoutDashboard, 
  CalendarPlus,
  ArrowLeftRight,
  UserCheck,
  Settings
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, isAdmin, logout, switchAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '/#beranda' },
    { name: 'Tentang Program', href: '/#tentang' },
    { name: 'Aktivitas', href: '/#aktivitas' },
    { name: 'Galeri', href: '/#galeri' },
    { name: 'Harga', href: '/#harga' },
    { name: 'FAQ', href: '/#faq' },
  ];

  const handleNavClick = (e, href) => {
    setIsOpen(false);
    if (href.startsWith('/#')) {
      const sectionId = href.replace('/', '');
      if (location.pathname === '/') {
        e.preventDefault();
        const targetElement = document.querySelector(sectionId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(href);
      }
    }
  };

  const handleBookingClick = () => {
    setIsOpen(false);
    if (!isAuthenticated) {
      navigate('/register');
    } else {
      navigate('/booking');
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  const handleSwitchRole = async (targetRole) => {
    setIsOpen(false);
    const res = await switchAccount(targetRole);
    if (res?.success) {
      if (targetRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  // Sembunyikan navbar utama pada Admin Panel, Dashboard Pimpinan, Login, dan Register agar tidak bertumpuk/menutupi konten
  if (
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/pimpinan') ||
    location.pathname === '/login' ||
    location.pathname === '/register'
  ) {
    return null;
  }

  return (
    <nav 
      className={`fixed top-0 w-full z-50 print:hidden transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-md py-2 sm:py-2.5' 
          : 'bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm py-2 sm:py-2.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 sm:gap-4 group">
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <img 
                src="/logo-upb.png" 
                alt="Logo UPB Polinela" 
                className="h-[38px] sm:h-[46px] w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <img 
                src="/logo-blu-speed.png" 
                alt="Logo BLU Speed" 
                className="h-[38px] sm:h-[46px] w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 leading-tight">
                Polinela <span className="text-blue-700">Edukasi</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-blue-600">
                Kunjungan Edukasi BLU
              </span>
            </div>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-100/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-white transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right User State / CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full text-xs font-bold shadow-md transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Panel Admin</span>
                  </Link>
                ) : null}

                {user?.role === 'pimpinan' ? (
                  <Link
                    to="/pimpinan"
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-full text-xs font-bold shadow-md transition-all"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard Pimpinan</span>
                  </Link>
                ) : null}

                {user?.role === 'user' ? (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-blue-900 border border-blue-200 rounded-full text-xs font-bold transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-700" />
                    <span>Dashboard Saya</span>
                  </Link>
                ) : null}

                <button
                  onClick={handleBookingClick}
                  className="px-5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 rounded-full shadow-md shadow-blue-600/30 hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Buat Booking</span>
                </button>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-700 transition-colors"
                >
                  Masuk
                </Link>
                
                <Link
                  to="/register"
                  className="px-4 py-2 bg-slate-100 text-blue-900 border border-blue-200 rounded-full text-xs font-bold hover:bg-slate-200 transition-all"
                >
                  Daftar
                </Link>

                <button
                  onClick={handleBookingClick}
                  className="group relative inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 rounded-full shadow-md shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  <span>Booking Sekarang</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none transition-colors border border-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="h-6 w-6 text-blue-700" /> : <Menu className="h-6 w-6 text-slate-800" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                onClick={(e) => handleNavClick(e, link.href)}
                className="block px-4 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-100 hover:text-blue-700 transition-colors"
              >
                {link.name}
              </a>
            ))}

            <div className="pt-4 border-t border-slate-100 space-y-2">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 bg-slate-100 border border-slate-300 text-slate-800 rounded-xl font-bold"
                    >
                      <Settings className="w-5 h-5" /> Panel Admin
                    </Link>
                  )}
                  {user?.role === 'pimpinan' && (
                    <Link 
                      to="/pimpinan" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl font-bold"
                    >
                      <BarChart3 className="w-5 h-5" /> Dashboard Pimpinan
                    </Link>
                  )}
                  {user?.role === 'user' && (
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl font-bold"
                    >
                      <LayoutDashboard className="w-5 h-5 text-blue-700" /> Dashboard Saya
                    </Link>
                  )}
                  <button 
                    onClick={() => { setIsOpen(false); handleBookingClick(); }}
                    className="flex items-center justify-center gap-2 w-full text-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-3.5 rounded-xl font-extrabold shadow-md"
                  >
                    <span>Buat Booking Baru</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-rose-600 w-full font-bold"
                  >
                    <LogOut className="w-5 h-5" /> Keluar (Logout)
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      to="/login" 
                      onClick={() => setIsOpen(false)}
                      className="text-center py-3 bg-slate-100 text-slate-800 rounded-xl font-bold text-sm"
                    >
                      Masuk
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setIsOpen(false)}
                      className="text-center py-3 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl font-bold text-sm"
                    >
                      Daftar
                    </Link>
                  </div>
                  <button 
                    onClick={handleBookingClick}
                    className="flex items-center justify-center gap-2 w-full text-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-3.5 rounded-xl font-extrabold shadow-md"
                  >
                    <span>Booking Sekarang</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
