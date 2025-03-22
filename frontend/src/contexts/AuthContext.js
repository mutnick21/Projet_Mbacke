import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
       const token = localStorage.getItem('token');
       console.log('Checking auth, token exists:', !!token);
      
       if (!token) {
         setLoading(false);
         return;
       }

       // Configure axios avec le token
       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

       const response = await axios.get('http://localhost:4500/api/auth/me');
       console.log('Auth check response:', response.data);
      
      setUser(response.data.data.user);
      setError(null);
    } catch (error) {
      console.error('Auth check error:', error.response || error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setError('Session expirée');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for email:', email);
      const response = await axios.post('http://localhost:4500/api/auth/login', { 
        email, 
        password 
      });
      console.log('Login response:', response.data.data.user);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(response.data.data.user);
      setError(null);
      
      // Configure axios pour inclure le token dans toutes les requêtes futures
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (error) {
      console.error('Login error:', error.response || error);
      const message = error.response?.data?.message || 'Erreur lors de la connexion';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:4500/api/auth/register', userData);
      const { token, user: newUser } = response.data;
      
      localStorage.setItem('token', token);
      setUser(response.data.data.user);
      setError(null);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return newUser;
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'inscription';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('http://localhost:4500/api/auth/forgot-password', { email });
      setError(null);
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'envoi du mail de réinitialisation';
      setError(message);
      throw new Error(message);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await axios.post('http://localhost:4500/api/auth/reset-password', { 
        token, 
        password: newPassword 
      });
      setError(null);
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe';
      setError(message);
      throw new Error(message);
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('http://localhost:4500/api/auth/profile', userData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      setError(message);
      throw new Error(message);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export default AuthContext;
