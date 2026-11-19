import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket } from 'lucide-react';

const ProtectedRoute = ({ children, requireAdmin = false, allowedRoles = null }) => {
  const { user, loading, isAuthenticated, isAdmin, isPimpinan } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800">
        <div className="relative flex items-center justify-center mb-3">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-700"></div>
          <Rocket className="absolute h-5 w-5 text-blue-600 animate-pulse" />
        </div>
        <p className="text-xs font-bold text-slate-600 animate-pulse">Memverifikasi Sesi...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check specific allowed roles if specified
  if (allowedRoles && Array.isArray(allowedRoles)) {
    if (!allowedRoles.includes(user?.role)) {
      if (user?.role === 'pimpinan') {
        return <Navigate to="/pimpinan" replace />;
      }
      if (user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Backwards compatibility for requireAdmin
  if (requireAdmin && !isAdmin) {
    if (user?.role === 'pimpinan') {
      return <Navigate to="/pimpinan" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
