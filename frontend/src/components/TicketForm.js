import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TicketForm = ({ user }) => {
  const navigate = useNavigate();  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  });
  const [attachments, setAttachments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/tickets/meta/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Set default categories if API fails
      setCategories([
        { id: 1, name: 'general', description: 'General inquiries' },
        { id: 2, name: 'technical', description: 'Technical support' },
        { id: 3, name: 'billing', description: 'Billing issues' },
        { id: 4, name: 'account', description: 'Account management' },
        { id: 5, name: 'feature_request', description: 'Feature requests' },
        { id: 6, name: 'bug_report', description: 'Bug reports' }
      ]);
    }
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
                           'application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'text/plain', 'application/zip', 'application/x-rar-compressed'];
      
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} has an unsupported type. Please upload images, documents, or archives only.`);
        return false;
      }
      
      return true;
    });
    
    setAttachments(prevAttachments => [...prevAttachments, ...validFiles]);
    setError(''); // Clear error if files are valid
  };

  const removeAttachment = (index) => {
    setAttachments(prevAttachments => prevAttachments.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (ticketId) => {
    for (const file of attachments) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        await axios.post(`/tickets/${ticketId}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } catch (error) {
        console.error('Failed to upload attachment:', file.name, error);
        // Continue with other uploads even if one fails
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create the ticket first
      const ticketResponse = await axios.post('/tickets', formData);
      const ticketId = ticketResponse.data.id;
      
      // Upload attachments if any
      if (attachments.length > 0) {
        await uploadAttachments(ticketId);
      }
      
      setSuccess('Ticket created successfully! Redirecting...');
      
      // Reset form
      setFormData({
        subject: '',
        message: '',
        priority: 'medium',
        category: 'general'
      });
      setAttachments([]);
      
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
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.description}
                  </option>
                ))}
              </select>
            </div>            <div>
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

            <div>
              <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
                Attachments
              </label>
              <input
                type="file"
                id="attachments"
                multiple
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload images, documents, or archives (max 10MB per file)
              </p>
              
              {attachments.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">📎</span>
                          <span className="text-sm text-gray-800">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
