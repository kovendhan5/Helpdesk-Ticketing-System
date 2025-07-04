import axios from 'axios';
import { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

const AdminDashboard = ({ user }) => {
  const { isConnected, on, joinRoom, leaveRoom } = useWebSocket();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [emailTest, setEmailTest] = useState({ loading: false, message: '', error: '', email: '' });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get('/tickets/admin/dashboard');
        setStats(response.data);
        setError('');
      } catch (error) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard stats error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user.role === 'admin') {
      fetchDashboardStats();
    }
  }, [user.role]);

  // WebSocket real-time updates for dashboard
  useEffect(() => {
    if (!isConnected || user.role !== 'admin') return;

    // Join admin room for dashboard updates
    joinRoom('admin');

    // Show notification helper
    const showNotification = (message) => {
      setNotification(message);
      setTimeout(() => setNotification(''), 3000);
    };

    // Update stats when tickets are created/updated
    const updateStatsFromTicketEvent = (data) => {
      if (!stats) return;

      setStats(prevStats => {
        const newStats = { ...prevStats };
        
        // Update based on the event type and ticket data
        if (data.ticket) {
          const ticket = data.ticket;
          
          // Update status counts
          if (newStats.statusCounts) {
            // This could be more sophisticated by tracking the previous state
            // For now, we'll just increment the new status count
            if (newStats.statusCounts[ticket.status] !== undefined) {
              newStats.statusCounts[ticket.status]++;
            }
          }
          
          // Update priority counts
          if (newStats.priorityCounts && ticket.priority) {
            if (newStats.priorityCounts[ticket.priority] !== undefined) {
              newStats.priorityCounts[ticket.priority]++;
            }
          }
          
          // Update category counts
          if (newStats.categoryCounts && ticket.category) {
            if (newStats.categoryCounts[ticket.category] !== undefined) {
              newStats.categoryCounts[ticket.category]++;
            } else {
              newStats.categoryCounts[ticket.category] = 1;
            }
          }
        }
        
        return newStats;
      });
    };

    // Listen for new tickets
    const unsubscribeTicketCreated = on('ticket:created', (data) => {
      console.log('📊 Dashboard: New ticket created:', data);
      showNotification(`📝 New ticket created: ${data.ticket.title}`);
      
      // Update total count
      if (stats) {
        setStats(prevStats => ({
          ...prevStats,
          totalTickets: prevStats.totalTickets + 1
        }));
      }
      
      updateStatsFromTicketEvent(data);
    });

    // Listen for ticket updates
    const unsubscribeTicketUpdated = on('ticket:updated', (data) => {
      console.log('📊 Dashboard: Ticket updated:', data);
      showNotification(`✏️ Ticket status changed: ${data.ticket.title} → ${data.ticket.status}`);
      
      // For status changes, we might want to refresh stats
      // This is a simplified approach - in production, you'd want more sophisticated tracking
      updateStatsFromTicketEvent(data);
    });

    // Listen for ticket comments
    const unsubscribeTicketCommented = on('ticket:commented', (data) => {
      console.log('📊 Dashboard: New comment:', data);
      showNotification(`💬 New comment on: ${data.ticket.title}`);
    });

    // Cleanup function
    return () => {
      unsubscribeTicketCreated();
      unsubscribeTicketUpdated();
      unsubscribeTicketCommented();
      leaveRoom('admin');
    };
  }, [isConnected, user.role, stats, on, joinRoom, leaveRoom]);

  const testEmailService = async () => {
    setEmailTest({ ...emailTest, loading: true, message: '', error: '' });
    
    try {
      const response = await axios.post('/tickets/admin/test-email', {
        testEmail: emailTest.email || user.email
      });
      
      setEmailTest({
        ...emailTest,
        loading: false,
        message: response.data.message,
        error: ''
      });
    } catch (error) {
      setEmailTest({
        ...emailTest,
        loading: false,
        message: '',
        error: error.response?.data?.error || 'Failed to test email service'
      });
    }
  };

  if (user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-6xl mb-4">🚫</div>
        <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const getStatusColor = (status, count) => {
    if (count === 0) return 'text-gray-500';
    switch (status) {
      case 'open': return 'text-blue-600';
      case 'in_progress': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      case 'unassigned': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority, count) => {
    if (count === 0) return 'text-gray-500';
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Real-time notification */}
      {notification && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800 font-medium">
                {notification}
              </p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {isConnected ? '🟢 Live' : '🔴 Offline'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of helpdesk tickets and system statistics
          {isConnected && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              🟢 Live Updates
            </span>
          )}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl text-blue-600 mr-4">📊</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.summary.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl text-blue-600 mr-4">🆕</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className={`text-2xl font-bold ${getStatusColor('open', stats.summary.open)}`}>
                {stats.summary.open}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl text-yellow-600 mr-4">⚡</div>
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className={`text-2xl font-bold ${getStatusColor('in_progress', stats.summary.in_progress)}`}>
                {stats.summary.in_progress}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl text-green-600 mr-4">✅</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className={`text-2xl font-bold ${getStatusColor('resolved', stats.summary.resolved)}`}>
                {stats.summary.resolved}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-3xl text-red-600 mr-4">👤</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Unassigned</p>
              <p className={`text-2xl font-bold ${getStatusColor('unassigned', stats.summary.unassigned)}`}>
                {stats.summary.unassigned}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Priority Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Breakdown (Active)</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">High Priority</span>
              </div>
              <span className={`text-lg font-bold ${getPriorityColor('high', stats.priority.high)}`}>
                {stats.priority.high}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Medium Priority</span>
              </div>
              <span className={`text-lg font-bold ${getPriorityColor('medium', stats.priority.medium)}`}>
                {stats.priority.medium}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Low Priority</span>
              </div>
              <span className={`text-lg font-bold ${getPriorityColor('low', stats.priority.low)}`}>
                {stats.priority.low}
              </span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tickets by Category</h3>
          <div className="space-y-3">
            {stats.categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {category.category.replace('_', ' ')}
                </span>
                <span className="text-lg font-bold text-gray-900">{category.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity (Last 7 Days)</h3>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">
                  {new Date(activity.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {activity.count} ticket{activity.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No ticket activity in the last 7 days</p>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.avgResolutionTime > 0 ? `${stats.avgResolutionTime.toFixed(1)}h` : 'N/A'}
            </div>
            <p className="text-sm text-gray-600">Avg Resolution Time</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.summary.total > 0 ? `${((stats.summary.resolved / stats.summary.total) * 100).toFixed(1)}%` : '0%'}
            </div>
            <p className="text-sm text-gray-600">Resolution Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.summary.total > 0 ? `${((stats.summary.unassigned / (stats.summary.total - stats.summary.resolved)) * 100).toFixed(1)}%` : '0%'}
            </div>
            <p className="text-sm text-gray-600">Unassigned Rate</p>
          </div>
        </div>
      </div>

      {/* Email Service Test */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Service Test</h3>
        <p className="text-sm text-gray-600 mb-4">
          Test the email notification service to ensure it's working correctly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            placeholder={`Test email (default: ${user.email})`}
            value={emailTest.email}
            onChange={(e) => setEmailTest({ ...emailTest, email: e.target.value })}
            className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            onClick={testEmailService}
            disabled={emailTest.loading}
            className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
          >
            {emailTest.loading ? 'Testing...' : 'Test Email'}
          </button>
        </div>
        
        {emailTest.message && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            ✅ {emailTest.message}
          </div>
        )}
        
        {emailTest.error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {emailTest.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
