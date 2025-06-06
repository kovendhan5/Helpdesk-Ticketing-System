import axios from 'axios';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Register from './components/Register';
import TicketDetail from './components/TicketDetail';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';

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

// AppContent component to use contexts
function AppContent() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
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
                {user.role === 'admin' && (
                  <a
                    href="/admin"
                    className="text-blue-600 hover:text-blue-500 font-medium text-sm"
                  >
                    Dashboard
                  </a>
                )}
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
            path="/tickets/:id"
            element={
              user ? <TicketDetail user={user} /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/create-ticket"
            element={
              user ? <TicketForm user={user} /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin"
            element={
              user && user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/tickets" replace />
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
  );
}

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <AppContent />
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
