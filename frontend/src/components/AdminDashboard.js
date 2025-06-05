import axios from 'axios';
import { useEffect, useState } from 'react';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of helpdesk tickets and system statistics
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
      <div className="bg-white rounded-lg shadow p-6">
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
    </div>
  );
};

export default AdminDashboard;
