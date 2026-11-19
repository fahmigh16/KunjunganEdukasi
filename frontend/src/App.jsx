import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import BookingWizard from './pages/BookingWizard';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import PimpinanDashboard from './pages/pimpinan/PimpinanDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/katalog" element={<Catalog />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected User Routes (Pengunjung Only) */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-bookings" 
                element={<Navigate to="/dashboard" replace />} 
              />
              <Route 
                path="/booking" 
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <BookingWizard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/booking/:bookingId/payment" 
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <PaymentPage />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Admin Routes (Admin Only) */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Pimpinan Routes (Pimpinan Only) */}
              <Route 
                path="/pimpinan/*" 
                element={
                  <ProtectedRoute allowedRoles={['pimpinan']}>
                    <PimpinanDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback Catch-All Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
