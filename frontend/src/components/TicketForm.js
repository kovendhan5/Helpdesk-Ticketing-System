import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TicketForm = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/tickets', formData);
      setSuccess('Ticket created successfully! Redirecting...');
      
      // Reset form
      setFormData({
        subject: '',
        message: '',
        priority: 'medium'
      });
      
      // Redirect to tickets list after 2 seconds
      setTimeout(() => {
        navigate('/tickets');
      }, 2000);
    } catch (error) {
      setError(
        error.response?.data?.error || 'Failed to create ticket. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
            <button
              onClick={() => navigate('/tickets')}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              ← Back to Tickets
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority *
              </label>
              <select
                id="priority"
                name="priority"
                required
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(formData.priority)}`}>
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"
                placeholder="Detailed description of the issue you're experiencing..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Provide as much detail as possible to help us resolve your issue quickly.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Submitting as: <strong>{user.email}</strong>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/tickets')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketForm;
