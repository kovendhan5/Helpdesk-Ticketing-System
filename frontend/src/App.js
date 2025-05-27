import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import Login from './components/Login';
import Register from './components/Register';

// Configure axios defaults
axios.defaults.baseURL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

// Add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        {user && (
          <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    🎫 Helpdesk Ticketing System
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {user.email} 
                    {user.role === 'admin' && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Admin
                      </span>
                    )}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                user ? <Navigate to="/tickets" replace /> : <Login onLogin={login} />
              }
            />
            <Route
              path="/register"
              element={
                user ? <Navigate to="/tickets" replace /> : <Register />
              }
            />

            {/* Protected routes */}
            <Route
              path="/tickets"
              element={
                user ? <TicketList user={user} /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/create-ticket"
              element={
                user ? <TicketForm user={user} /> : <Navigate to="/login" replace />
              }
            />

            {/* Default redirect */}
            <Route
              path="/"
              element={
                user ? <Navigate to="/tickets" replace /> : <Navigate to="/login" replace />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
