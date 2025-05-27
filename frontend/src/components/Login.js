import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [accountLocked, setAccountLocked] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError(''); // Clear error when user types
    setRateLimitInfo(null); // Clear rate limit info when user types
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRateLimitInfo(null);
    setAccountLocked(false);

    try {
      const response = await axios.post('/auth/login', formData);
      const { token, user } = response.data;
      
      onLogin(user, token);
    } catch (error) {
      const errorData = error.response?.data;
      
      // Handle different types of security errors
      if (error.response?.status === 429) {
        // Rate limited
        setRateLimitInfo({
          remaining: error.response.headers['x-ratelimit-remaining'] || 0,
          resetTime: error.response.headers['x-ratelimit-reset'] || null,
          message: errorData?.error || 'Too many login attempts. Please try again later.'
        });
      } else if (errorData?.code === 'ACCOUNT_LOCKED') {
        setAccountLocked(true);
        setError(`Account temporarily locked due to too many failed attempts. Try again in ${errorData.lockoutDuration || '15 minutes'}.`);
      } else if (errorData?.code === 'INVALID_CREDENTIALS') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (errorData?.code === 'PASSWORD_EXPIRED') {
        setError('Your password has expired. Please reset your password.');
      } else {
        setError(errorData?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            🎫 Helpdesk Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account to manage tickets
          </p>
        </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`border px-4 py-3 rounded ${
              accountLocked 
                ? 'bg-red-100 border-red-400 text-red-700' 
                : 'bg-red-100 border-red-400 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {rateLimitInfo && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Rate Limited</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{rateLimitInfo.message}</p>
                    {rateLimitInfo.remaining !== undefined && (
                      <p className="mt-1">Attempts remaining: {rateLimitInfo.remaining}</p>
                    )}
                    {rateLimitInfo.resetTime && (
                      <p className="mt-1">Reset time: {new Date(rateLimitInfo.resetTime * 1000).toLocaleTimeString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
              <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Remember me for 30 days
              </label>
            </div>
          </div>          <div>
            <button
              type="submit"
              disabled={loading || rateLimitInfo}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign up here
              </Link>
            </p>
          </div>          {/* Demo accounts info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Accounts:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Admin:</strong> admin@example.com</p>
              <p><strong>User:</strong> user@example.com</p>
              <p className="text-red-600 font-medium mt-2">
                ⚠️ Passwords have been updated for security. Run the secure setup script to get new credentials.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
