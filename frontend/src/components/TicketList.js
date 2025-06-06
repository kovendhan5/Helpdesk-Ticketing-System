import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TicketList = ({ user }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    userEmail: '',
    status: '',
    priority: '',
    category: '',
    search: '',
    page: 1,
    limit: 10
  });  const [categories, setCategories] = useState([]);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('/tickets/meta/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  // Fetch tickets from API
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (user.role === 'admin') {
        if (filters.userEmail) params.append('user_email', filters.userEmail);
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.category) params.append('category', filters.category);
      }
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await axios.get(`/tickets?${params}`);
      setTickets(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch tickets. Please try again.');
      console.error('Fetch tickets error:', error);
    } finally {
      setLoading(false);    }
  }, [user.role, filters]);

  // Load initial data
  useEffect(() => {
    fetchTickets();
    fetchCategories();
  }, [fetchTickets, fetchCategories]);

  // Update ticket status (admin only)
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await axios.patch(`/tickets/${ticketId}`, { status: newStatus });
      // Refresh tickets after update
      fetchTickets();
    } catch (error) {
      setError('Failed to update ticket status. Please try again.');
      console.error('Update ticket error:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1 // Reset to first page when filtering
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      userEmail: '',
      status: '',
      priority: '',
      category: '',
      search: '',
      page: 1,
      limit: 10
    });
  };

  // Helper functions for styling
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'technical':
        return 'bg-red-100 text-red-800';
      case 'billing':
        return 'bg-green-100 text-green-800';
      case 'account':
        return 'bg-purple-100 text-purple-800';
      case 'feature_request':
        return 'bg-blue-100 text-blue-800';
      case 'bug_report':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryDisplayName = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.description || categoryName.replace('_', ' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user.role === 'admin' ? 'All Tickets' : 'My Tickets'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} found
          </p>
        </div>
        <div className="flex space-x-3">
          {user.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              📊 Dashboard
            </button>
          )}
          <button
            onClick={() => navigate('/create-ticket')}
            className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            + Create New Ticket
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Tickets</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"
              placeholder="Search by subject or message..."
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters (Admin only) */}
      {user.role === 'admin' && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
              <input
                type="email"
                name="userEmail"
                value={filters.userEmail}
                onChange={handleFilterChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"
                placeholder="Filter by user"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-2 text-gray-600">Loading tickets...</span>
        </div>
      ) : (
        <>
          {/* Tickets list */}
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎫</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500 mb-4">
                {user.role === 'admin' 
                  ? 'No tickets match your current filters.' 
                  : "You haven't created any tickets yet."}
              </p>
              <button
                onClick={() => navigate('/create-ticket')}
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      {user.role === 'admin' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer">
                        <td 
                          className="px-6 py-4"
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            #{ticket.id} - {ticket.subject}
                          </div>
                          <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                            {ticket.message}
                          </div>
                          {ticket.comment_count > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              💬 {ticket.comment_count} comment{ticket.comment_count !== 1 ? 's' : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(ticket.category)}`}>
                            {getCategoryDisplayName(ticket.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        {user.role === 'admin' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ticket.user_email}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(ticket.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/tickets/${ticket.id}`);
                              }}
                              className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                            >
                              View
                            </button>
                            {user.role === 'admin' && (
                              <select
                                value={ticket.status}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                                className="text-xs border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}    </div>
  );
};

export default TicketList;


