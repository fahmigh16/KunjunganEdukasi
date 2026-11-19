import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('polinela_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('polinela_token') || '');
  const [loading, setLoading] = useState(true);

  // Set default axios header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('http://localhost:5000/api/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('polinela_user', JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.warn('Auth token expired or invalid:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token: authToken, user: userData } = response.data;

      setToken(authToken);
      setUser(userData);
      localStorage.setItem('polinela_token', authToken);
      localStorage.setItem('polinela_user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.' 
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      const { token: authToken, user: userData } = response.data;

      setToken(authToken);
      setUser(userData);
      localStorage.setItem('polinela_token', authToken);
      localStorage.setItem('polinela_user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.' 
      };
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('polinela_token');
    localStorage.removeItem('polinela_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (data) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', data);
      if (response.data && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('polinela_user', JSON.stringify(response.data.user));
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Gagal mengupdate profil.' };
    }
  };

  const switchAccount = async (targetRole) => {
    let email = '';
    let password = '';

    if (targetRole === 'admin') {
      email = 'admin@polinela.ac.id';
      password = 'admin123';
    } else if (targetRole === 'pimpinan') {
      email = 'pimpinan@polinela.ac.id';
      password = 'pimpinan123';
    } else {
      email = 'user@gmail.com';
      password = 'user123';
    }

    return await login(email, password);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout, 
      updateProfile,
      switchAccount, 
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isPimpinan: user?.role === 'pimpinan'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
